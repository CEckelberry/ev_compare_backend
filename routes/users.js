"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: login
 **/

router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: login
 **/

router.get("/", async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Authorization required: login
 **/

router.get("/:googleid", async function (req, res, next) {
  try {
    console.log(`/users/:googleid req: ${req.params.googleid} , res:${res}`)
    const user = await User.get(req.params.googleid);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});



/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: login
 **/

router.patch("/:username", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: login
 **/

router.delete("/:googleid", async function (req, res, next) {
  try {
    await User.remove(req.params.googleid);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});


/** POST /[username]/jobs/[id]  { state } => { application }
 *
 * Returns {"applied": jobId}
 *
 * Authorization required: admin or same-user-as-:username
 * */
 router.get("/:googleid/favorites", async function (req, res, next) {
  try {
    console.log(`/users/:googleid/favorites req: ${req.params.googleid} , res:${res}`)
    const favs = await User.getFavs(req.params.googleid);
    console.log(`favs: ${Array.from(favs)}`)
    return res.send(favs);
  } catch (err) {
    return next(err);
  }
});


 router.post("/:googleid/evs/:id", async function (req, res, next) {
  try {
    console.log("in .post(/:googleid/evs/:id")
    const vehicle_id = +req.params.id;
    await User.addToFav(req.params.googleid, vehicle_id);
    return res.json({ added: vehicle_id });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:googleid/evs/:id", async function (req, res, next) {
  try {
    const vehicle_id = +req.params.id;
    await User.removeFav(req.params.googleid, vehicle_id);
    return res.json({ deleted: req.params.googleid + vehicle_id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
