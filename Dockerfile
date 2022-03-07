FROM node:16-alpine
WORKDIR /auth
COPY . /auth
RUN rm -rf .yarn/cache
RUN rm -rf .yarn/unplugged
RUN yarn set version 3.1.1
RUN yarn install