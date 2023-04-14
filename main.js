const express = require("express");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");
const compression = require("compression");
const topicRouter = require("./routes/topic.js");
const indexRouter = require("./routes/index.js");
const authRouter = require("./routes/auth.js");
const helmet = require("helmet");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
app.use(helmet());

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(
  session({
    secret: "snelfknae@#!@3",
    resave: false,
    saveUninitialized: true,
    store: new FileStore(),
  })
);

var authData = {
  email: "asd@asd.com",
  password: "123123",
  nickname: "dsa",
};

const passport = require("passport");
const localStrategy = require("passport-local");

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function(user, done) {
  console.log('serial : ', user)
})

passport.deserializeUser(function(id, done) {
  console.log('id : ', id)
})

passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "pwd",
    },
    function (username, password, done) {
      console.log("localStrategy", username, password);
      if (username === authData.email) {
        if (password === authData.password) {
          return done(null, authData);
        } else {
          return done(null, false, { message: "Incorrect password" });
        }
      } else {
        return done(null, false, { message: "Incorrect username" });
      }
    }
  )
);

app.post(
  "/auth/login_process",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
  })
);

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
