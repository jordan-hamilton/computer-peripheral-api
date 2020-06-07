const path = require("path");
const express = require("express");
const session = require("express-session");

const { COMPUTERS_PATH, PERIPHERALS_PATH, USERS_PATH } = require("./config");

const indexRouter = require("./routes/index");
const computersRouter = require("./routes/computers");
const peripheralsRouter = require("./routes/peripherals");
const usersRouter = require("./routes/users");

const server = express();

server.enable("trust proxy");

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "public")));

const expressSession = {
  secret: "hamiltj2",
  cookie: {},
  resave: false,
  saveUninitialized: true,
};
server.use(session(expressSession));

server.use("/", indexRouter);
server.use(COMPUTERS_PATH, computersRouter);
server.use(PERIPHERALS_PATH, peripheralsRouter);
server.use(USERS_PATH, usersRouter);

server.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).end();
  }
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

module.exports = server;
