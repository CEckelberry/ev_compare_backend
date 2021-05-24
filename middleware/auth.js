"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY, GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID } = require("../config");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { UnauthorizedError } = require("../expressError");
const User = require("../models/user");


console.log(`SECRET_KEY: ${SECRET_KEY}`)

passport.serializeUser((user, done) => {
  console.log("in serializer")
  done(null, user.googleid||user.id);
});

passport.deserializeUser((googleid, done) => {
  User.get(googleid), function (err, user) {
      console.log("in deserializer")
      done(null, user);
  };
});

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/redirect"
},
function(accessToken, refreshToken, profile, done) {
  
    User.get(profile.id).then((currentUser) => {
      console.log(`currentUser: ${currentUser}`)
    
    if(currentUser !== null){
      console.log("in currentUser if")
      done(null, currentUser)
    }

    else{
      User.register({username: profile.displayName, firstName: profile.name.givenName, lastName: profile.name.familyName, googleid: profile.id, profile_image: profile.photos[0].value})
      .then((newUser) => {
          console.log("in User.register else")
          console.log(accessToken, refreshToken)
          done(null, newUser) 
        })

  console.log(profile)
      }
}
)}));



/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** OLD Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}






module.exports = {
  authenticateJWT,
  ensureLoggedIn,
};