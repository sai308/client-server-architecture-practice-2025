# === Config ===
COMPOSE      ?= docker compose
APP_SERVICE  ?= app
APP_REPLICAS ?= 4

# Default service for shell/logs if not specified
SERVICE ?= $(APP_SERVICE)

# === Public targets ===
# Makefile hint: "These names are always targets, not files on disk."
.PHONY: help up up1 up4 down restart logs logs-app logs-nginx ps build rebuild shell clean prune

help:
	@echo "Useful targets:"
	@echo "  make up            - Start stack with $(APP_REPLICAS) app replicas (override with APP_REPLICAS=N)"
	@echo "  make up1           - Start stack with 1 app replica"
	@echo "  make up4           - Start stack with 4 app replicas"
	@echo "  make down          - Stop and remove containers, keep volumes"
	@echo "  make restart       - Restart all services"
	@echo "  make logs          - Tail logs for all services (Ctrl+C to stop)"
	@echo "  make logs-app      - Tail logs for app service only"
	@echo "  make logs-nginx    - Tail logs for nginx service only"
	@echo "  make ps            - Show running services"
	@echo "  make build         - Build images"
	@echo "  make rebuild       - Rebuild images without cache"
	@echo "  make shell         - Shell into a container (SERVICE=app|nginx|...)"
	@echo "  make clean         - Remove containers + volumes for this project"
	@echo "  make prune         - Aggressive Docker prune (dangling images, volumes, networks)"

# === Stack lifecycle ===

# Start stack with scaling (default APP_REPLICAS=4, can override: APP_REPLICAS=2 make up)
up:
	$(COMPOSE) up -d --scale $(APP_SERVICE)=$(APP_REPLICAS)

# Convenience presets
up1:
	$(MAKE) up APP_REPLICAS=1

up4:
	$(MAKE) up APP_REPLICAS=4

down:
	$(COMPOSE) down --remove-orphans

restart:
	$(COMPOSE) restart

ps:
	$(COMPOSE) ps

# === Build ===
build:
	$(COMPOSE) build

rebuild:
	$(COMPOSE) build --no-cache

# === Logs & shell ===

logs:
	$(COMPOSE) logs -f

logs-app:
	$(COMPOSE) logs -f $(APP_SERVICE)

logs-nginx:
	$(COMPOSE) logs -f nginx

# Shell into a running container:
#   make shell                # defaults to SERVICE=app
#   make shell SERVICE=nginx  # shell into nginx
shell:
	$(COMPOSE) exec $(SERVICE) sh

# === Cleanup ===

# Remove containers + named volumes from this compose project
clean:
	$(COMPOSE) down -v --remove-orphans

# Global-ish prune - be careful on shared Docker host
prune:
	docker system prune -f
	docker volume prune -f
