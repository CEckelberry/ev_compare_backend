"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(googleid) {
    // try to find the user first
    const result = await db.query(
          `SELECT googleid,
          username,
          first_name AS "firstName",
          last_name AS "lastName",
          email,
          is_admin AS "isAdmin"
          FROM users
          WHERE googleid = $1`,
          [googleid],
    );
    console.log(`in authenticate (googleid)`)
    const user = result.rows[0];
    console.log(`user: ${user}, googleid: ${googleid}`)
    if (user) {
      return user
    }

    throw new UnauthorizedError("Invalid user");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
      { username, firstName, lastName, email, googleid, profile_image, isAdmin=false }) {
        console.log("in user model register")
    const duplicateCheck = await db.query(
          `SELECT googleid
           FROM users
           WHERE googleid = $1`,
        [googleid],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate googleid: ${googleid}`);
    }

    const result = await db.query(
          `INSERT INTO users
           (username,
            first_name,
            last_name,
            googleid,
            profile_image,
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, first_name AS "firstName", last_name AS "lastName", googleid, is_admin AS "isAdmin"`,
        [
          username,
          firstName,
          lastName,
          googleid,
          profile_image,
          isAdmin,
        ],
    );
    console.log("in user model register after result")
    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  googleid,
                  is_admin AS "isAdmin"
           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, is_admin, jobs }
   *   where jobs is { id, title, company_handle, company_name, state }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(googleid) {
    console.log("in get(googleid)")
    const userRes = await db.query(
          `SELECT googleid,
                  username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  profile_image,
                  is_admin AS "isAdmin"
           FROM users
           WHERE googleid = $1`,
        [googleid],
    );

    const user = userRes.rows[0];
    console.log(`user result: ${user}`)
    if (!user) return null;

    return user;
  }


  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
        });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(googleid) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE googleid = $1
           RETURNING googleid`,
        [googleid],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
    
  }


  /** FAVORITES SECTION
   * 
   * GET all favorites associated with user
   */
  static async getFavs(googleid) {
    console.log("in getFavs(googleid)")
    const favRes = await db.query(
          `SELECT usr.googleid,
                  usr.username,
                  usr.first_name AS "firstName",
                  usr.last_name AS "lastName",
                  usr.email,
                  usr.profile_image,
                  usr.is_admin AS "isAdmin",
                  fav.vehicle_id
           FROM users usr
              LEFT JOIN favorites as fav ON fav.googleid = usr.googleid
           WHERE usr.googleid = $1`,
        [googleid],
    );

    const favorites = favRes.rows;
    let favoriteids = [];
    
    
    if (!favorites) return null;

    for(let i = 0; i < favorites.length; i++){
      favoriteids.push(favorites[i].vehicle_id)
    }



    let typey = typeof(favoriteids);

    console.log(`favorites result: ${favoriteids}`)
    console.log(`favorites result type: ${typey}`)

    return favoriteids;
  }



  static async removeFav(googleid, vehicle_id ) {
    let result = await db.query(
          `DELETE
           FROM favorites
           WHERE googleid = $1
           AND vehicle_id = $2
           RETURNING googleid, vehicle_id`,
        [googleid, vehicle_id],
    );
    const userFav = result.rows[0];

    if (!userFav) throw new NotFoundError(`No user + favorite found: ${googleid}  ${vehicle_id}`);
  }


  static async addToFav(googleid, vehicle_id) {
    const duplicateCheck = await db.query(
      `SELECT googleid
       FROM favorites
       WHERE googleid = $1
       AND vehicle_id = $2`,
    [googleid, vehicle_id],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate googleid + vehicle_id: ${googleid}`);
    }

    const preCheck = await db.query(
          `SELECT id
           FROM vehicles
           WHERE id = $1`, [vehicle_id]);
    const ev = preCheck.rows[0];

    if (!ev) throw new NotFoundError(`No ev: ${vehicle_id}`);

    const preCheck2 = await db.query(
          `SELECT googleid
           FROM users
           WHERE googleid = $1`, [googleid]);
    const user = preCheck2.rows[0];

    if (!user) throw new NotFoundError(`No google_id: ${googleid}`);

    await db.query(
          `INSERT INTO favorites (vehicle_id, googleid)
           VALUES ($1, $2)`,
        [vehicle_id, googleid]);
  }
}




module.exports = User;
