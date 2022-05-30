const Joi = require("joi");

const { generateError } = require("../helpers");

const recommendationSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .error(generateError("Recommendation must have a valid title", 400)),
  classId: Joi.string()
    .valid("travel", "experience")
    .required()
    .error(generateError("Recommendation must have a valid class", 400)),
  location: Joi.string()
    .min(2)
    .max(100)
    .required()
    .error(generateError("Recommendation must have a valid location", 400)),
  abstract: Joi.string()
    .min(3)
    .max(300)
    .required()
    .error(generateError("Recommendation must have a valid abstract", 400)),
  content: Joi.string()
    .min(3)
    .max(20000)
    .required()
    .error(generateError("Recommendation must have a valid abstract", 400)),
});

const recommendationVote = Joi.object({
  rating: Joi.number()
    .max(5)
    .min(0)
    .integer()
    .required()
    .error(generateError("Vote must be an integer between 0 and 5", 400)),
});

const recommendationComment = Joi.object({
  content: Joi.string()
    .max(300)
    .required()
    .error(generateError("Text must be between 3 an 300 characters long", 400)),
});

module.exports = {
  recommendationSchema,
  recommendationVote,
  recommendationComment,
};
