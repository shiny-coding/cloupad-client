FROM node:latest
WORKDIR /cloupad

RUN npm install -g serve
ADD https://api.github.com/repos/shiny-coding/cloupad-client/git/refs/heads/main version.json
RUN git clone https://github.com/shiny-coding/cloupad-client

WORKDIR /cloupad/cloupad-client

RUN npm i
RUN npm run build

CMD [ "serve", "-s", "-n", "build" ]
