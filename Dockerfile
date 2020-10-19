FROM node:12-alpine

ADD dist /project
ADD .env /project

EXPOSE 80
CMD ["node", "/project/app.js"]
