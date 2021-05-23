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

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

// router.post("/token", async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(req.body, userAuthSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map(e => e.stack);
//       throw new BadRequestError(errs);
//     }

//     const { username, password } = req.body;
//     const user = await User.authenticate(username, password);
//     const token = createToken(user);
//     return res.json({ token });
//   } catch (err) {
//     return next(err);
//   }
// });


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

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

router.get('/auth/google/redirect', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });



module.exports = router;