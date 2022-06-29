const jwt = require("jsonwebtoken");
const { generateError } = require("../helpers");

const authUser = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw generateError("Falta la cabecera", 401);
    }

    //Check if is a valid token

    let token;

    try {
      token = jwt.verify(authorization.split(" ")[1], process.env.SECRET);
    } catch {
      throw generateError("Invalid token or header format", 401);
    }

    //auth info is sent in the req
    req.auth = token;

    next();
  } catch (error) {
    //if authentication fails, next is error endpoint
    next(error);
  }
};

const isAdmin = (req, res, next) => {
  if (req.auth.role === "admin") {
    next();
  } else {
    const error = generateError("Admin privileges are needed", 403);
    next(error);
  }
};

module.exports = {
  authUser,
  isAdmin,
};

// No es necesario el metodo bearer
