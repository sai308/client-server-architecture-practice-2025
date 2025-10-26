FROM node:22.21.0

# Set SHELL environment variable to a supported shell
ENV SHELL=/bin/bash

# Install pnpm globally using corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set PNPM_HOME to define the global bin directory and add it to PATH
ENV PNPM_HOME=/node/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

# Run pnpm setup to configure global bin directory
RUN pnpm setup

# Install nodemon globally for development environment
RUN pnpm install -g nodemon

# Create and set the working directory inside the container
WORKDIR /srv/app

# Install nodemon globally for development environment
RUN npm install -g nodemon

# Copy package.json (+ package-lock.json) and install dependencies
COPY package*.json ./

# Fetch dependencies for caching, without creating a node_modules folder
RUN pnpm fetch

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY --chown=node:node . .

# Switch to the node user
USER node

# Expose the the app runs on an debugging port
EXPOSE 3000 9229

# Set the NODE_ENV environment variable to development by default
ENV NODE_ENV=development

# Use nodemon for automatic server reloads in development
CMD ["pnpm", "run", "dev"]