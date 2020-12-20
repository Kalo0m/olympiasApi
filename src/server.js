const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const resolvers = require("./resolver");
const typeDefs = require("./schema");
const path = require("path");
const mail = require("./mail.js");
const app = express();
app.disable("x-powered-by");
app.use(cookieParser());
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.get("/status", (req, res) => {
  res.status(200).send("OK");
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: process.env.NODE_ENV === "developpement",
});

server.applyMiddleware({
  app,
});

app.listen(
  {
    port: process.env.PORT || 4000,
  },
  () => {
    console.log(
      `🚀 Server ready at http://localhost:${process.env.PORT || 4000}${
        server.graphqlPath
      }`
    );
  }
);
