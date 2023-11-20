FROM node:14
WORKDIR /code
ENV PORT 80
COPY package.json /code/package.json
RUN npm install
COPY . /code
CMD ["node", "index.js"]
EXPOSE 5000
