FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev && npm run build

COPY . .
RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start" ]

