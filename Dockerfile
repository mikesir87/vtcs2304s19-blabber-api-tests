FROM node:11-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY test ./test
CMD sh -c "sleep 5 && yarn start"
