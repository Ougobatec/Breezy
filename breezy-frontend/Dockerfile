FROM node:latest
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY .env.production .env.production
RUN npm run build
CMD [ "npm", "start" ]