FROM node:22

# Create and set the working directory inside the container
WORKDIR /srv/app

# Install nodemon globally for development environment
RUN npm install -g nodemon

# Copy package.json (+ package-lock.json) and install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY --chown=node:node . .

# Switch to the node user
USER node

# Expose the the app runs on an debugging port
EXPOSE 3000 9229

# Set the NODE_ENV environment variable to development by default
ENV NODE_ENV=development

# Use nodemon for automatic server reloads in development
CMD ["npm", "run", "dev"]