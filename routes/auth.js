"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError } = require("../expressError");
const passport = require("passport");
const passportSetup = require('../middleware/auth')
const url = require('url');   

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { googleid } = req.body;
    console.log(`in /token (${googleid})`)
    const user = await User.authenticate(googleid);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});


// /** POST /auth/register:   { user } => { token }
//  *
//  * user must include { username, password, firstName, lastName, email }
//  *
//  * Returns JWT token which can be used to authenticate further requests.
//  *
//  * Authorization required: none
//  */

// router.post("/register", async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(req.body, userRegisterSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map(e => e.stack);
//       throw new BadRequestError(errs);
//     }

//     const newUser = await User.register({ ...req.body, isAdmin: false });
//     const token = createToken(newUser);
//     return res.status(201).json({ token });
//   } catch (err) {
//     return next(err);
//   }
// });

router.get('/google',
  passport.authenticate('google', { scope: ['profile'], session: false }));

router.get('/google/redirect', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  function(req, res, next) {
    // Successful authentication, redirect home.
    try {
    // console.log(req)
    let user = req.user
    console.log(user)
    const token = createToken(user);
    console.log("token issued")
    return res.redirect(url.format({
      pathname: "http://localhost:3000/finishlogin/",
      query: {
        "googleid": user.googleid,
      }
    }));
  } catch (err){
    return next(err);
  }
  });



module.exports = router;
