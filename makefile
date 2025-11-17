# === Config ===
COMPOSE      ?= docker compose
COMPOSE_DEV  ?= docker compose -f docker-compose.yml
COMPOSE_PROD ?= docker compose -f docker-compose.prod.yml
APP_SERVICE  ?= app
APP_REPLICAS ?= 4

# Default service for shell/logs if not specified
SERVICE ?= $(APP_SERVICE)

# === Public targets ===
.PHONY: help up up1 up4 down restart logs logs-app logs-nginx ps build rebuild shell clean prune \
        prod-up prod-up1 prod-up4 prod-down prod-restart prod-logs prod-ps prod-build prod-rebuild \
        prod-deploy prod-scale prod-health status

help:
	@echo "=== Development Commands ==="
	@echo "  make up            - Start dev stack with $(APP_REPLICAS) app replicas (override with APP_REPLICAS=N)"
	@echo "  make up1           - Start dev stack with 1 app replica"
	@echo "  make up4           - Start dev stack with 4 app replicas"
	@echo "  make down          - Stop and remove dev containers, keep volumes"
	@echo "  make restart       - Restart all dev services"
	@echo "  make logs          - Tail logs for all dev services (Ctrl+C to stop)"
	@echo "  make logs-app      - Tail logs for app service only"
	@echo "  make logs-nginx    - Tail logs for nginx service only"
	@echo "  make ps            - Show running dev services"
	@echo "  make build         - Build dev images"
	@echo "  make rebuild       - Rebuild dev images without cache"
	@echo "  make shell         - Shell into a dev container (SERVICE=app|nginx|...)"
	@echo ""
	@echo "=== Production Commands ==="
	@echo "  make prod-deploy   - Deploy production stack (build + up with 4 replicas)"
	@echo "  make prod-up       - Start prod stack with $(APP_REPLICAS) app replicas"
	@echo "  make prod-up1      - Start prod stack with 1 app replica"
	@echo "  make prod-up4      - Start prod stack with 4 app replicas"
	@echo "  make prod-down     - Stop and remove prod containers, keep volumes"
	@echo "  make prod-restart  - Restart all prod services"
	@echo "  make prod-logs     - Tail logs for all prod services"
	@echo "  make prod-ps       - Show running prod services"
	@echo "  make prod-build    - Build prod images"
	@echo "  make prod-rebuild  - Rebuild prod images without cache"
	@echo "  make prod-scale    - Scale app service (APP_REPLICAS=N make prod-scale)"
	@echo "  make prod-health   - Check health status of all prod services"
	@echo ""
	@echo "=== General Commands ==="
	@echo "  make status        - Show status of both dev and prod environments"
	@echo "  make clean         - Remove dev containers + volumes for this project"
	@echo "  make prune         - Aggressive Docker prune (dangling images, volumes, networks)"

# === Stack lifecycle ===

# Development environment
up:
	$(COMPOSE_DEV) up -d --scale $(APP_SERVICE)=$(APP_REPLICAS)

# Convenience presets
up1:
	$(MAKE) up APP_REPLICAS=1

up4:
	$(MAKE) up APP_REPLICAS=4

down:
	$(COMPOSE_DEV) down --remove-orphans

restart:
	$(COMPOSE_DEV) restart

ps:
	$(COMPOSE_DEV) ps

# === Production Stack Lifecycle ===

# Production deployment - build and start
prod-deploy:
	@echo "Building production images..."
	$(COMPOSE_PROD) build
	@echo "Starting production stack with 4 replicas..."
	$(COMPOSE_PROD) up -d --scale $(APP_SERVICE)=4
	@echo "Waiting for services to be healthy..."
	@sleep 5
	@$(MAKE) prod-health

# Production environment
prod-up:
	$(COMPOSE_PROD) up -d --scale $(APP_SERVICE)=$(APP_REPLICAS)

prod-up1:
	$(MAKE) prod-up APP_REPLICAS=1

prod-up4:
	$(MAKE) prod-up APP_REPLICAS=4

prod-down:
	$(COMPOSE_PROD) down --remove-orphans

prod-restart:
	$(COMPOSE_PROD) restart

prod-ps:
	$(COMPOSE_PROD) ps

# Scale production app instances
prod-scale:
	@echo "Scaling app service to $(APP_REPLICAS) replicas..."
	$(COMPOSE_PROD) up -d --scale $(APP_SERVICE)=$(APP_REPLICAS) --no-recreate

# === Build ===
build:
	$(COMPOSE_DEV) build

rebuild:
	$(COMPOSE_DEV) build --no-cache

# Production builds
prod-build:
	$(COMPOSE_PROD) build

prod-rebuild:
	$(COMPOSE_PROD) build --no-cache

# === Logs & shell ===

logs:
	$(COMPOSE_DEV) logs -f

logs-app:
	$(COMPOSE_DEV) logs -f $(APP_SERVICE)

logs-nginx:
	$(COMPOSE_DEV) logs -f nginx

# Production logs
prod-logs:
	$(COMPOSE_PROD) logs -f

prod-logs-app:
	$(COMPOSE_PROD) logs -f $(APP_SERVICE)

prod-logs-nginx:
	$(COMPOSE_PROD) logs -f nginx

# Shell into a running container:
#   make shell                # defaults to SERVICE=app
#   make shell SERVICE=nginx  # shell into nginx
shell:
	$(COMPOSE_DEV) exec $(SERVICE) sh

prod-shell:
	$(COMPOSE_PROD) exec $(SERVICE) sh

# === Health & Status ===

# Check health status of production services
prod-health:
	@echo "=== Production Health Status ==="
	@$(COMPOSE_PROD) ps

# Show status of both environments
status:
	@echo "=== Development Environment ==="
	@$(COMPOSE_DEV) ps
	@echo ""
	@echo "=== Production Environment ==="
	@$(COMPOSE_PROD) ps

# === Cleanup ===

# Remove containers + named volumes from this compose project
clean:
	$(COMPOSE_DEV) down -v --remove-orphans

# Remove production containers + volumes
prod-clean:
	$(COMPOSE_PROD) down -v --remove-orphans

# Global-ish prune - be careful on shared Docker host
prune:
	docker system prune -f
	docker volume prune -f
