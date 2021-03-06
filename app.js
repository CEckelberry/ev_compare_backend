"use strict";

/** Express app for jobly. */

const express = require("express");
const cors = require("cors");
const cookieSession = require('cookie-session');

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const evsRoutes = require("./routes/evs");
const usersRoutes = require("./routes/users");
const SESSION = require("./config")

const morgan = require("morgan");

const app = express();

app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys:[SESSION]
}))

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/evs", evsRoutes);
app.use("/users", usersRoutes);


/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
