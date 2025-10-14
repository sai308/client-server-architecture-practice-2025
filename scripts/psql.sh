#!/bin/bash
set -e

# Dynamically fetch the container name
POSTGRES_SERVICE=$(docker ps --format '{{.Names}}' | grep postgres)

# Load environment variables from the project root .env file
ENV_FILE=".env"
if [ -f $ENV_FILE ]; then
  export $(grep -v '^#' $ENV_FILE | xargs)
else
  echo "Error: .env file not found at $ENV_FILE"
  exit 1
fi

# Check if the container is running
if [ -z "$POSTGRES_SERVICE" ]; then
  echo "Error: No running container found for the 'postgres' service."
  exit 1
fi

echo "Entering PostgreSQL shell..."
docker exec -it $POSTGRES_SERVICE psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}