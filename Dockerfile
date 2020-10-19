FROM node:12-alpine

ADD . /project
WORKDIR /project
RUN npm install && npm run build

CMD ["node", "/project/dist/app.js"]
