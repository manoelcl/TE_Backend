const bcrypt = require("bcrypt");
const { query } = require("express");
const { generateError } = require("../helpers");
const { getConnection } = require("./db");

// Devuelve la info de una Recommendations

const getRecommendationByID = async (id) => {
  let connection;

  try {
    connection = await getConnection();

    const [result] = await connection.query(
      `SELECT 
      r.title,
      r.abstract,
      r.content,
      r.lat,
      r.lon,
      r.photo,
      r.class,
      r.creation_date as creationDate,
      (
        SELECT AVG(v.rating)
        FROM vote v
        WHERE v.id_recommendation = r.id 
        GROUP BY v.id_recommendation
      ) as average,
      u.username,
      u.id as userId
      FROM recommendation r
      JOIN user u
      ON r.id_user=u.id
      WHERE r.id=?`,
      [id]
    );

    if (result.length === 0) {
      throw generateError(" No hay ninguna recommendations con esa id", 404);
    }

    return result[0];
  } finally {
    if (connection) connection.release();
  }
};

const listRecommendations = async (distance, lat, lon, classId) => {
  let connection;

  try {
    connection = await getConnection();

    let queryString = `
    SELECT 
    r.id,
    r.title,
    r.abstract,
    r.lat,
    r.lon,
    r.photo,
    r.class,
    u.username,
    (
      SELECT
      AVG(v.rating)
      FROM vote v 
      WHERE v.id_recommendation = r.id 
      GROUP BY v.id_recommendation
    ) AS average,
    (
      6371 *
       acos(cos(radians(?)) * 
       cos(radians(r.lat)) * 
       cos(radians(r.lon) - 
       radians(?)) + 
       sin(radians(?)) * 
       sin(radians(r.lat )))
    ) AS distance 
    FROM recommendation r
    JOIN user u ON r.id_user=u.id
    EXTRAQUERY
    HAVING distance < ? 
    ORDER BY distance LIMIT 0, 20;`;

    queryString = queryString.replace(
      "EXTRAQUERY",
      classId ? "WHERE r.class = ? " : ""
    );
    console.log(classId);
    const queryArray = [lat, lon, lat];
    if (classId) {
      queryArray.push(classId);
    }
    queryArray.push(distance);
    console.log(queryString);
    const [result] = await connection.query(queryString, queryArray);

    if (result.length === 0) {
      throw generateError("There are no experiences in your area", 404);
    }

    return result;
  } finally {
    if (connection) connection.release();
  }
};

const nearbyRecommendations = async (distance, lat, lon) => {
  let connection;

  try {
    connection = await getConnection();

    let queryString = `
    SELECT 
    r.id,
    r.title,
    r.abstract,
    r.lat,
    r.lon,
    r.photo,
    u.username,
    (
      SELECT
      AVG(v.rating)
      FROM vote v 
      WHERE v.id_recommendation = r.id 
      GROUP BY v.id_recommendation
    ) AS average,
    (
      6371 *
       acos(cos(radians(?)) * 
       cos(radians(r.lat)) * 
       cos(radians(r.lon) - 
       radians(?)) + 
       sin(radians(?)) * 
       sin(radians(r.lat )))
    ) AS distance 
    FROM recommendation r
    JOIN user u ON r.id_user=u.id
    HAVING distance < ?
    ORDER BY distance LIMIT 0, 20;`;

    const [result] = await connection.query(queryString, [
      lat,
      lon,
      lat,
      distance,
    ]);

    if (result.length === 0) {
      throw generateError("There are no experiences in your area", 404);
    }

    return result;
  } finally {
    if (connection) connection.release();
  }
};

const getStaffPicks = async () => {
  let connection;

  try {
    connection = await getConnection();

    let queryString = `
    SELECT 
    r.id,
    r.title,
    r.abstract,
    r.lat,
    r.lon,
    r.photo,
    u.username,
    (
      SELECT
      AVG(v.rating)
      FROM vote v 
      WHERE v.id_recommendation = r.id 
      GROUP BY v.id_recommendation
    ) as average,
    sp.creation_date
    FROM recommendation r
    INNER JOIN staff_picks sp ON r.id = sp.id
    JOIN user u ON r.id_user = u.id
    ORDER BY r.creation_date DESC LIMIT 0, 10;`;

    const [result] = await connection.query(queryString);

    if (result.length === 0) {
      throw generateError("There are no staff picks", 404);
    }

    return result;
  } finally {
    if (connection) connection.release();
  }
};

//Creamos una recomendacion

const postRecommendation = async (
  id_user,
  title,
  clase,
  lat,
  lon,
  abstract,
  content,
  photo
) => {
  let connection;

  try {
    connection = await getConnection();
    const [result] = await connection.query(
      `INSERT INTO recommendation
      (
        id_user, 
        title, 
        class, 
        lat, 
        lon, 
        abstract, 
        content, 
        photo
      ) VALUES (?,?,?,?,?,?,?,?)`,
      [id_user, title, clase, lat, lon, abstract, content, photo]
    );
    return result.insertId;
  } finally {
    if (connection) connection.release();
  }
};

const voteRecommendation = async (idUser, idRecommendation, rating) => {
  try {
    connection = await getConnection();

    const [result] = await connection.query(
      `INSERT INTO vote 
      (
        id_user, 
        id_recommendation, 
        rating
      ) VALUES (?,?,?)`,
      [idUser, idRecommendation, rating]
    );

    return result.insertId;
  } catch (err) {
    throw err;
  } finally {
    if (connection) connection.release();
  }
};

const commentRecommendation = async (idUser, idRecommendation, content) => {
  try {
    connection = await getConnection();

    const [result] = await connection.query(
      `INSERT INTO comment 
      (
        id_user, 
        id_recommendation, 
        content
      ) VALUES (?,?,?)`,
      [idUser, idRecommendation, content]
    );
    return result.insertId;
  } catch (err) {
    throw err;
  } finally {
    if (connection) connection.release();
  }
};

const deleteRecommendationById = async (id) => {
  let connection;

  try {
    connection = await getConnection();

    await connection.query(
      `
        DELETE FROM recommendation WHERE id = ?
        `,
      [id]
    );
    return;
  } finally {
    if (connection) connection.release();
  }
};

const getComments = async (id) => {
  let connection;

  try {
    connection = await getConnection();

    const [result] = await connection.query(
      `SELECT 
        c.id_user as userId, 
        c.id as commentId, 
        c.content, 
        c.creation_date as creationDate, 
        u.username FROM comment c
      JOIN user u ON c.id_user = u.id
      WHERE c.id_recommendation=? 
      ORDER BY c.creation_date DESC 
      LIMIT 0, 50;
        `,
      [id]
    );

    if (result.length === 0) {
      throw generateError("No hay ninguna recommendations con esa id", 404);
    }

    return result;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getStaffPicks,
  getRecommendationByID,
  listRecommendations,
  postRecommendation,
  voteRecommendation,
  commentRecommendation,
  deleteRecommendationById,
  nearbyRecommendations,
  getComments,
};
