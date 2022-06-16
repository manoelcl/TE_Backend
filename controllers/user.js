const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { generateError, processImage } = require("../helpers");
const { createUser, getUserByEmail, getUserById } = require("../db/userDB");
const {
  loginUserSchema,
  createUserSchema,
} = require("../validators/userValidators");

//CREATE USER
const createUserController = async (req, res, next) => {
  try {
    await createUserSchema.validateAsync(req.body);
    let { email, password, username, role = "user" } = req.body;

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
    console.log(password, user.password);
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw generateError("Password incorrecto", 401);
    }

    //Token payload

    const payload = { id: user.id, role: user.role };

    //Token sign

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

const getUserController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recommendationsList = await getUserById(id);

    res.send({
      status: "ok",
      message: recommendationsList,
    });
  } catch (error) {
    next(error);
  }
};

//ALL RECOMMENDATIONS BY USER
const listRecommendationsByUserController = async (req, res, next) => {
  try {
    const { location, distance, classId, order } = req.params;

    const recommendationsList = await listRecommendations(
      location,
      distance,
      classId,
      order
    );

    res.send({
      status: "ok",
      message: recommendationsList,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUserController,
  loginUserController,
  getUserController,
  listRecommendationsByUserController,
};
