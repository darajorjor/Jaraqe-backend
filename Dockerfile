FROM node:latest

WORKDIR /app

COPY package*.json /app
COPY .babelrc /app
COPY src /app/src
COPY migrations /app/migrations

RUN npm install -g yarn
RUN yarn
RUN yarn run build

CMD yarn run start:prod

RUN rm -rf src

EXPOSE 3000
