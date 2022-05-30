const Joi = require("joi");

const { generateError } = require("../helpers");

const createUserSchema = Joi.object().keys({
  email: Joi.string()
    .email()
    .required()
    .error(generateError("Email must have a valid format", 400)),
  password: Joi.string()
    .min(8)
    .required()
    .error(
      generateError(
        "Password must be a valid password with at least 8 characters",
        400
      )
    ),
  username: Joi.string()
    .min(2)
    .required()
    .error(generateError("User name must be at least 2 characters long", 400)),
  role: Joi.string()
    .valid("admin", "user")
    .default("user")
    .error(generateError("Role must be a valid role", 400)),
});

const loginUserSchema = Joi.object().keys({
  email: Joi.string()
    .email()
    .required()
    .error(generateError("login error", 400)),
  password: Joi.string()
    .min(8)
    .required()
    .error(generateError("login error", 400)),
});

module.exports = {
  createUserSchema,
  loginUserSchema,
};
