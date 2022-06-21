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
    return newUser.insertId;
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
      throw generateError(" No hay ningun usuario con ese id", 404);
    }

    return result[0];
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
};
