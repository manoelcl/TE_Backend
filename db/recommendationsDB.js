const bcrypt = require("bcrypt");
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
      r.photo,
      r.class,
      r.creation_date as creationDate,
      (SELECT AVG(v.rating) FROM vote v WHERE v.id_recommendation = r.id GROUP BY v.id_recommendation) as average,
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

//Devuelve todas las recomendaciones publicadas por un usuario

const getAllRecommendationsByUserID = async (id) => {
  let connection;

  try {
    connection = await getConnection();

    const [result] = await connection.query(
      `SELECT r.title, r.abstract, r.id, r.id_user as userId, r.photo,
      (SELECT AVG(v.rating) FROM vote v WHERE v.id_recommendation = r.id GROUP BY v.id_recommendation) as average
      FROM recommendation r WHERE r.id_user=?`,
      [id]
    );

    if (result.length === 0) {
      throw generateError("No hay ninguna recommendation con esa id", 404);
    }

    return result;
  } finally {
    if (connection) connection.release();
  }
};

const listRecommendations = async (location, classId, idUser, order) => {
  let connection;

  try {
    connection = await getConnection();

    let queryString = `SELECT r.title, r.abstract, r.id, r.id_user as userId, r.photo,
    (SELECT AVG(v.rating) FROM vote v WHERE v.id_recommendation = r.id GROUP BY v.id_recommendation) as average
    FROM recommendation r`;
    let queryArray = [];
    let queryStringArray = [];

    if (location) {
      queryStringArray.push(`r.location=?`);
      queryArray.push(location);
    }
    if (classId) {
      queryStringArray.push(`r.class=?`);
      queryArray.push(classId);
    }
    if (idUser) {
      queryStringArray.push(`r.id_user=?`);
      queryArray.push(idUser);
    }
    if (queryStringArray.length > 0) {
      queryString = queryString + " WHERE " + queryStringArray.join(" AND ");
    }

    queryString = queryString + ` GROUP BY r.id`;

    if (order) {
      if (order.toUpperCase() === "ASC") {
        queryString = queryString + ` ORDER BY average ASC`;
      } else {
        queryString = queryString + ` ORDER BY average DESC`;
      }
    }
    const [result] = await connection.query(queryString, queryArray);

    if (result.length === 0) {
      throw generateError("No hay ninguna recommendations con esa id", 404);
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
  location,
  abstract,
  content,
  photo
) => {
  let connection;

  try {
    connection = await getConnection();
    const [result] = await connection.query(
      `INSERT INTO recommendation (id_user, title, class, location, abstract, content, photo) VALUES (?,?,?,?,?,?,?)`,
      [id_user, title, clase, location, abstract, content, photo]
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
      `INSERT INTO vote (id_user, id_recommendation, rating) VALUES (?,?,?)`,
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
      `INSERT INTO comment (id_user, id_recommendation, content) VALUES (?,?,?)`,
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
      `SELECT c.id_user as userId, c.id as commentId, c.content, c.creation_date as creationDate, u.username FROM comment c
      JOIN user u ON c.id_user = u.id
      WHERE c.id_recommendation=? ORDER BY c.creation_date DESC LIMIT 0, 50;
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
  getRecommendationByID,
  getAllRecommendationsByUserID,
  listRecommendations,
  postRecommendation,
  voteRecommendation,
  commentRecommendation,
  deleteRecommendationById,
  getComments,
};
