FROM node:alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 9876
EXPOSE 27017
ENV MONGO_HOST="192.168.0.8:27017"
CMD [ "npm", "start" ]
