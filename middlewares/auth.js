const jwt = require("jsonwebtoken");
const { generateError } = require("../helpers");

const authUser = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw generateError("Falta la cabecera", 401);
    }

    //Comprobamos que el token sea correcto

    let token;

    try {
      token = jwt.verify(authorization.split(" ")[1], process.env.SECRET);
    } catch {
      throw generateError("Invalid token or header format", 401);
    }

    //Metemos la información del token en la req para usarla en el controlador

    req.auth = token;

    // Saltamos al controlador
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authUser,
};

// No es necesario el metodo bearer
