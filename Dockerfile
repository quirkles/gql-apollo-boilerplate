FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./

COPY ./src ./src
COPY ./config ./config

RUN npm install && npm run build && mkdir data && mkdir logs

CMD ["node", "./dist/index.js"]
