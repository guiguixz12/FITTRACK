FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p /data /app/uploads

ENV PORT=3000
ENV DB_PATH=/data/fit.sqlite
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]
