FROM node:11-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY test ./test
ENV SLEEP_TIMER 5
CMD sh -c "sleep $SLEEP_TIMER && yarn start"
