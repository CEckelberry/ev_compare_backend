"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class EVS {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(make=null, model=null, body_type=null, price=null, range=null) {
    
    let query2 = `SELECT DISTINCT ON (veh.id) veh.id,
                  veh.make,
                  veh.model,
                  veh.safety_rating,
                  veh.length,
                  veh.width,
                  veh.height,
                  veh.body_type,
                  veh.chargeport,
                  veh.year,
                  veh.car_image,
                  v.price,
                  v.range,
                  v.battery_capacity
           FROM vehicles veh
              RIGHT JOIN versions as v ON v.model_id = veh.id`;
    let whereExpressions = [];
    let queryValues = [];


    if (make) {
      queryValues.push(`%${make}%`);
      whereExpressions.push(`veh.make ILIKE $${queryValues.length}`);
    }

    if (model) {
      queryValues.push(`%${model}%`);
      whereExpressions.push(`veh.model ILIKE $${queryValues.length}`);
    }

    if (body_type) {
      queryValues.push(`%${body_type}%`);
      whereExpressions.push(`veh.body_type ILIKE $${queryValues.length}`);
    }

    if (price) {
      queryValues.push(`%${price}%`);
      whereExpressions.push(`v.price BETWEEN $${queryValues.length}`);
    }
    if (range) {
      queryValues.push(`%${range}%`);
      whereExpressions.push(`v.range ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query2 += " WHERE " + whereExpressions.join(" OR ");
    }

    console.log('make: ', make)
    console.log('model: ', model)
    console.log('price: ', price)
    console.log('range: ', range)
    console.log('body_type: ', body_type)
    console.log('whereExpressions:', whereExpressions)
    console.log('queryValues:', queryValues)

    query2 += " GROUP BY veh.id, v.price, v.range, v.battery_capacity";
    console.log('query2:', query2)
    // console.log('db.query:', await db.query(query2, queryValues))
    const EVRes = await db.query(query2, queryValues);
    return EVRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const evRes = await db.query(
          `SELECT veh.id,
                  veh.make,
                  veh.model,
                  veh.safety_rating,
                  veh.length,
                  veh.width,
                  veh.height,
                  veh.body_type,
                  veh.chargeport,
                  veh.year,
                  veh.car_image,
                  v.id,
                  v.version_name,
                  v.price,
                  v.range,
                  v.battery_capacity,
                  v.efficiency,
                  v.seats,
                  v.weight,
                  v.charge_time,
                  v.available_now,
                  v.acceleration,
                  v.power,
                  v.torque,
                  v.drive,
                  v.towing_capacity
          FROM vehicles veh
              LEFT JOIN versions as v ON v.model_id = veh.id
          WHERE veh.id = $1
          ORDER BY v.range`,
                [id]);

    const ev = evRes.rows;
    console.log(ev)

    if (!ev) throw new NotFoundError(`No ev: ${id}`);

    return ev;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = EVS;
