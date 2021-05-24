"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const SESSION = process.env.SESSION;

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3001;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
      ? "evs_test"
      : process.env.DATABASE_URL || "evs";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;


console.log("Evs Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);


// console.log(`GOOGLE_AUTH_SECRET: ${GOOGLE_AUTH_SECRET}`);
// console.log(`GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}`);

console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  SESSION
};
