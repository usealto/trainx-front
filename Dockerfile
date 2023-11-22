# Base image from node
FROM node:18

# Expose port
EXPOSE 4200

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

RUN npm install -g @angular/cli

ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Bundle app source
COPY . .

# Build and start
RUN npm run build
