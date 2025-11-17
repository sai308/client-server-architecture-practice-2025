# Production Deployment Guide

This guide covers deploying the application in production with Docker, Docker Compose, and Nginx load balancing.

## 📋 Table #### App Service

- **Replicas**: 4 instances by default
- **Resource Limits**:
  - CPU: 1.5 (limit) / 0.75 (reservation)
  - Memory: 768MB (limit) / 384MB (reservation)
- **Restart Policy**: On failure (max 3 attempts)
- **Health Checks**: `/api/health` endpoint
- **Networks**: Connected to web_net and app_subnet
- **Database Connection Pools**:
  - PostgreSQL: 20 connections per instance (80 total)
  - MongoDB: 20 connections per instance (80 total)
  - Connection pooling with keepalive and recyclingts

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration Files](#configuration-files)
- [Deployment Commands](#deployment-commands)
- [Scaling](#scaling)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## 🏗️ Architecture Overview

The production deployment consists of:

- **4x Node.js App Instances** - Load-balanced application servers
- **1x Nginx** - Reverse proxy and load balancer
- **1x PostgreSQL** - Primary database
- **1x MongoDB** - Document store
- **1x Redis** - Cache and session store

### Load Balancing

Nginx distributes traffic across 4 app instances using the **least connections** algorithm:

- Traffic is routed to the server with the fewest active connections
- Automatic failover if an instance becomes unhealthy
- Health checks every 30 seconds on `/api/health`

### Network Architecture

```
┌─────────────────────────────────────────────────┐
│                   Internet                      │
└──────────────────┬──────────────────────────────┘
                   │ ports 80/443
                   ▼
            ┌──────────────┐
            │    Nginx     │ (SSL/TLS termination)
            └──────┬───────┘
                   │ Load Balancer (least_conn)
        ┌──────────┼──────────┬──────────┐
        ▼          ▼          ▼          ▼
    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐
    │App 1│    │App 2│    │App 3│    │App 4│
    └──┬──┘    └──┬──┘    └──┬──┘    └──┬──┘
       │          │          │          │
       └──────────┴──────────┴──────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
┌────────┐   ┌────────┐   ┌───────┐
│Postgres│   │MongoDB │   │ Redis │
└────────┘   └────────┘   └───────┘
```

## ✅ Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- SSL/TLS certificates in `nginx/secrets/certs/`
- `.htpasswd` file for API docs authentication
- `.env` file with required environment variables

### Environment Variables

Create a `.env` file in the project root:

```env
# PostgreSQL
POSTGRES_DB=your_database_name
POSTGRES_USER=your_database_user
POSTGRES_PASSWORD=your_secure_password

# Optional: Development PostgreSQL port
DEV_POSTGRES_PORT=5432:5432

# Optional: Development MongoDB port
DEV_MONGO_PORT=27017:27017
```

### SSL Certificates

Place your SSL certificates in:

- `nginx/secrets/certs/server.crt`
- `nginx/secrets/certs/server.key`

For development/testing, you can generate self-signed certificates:

```bash
mkdir -p nginx/secrets/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/secrets/certs/server.key \
  -out nginx/secrets/certs/server.crt
```

### API Documentation Authentication

Generate `.htpasswd` file:

```bash
# Using htpasswd (if available)
htpasswd -c nginx/secrets/.htpasswd admin

# Or use online generator: https://hostingcanada.org/htpasswd-generator/
```

## 🚀 Quick Start

Deploy the production stack with 4 app replicas:

```bash
make prod-deploy
```

This command will:

1. Build the production Docker image
2. Start all services (app×4, nginx, postgres, mongo, redis)
3. Wait for services to become healthy
4. Display health status

Access the application:

- **HTTPS**: https://localhost
- **HTTP**: http://localhost (redirects to HTTPS)
- **API Docs**: https://localhost/api/reference/ (requires authentication)

## 📁 Configuration Files

### `Dockerfile.prod`

Production-optimized Docker image with:

- **Multi-stage build** for minimal image size
- **Only production dependencies** (no dev tools)
- **Non-root user** for security
- **Health checks** using curl
- **No debug ports** exposed

Key optimizations:

- Base image: `node:22.21.0-slim`
- Final image size: ~300MB (vs ~800MB dev image)
- No source code hot-reloading
- Optimized for stability and security

### `docker-compose.prod.yml`

Production compose configuration featuring:

#### App Service

- **Replicas**: 4 instances by default
- **Resource Limits**:
  - CPU: 1.5 (limit) / 0.5 (reservation)
  - Memory: 768MB (limit) / 256MB (reservation)
- **Restart Policy**: On failure (max 3 attempts)
- **Health Checks**: `/health` endpoint
- **Networks**: Connected to web_net and app_subnet
- **Database Connection Pooling**:
  - PostgreSQL: 20 max connections per instance
  - MongoDB: 20 max connections per instance

#### Nginx Service

- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Resource Limits**:
  - CPU: 1.0 (limit) / 0.25 (reservation)
  - Memory: 256MB (limit) / 64MB (reservation)
- **Health Checks**: HTTP health endpoint (no redirect)
- **Performance Optimizations**:
  - Keepalive connections: 64 pool size
  - Keepalive requests: 1000 per connection
  - Proxy buffering: 16x8KB buffers

#### PostgreSQL Service

- **Optimized Settings**:
  - Max connections: 200
  - Shared buffers: 384MB (~25% of memory)
  - Effective cache size: 1152MB (~75% of memory)
  - Work memory: 1966kB
  - Maintenance work memory: 96MB
- **Resource Limits**:
  - CPU: 2.0 (limit) / 0.5 (reservation)
  - Memory: 1536MB (limit) / 512MB (reservation)

#### MongoDB Service

- **WiredTiger Cache**: 1GB
- **Resource Limits**:
  - CPU: 2.0 (limit) / 0.5 (reservation)
  - Memory: 1536MB (limit) / 512MB (reservation)

#### Redis Service

- **Max Memory**: 400MB (doubled for better caching)
- **Eviction Policy**: allkeys-lru
- **Persistence**: AOF enabled (appendfsync everysec)
- **Resource Limits**:
  - CPU: 1.0 (limit) / 0.25 (reservation)
  - Memory: 512MB (limit) / 128MB (reservation)

### `nginx/default.prod.conf`

Production Nginx configuration with:

#### Upstream Load Balancer

```nginx
upstream app_backend {
    least_conn;  # Least connections algorithm
    server app:3000 max_fails=3 fail_timeout=30s;

    # Connection pooling for performance
    keepalive 64;             # Pool of 64 idle connections (16 per instance)
    keepalive_requests 1000;  # Max requests per connection
    keepalive_timeout 60s;    # Keep idle connections for 60s
}
```

#### Security Features

- **TLS 1.2 & 1.3** only
- **Security headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **SSL session caching** for performance
- **Request timeouts**: 60s connect/send/read
- **Basic auth** for API documentation
- **HTTP to HTTPS redirect** (except health check endpoint)

#### Performance Optimizations

- **HTTP/2** enabled
- **Keepalive connections** to backend (64 connection pool)
- **Proxy buffering** optimized (16x8KB buffers)
- **Static file caching** (1 hour)
- **Health check endpoint** on HTTP (no redirect, no logging)

## 🎮 Deployment Commands

All deployment commands are available via the `Makefile`:

### Production Stack Management

```bash
# Deploy/redeploy production (build + start with 4 replicas)
make prod-deploy

# Start production stack
make prod-up              # Default replicas (4)
make prod-up1             # Single instance
make prod-up4             # 4 instances

# Stop production stack
make prod-down

# Restart production services
make prod-restart
```

### Build Commands

```bash
# Build production images
make prod-build

# Rebuild without cache
make prod-rebuild
```

### Monitoring Commands

```bash
# View running services
make prod-ps

# Check health status
make prod-health

# View logs
make prod-logs            # All services
make prod-logs-app        # App only
make prod-logs-nginx      # Nginx only

# Show both dev and prod environments
make status
```

### Shell Access

```bash
# Shell into app container
make prod-shell

# Shell into nginx container
make prod-shell SERVICE=nginx
```

### Cleanup Commands

```bash
# Remove production containers and volumes
make prod-clean

# Global Docker cleanup (use with caution)
make prune
```

## 📈 Scaling

### Manual Scaling

Scale the application to N instances:

```bash
# Scale to 8 instances
make prod-scale APP_REPLICAS=8

# Scale to 2 instances
make prod-scale APP_REPLICAS=2

# Or use predefined commands
make prod-up1    # 1 instance
make prod-up4    # 4 instances
```

### Automatic Scaling

For production deployments, consider:

- **Docker Swarm** for orchestration
- **Kubernetes** for enterprise-grade scaling
- **AWS ECS/EKS** or **GCP GKE** for cloud deployments

### Resource Considerations

Current resource allocation per replica:

- **App**: 0.5-1.5 CPU, 256-768MB RAM
- **Total for 4 replicas**: 2-6 CPUs, 1-3GB RAM
- **Nginx**: 0.25-1.0 CPU, 64-256MB RAM
- **PostgreSQL**: 0.5-2.0 CPU, 512MB-1.5GB RAM
- **MongoDB**: 0.5-2.0 CPU, 512MB-1.5GB RAM
- **Redis**: 0.25-1.0 CPU, 128-512MB RAM

**Total Resources Required**: 5.5-12 CPUs, 4-8GB RAM

Recommended server specs for 4 replicas:

- **CPU**: 8+ cores (12+ recommended for optimal performance)
- **RAM**: 8GB+ (16GB recommended)
- **Disk**: 50GB+ SSD (NVMe preferred)

## 🏥 Monitoring & Health Checks

### Health Check Endpoints

#### Application Health

```bash
# Through nginx (external access - HTTP, no redirect)
curl http://localhost/api/health
# Response: {"status":"OK"}

# Through nginx (HTTPS)
curl -k https://localhost/api/health
# Response: {"status":"OK"}

# Direct to container (internal)
docker exec csa_2025-app-1 curl -f http://localhost:3000/health
# Response: {"status":"OK"}
```

#### Individual Container Health

```bash
# Check health status
docker compose -f docker-compose.prod.yml ps

# View health check logs
docker inspect csa_2025-app-1 | jq '.[0].State.Health'
```

### Health Check Configuration

All services have health checks configured:

- **App Instances**:
  - Endpoint: `/health` (internal)
  - Interval: 30s
  - Timeout: 10s
  - Start period: 40s
  - Retries: 3

- **Nginx**:
  - Endpoint: `http://127.0.0.1:80/api/health`
  - Interval: 30s
  - Timeout: 10s
  - Start period: 10s
  - Retries: 3
  - Note: Health check uses HTTP (no redirect)

- **PostgreSQL**:
  - Command: `pg_isready`
  - Interval: 10s
  - Timeout: 5s
  - Start period: 30s
  - Retries: 5

- **Redis**:
  - Command: `redis-cli ping`
  - Interval: 10s
  - Timeout: 3s
  - Start period: 10s
  - Retries: 5

### Monitoring Logs

```bash
# Real-time logs
make prod-logs

# Filter by service
make prod-logs-app
make prod-logs-nginx

# Follow specific container
docker compose -f docker-compose.prod.yml logs -f app-1

# View last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Containers Exit Immediately

**Symptoms**: App containers start then immediately exit

**Diagnosis**:

```bash
# Check container logs
make prod-logs-app

# Or for specific instance
docker logs csa_2025-app-1
```

**Common Causes**:

- Missing dependencies in `package.json`
- Incorrect `NODE_ENV` setting
- Database connection failures
- Missing environment variables

**Solution**:

```bash
# Rebuild with no cache
make prod-rebuild

# Check environment variables
docker compose -f docker-compose.prod.yml config
```

#### 2. Health Checks Failing

**Symptoms**: Containers show as "unhealthy"

**Diagnosis**:

```bash
# Check health status
make prod-health

# Inspect health check
docker inspect csa_2025-app-1 --format='{{json .State.Health}}'
```

**Solutions**:

- Ensure `/health` endpoint is working in app containers
- Verify nginx health check endpoint is accessible via HTTP
- Check if curl/wget is installed in containers
- Verify network connectivity between containers
- For nginx: ensure health check uses HTTP, not HTTPS (to avoid redirect)

#### 3. Load Balancing Not Working

**Symptoms**: Requests only go to one instance

**Diagnosis**:

```bash
# Check nginx config
docker exec csa_2025-nginx-1 nginx -t

# View nginx logs
make prod-logs-nginx
```

**Solutions**:

- Verify upstream configuration in `nginx/default.prod.conf`
- Ensure all app instances are healthy
- Check DNS resolution for `app` service

#### 4. Database Connection Errors

**Symptoms**: App can't connect to databases

**Diagnosis**:

```bash
# Check database health
docker compose -f docker-compose.prod.yml ps postgres mongo redis

# Test connection from app container
docker exec csa_2025-app-1 nc -zv postgres 5432
docker exec csa_2025-app-1 nc -zv mongo 27017
docker exec csa_2025-app-1 nc -zv redis 6379
```

**Solutions**:

- Verify database services are healthy
- Check environment variables for connection strings
- Ensure app containers are on correct networks

#### 5. SSL Certificate Issues

**Symptoms**: HTTPS errors or certificate warnings

**Diagnosis**:

```bash
# Check certificate
openssl x509 -in nginx/secrets/certs/server.crt -text -noout

# Test SSL connection
openssl s_client -connect localhost:443
```

**Solutions**:

- Regenerate certificates if expired
- Ensure correct file permissions
- Verify nginx has access to certificate files

### Debug Mode

Run a single instance for debugging:

```bash
# Stop production stack
make prod-down

# Start single instance with logs
docker compose -f docker-compose.prod.yml up app

# Or with shell access
docker compose -f docker-compose.prod.yml run --rm app sh
```

### Performance Issues

If experiencing performance problems:

```bash
# Check resource usage
docker stats

# Check specific container resources
docker stats csa_2025-app-1

# Monitor database connections (PostgreSQL)
docker exec csa_2025-app-1 sh -c 'echo "SELECT count(*) FROM pg_stat_activity;" | psql $PG_DATABASE_URL'

# Check Redis memory usage
docker exec csa_2025-redis-1 redis-cli INFO memory

# View nginx upstream status
docker exec csa_2025-nginx-1 cat /etc/nginx/conf.d/default.conf | grep -A 5 "upstream"
```

**Performance Tuning Tips**:

1. **Database Connection Pool**: Already optimized to 20 connections per app instance (80 total)
2. **Nginx Keepalive**: 64 connection pool reduces connection overhead
3. **Resource Limits**: Increased for better performance
   - App: 1.5 CPU, 768MB RAM
   - Databases: 2.0 CPU, 1.5GB RAM
   - Redis: 400MB cache
4. **For Higher Load**: Scale to more app instances
   ```bash
   make prod-scale APP_REPLICAS=8
   ```

## 🔒 Security Considerations

### Production Checklist

- [ ] **SSL/TLS Certificates**: Use valid certificates (not self-signed)
- [ ] **Strong Passwords**: Database passwords, .htpasswd
- [ ] **Environment Variables**: Never commit `.env` to version control
- [ ] **Network Isolation**: app_subnet is internal (no external access)
- [ ] **Non-root User**: All app containers run as `node` user
- [ ] **Security Headers**: X-Frame-Options, CSP, etc. configured
- [ ] **Rate Limiting**: Consider adding nginx rate limiting
- [ ] **Firewall Rules**: Only expose ports 80 and 443
- [ ] **Regular Updates**: Keep dependencies and base images updated
- [ ] **Logging**: Centralize logs for security monitoring
- [ ] **Backup Strategy**: Regular database backups configured

### Security Best Practices

1. **Rotate Secrets Regularly**

   ```bash
   # Update database passwords
   # Regenerate .htpasswd
   # Renew SSL certificates
   ```

2. **Limit Network Exposure**

   ```yaml
   # In docker-compose.prod.yml
   networks:
     app_subnet:
       internal: true # Prevents external access
   ```

3. **Use Secret Management**
   - Consider Docker Secrets (Swarm mode)
   - Or external secret management (Vault, AWS Secrets Manager)

4. **Monitor Security**
   - Review nginx access logs
   - Monitor failed authentication attempts
   - Set up alerts for anomalies

5. **Keep Images Updated**

   ```bash
   # Pull latest base images
   docker pull node:22.21.0-slim
   docker pull nginx:stable-alpine
   docker pull postgres:latest

   # Rebuild
   make prod-rebuild
   ```

## 📝 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Load Balancing](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

## 🆘 Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review container logs: `make prod-logs`
3. Check GitHub Issues
