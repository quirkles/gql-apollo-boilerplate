FROM node:14

WORKDIR /usr/src/app

ARG port=8080

COPY package*.json ./
COPY tsconfig*.json ./

COPY ./src ./src
COPY ./config ./config

ENV ENV=test

ENV PORT=$port

EXPOSE $port

RUN mkdir data && mkdir logs && npm install && npm run build

CMD ["node", "dist/index.js"]
