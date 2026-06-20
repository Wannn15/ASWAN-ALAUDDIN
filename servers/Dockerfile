FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY server.js .

EXPOSE 4001 4002 4003

CMD ["npm", "start"]
