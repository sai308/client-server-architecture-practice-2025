FROM node:22

WORKDIR /srv/app

# install only production deps; falls back if no package-lock
COPY package.json .
RUN npm install --production

# copy app source
COPY . .

EXPOSE 3000

# run your app (expects a start script in package.json)
CMD ["npm", "start"]