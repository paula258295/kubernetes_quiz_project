FROM node:18-alpine

WORKDIR /app

ARG APP_BANNER="Proxy Service"
ENV APP_BANNER=$APP_BANNER

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD echo "$APP_BANNER" && npm run dev