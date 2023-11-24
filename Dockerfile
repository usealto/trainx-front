# Base image from node
FROM node:18

# Expose port
EXPOSE 4200

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# on some macos, it is required to specify this packages (should be useless with npm ci)
RUN npm install -g @angular/cli

# Install app dependencies
RUN npm ci

RUN npm install -g @angular/cli

ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Install angular cli
RUN npm install -g @angular/cli

# Bundle app source
COPY . .

# Build and start
RUN npm run build
