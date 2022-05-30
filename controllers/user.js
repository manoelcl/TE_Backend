const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { generateError } = require("../helpers");
const { createUser, getUserByEmail } = require("../db/userDB");
const {
  loginUserSchema,
  createUserSchema,
} = require("../validators/userValidators");

//CREATE USER
const createUserController = async (req, res, next) => {
  try {
    await createUserSchema.validateAsync(req.body);

    const { email, password, username, role } = req.body;

    password = bcrypt.hashSync(password, 8);

    const id = await createUser(email, password, username, role);

    res.send({
      status: "ok",
      message: `Has sido registrado correctamente con id: ${id}`,
    });
  } catch (error) {
    next(error);
  }
};

//LOGIN USER
const loginUserController = async (req, res, next) => {
  try {
    await loginUserSchema.validateAsync(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      throw generateError("Rellena los campos correctamente", 400);
    }

    //Recojo los datos del usuario

    const user = await getUserByEmail(email);

    //Compruebo que coinciden password
    console.log(bcrypt.hashSync(password, 8));
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw generateError("Password incorrecto", 401);
    }

    //Payload del token

    const payload = { id: user.id, role: user.role };

    //Firmo el token

    const token = jwt.sign(payload, process.env.SECRET, {
      expiresIn: "1d",
    });
    res.send({
      status: "ok",
      data: {
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUserController,
  loginUserController,
};
