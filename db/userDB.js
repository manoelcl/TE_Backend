const bcrypt = require("bcrypt");

const { generateError } = require("../helpers");
const { getConnection } = require("./db");

//CREATE USER IN DATABASE ( REVISAR ROLE)
const createUser = async (email, password, username, role) => {
  let connection;

  try {
    connection = await getConnection();

    //Check if username or mail are already in use

    const [user] = await connection.query(
      `SELECT id FROM user WHERE email = ? OR username = ?`,
      [email, username]
    );
    if (user.length > 0) {
      throw generateError("Email or username already in use", 409);
    }

    //Create the user
    const newUser = await connection.query(
      `
      INSERT INTO user
      (
        email, 
        password, 
        username, 
        role) 
        VALUES (?,?,?,?)
    `,
      [email, password, username, role]
    );
    //Return the id
    return newUser[0].insertId;
  } finally {
    if (connection) connection.release();
  }
};

//Returns user info by mail

const getUserByEmail = async (email) => {
  let connection;

  try {
    connection = await getConnection();

    const [result] = await connection.query(
      `SELECT * FROM user WHERE email=?`,
      [email]
    );

    if (result.length === 0) {
      throw generateError("This email has not been registered yet", 404);
    }

    return result[0];
  } finally {
    if (connection) connection.release();
  }
};

//Returns user info by id

const getUserById = async (id) => {
  let connection;

  try {
    connection = await getConnection();

    const [result] = await connection.query(
      `SELECT
      id as userId,
      email, 
      username, 
      role, 
      creation_date 
      FROM user WHERE id=?`,
      [id]
    );

    if (result.length === 0) {
      throw generateError("There is no user with that id", 404);
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
      `SELECT 
        r.title, 
        r.abstract, 
        r.id, 
        r.id_user as userId, 
        r.lat, 
        r.lon, 
        r.photo,
      (
        SELECT AVG(v.rating) 
        FROM vote v 
        WHERE v.id_recommendation = r.id 
        GROUP BY v.id_recommendation
      ) as average
      FROM recommendation r WHERE r.id_user=?`,
      [id]
    );

    if (result.length === 0) {
      throw generateError("There are no recommendations for that user id", 404);
    }

    return result;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getAllRecommendationsByUserID,
};
