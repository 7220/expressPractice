const express = require("express");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");
const compression = require("compression");
const topicRouter = require("./routes/topic.js");
const indexRouter = require("./routes/index.js");
const authRouter = require("./routes/auth.js");
const helmet = require('helmet')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
app.use(helmet())

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(session({
  secret: 'snelfknae@#!@3',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}))

app.get("*", (request, response, next) => {
  fs.readdir("./data", function (error, filelist) {
    request.list = filelist;
    next();
  });
});

app.use("/", indexRouter);
app.use("/topic", topicRouter);
app.use("/auth", authRouter);

app.use((req, res, next) => {
  res.status(404).send("404");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("500");
});

app.listen(3000, () => console.log("http://localhost:3000"));