FROM node:14-alpine3.12
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
CMD ["npm", "start"]