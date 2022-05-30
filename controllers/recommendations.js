const { generateError, processImage } = require("../helpers");
const {
  recommendationSchema,
  recommendationComment,
  recommendationVote,
} = require("../validators/recommendationsValidator");
const {
  getRecommendationByID,
  listRecommendations,
  postRecommendation,
  voteRecommendation,
  commentRecommendation,
  deleteRecommendationById,
} = require("../db/recommendationsDB");

//ALL RECOMMENDATIONS
const listRecommendationsController = async (req, res, next) => {
  try {
    // Dos parametros en la misma busqueda
    const { location, classId, order } = req.query;

    const recommendationsList = await listRecommendations(
      location,
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

//SINGLE RECOMMENDATION - Hecho
const getRecommendationController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recommendation = await getRecommendationByID(id);
    res.send({
      status: "ok",
      message: recommendation,
    });
  } catch (error) {
    next(error);
  }
};

//CREATE RECOMMENDATION - Login necesario
const postRecommendationController = async (req, res, next) => {
  try {
    await recommendationSchema.validateAsync(req.body);

    if (!req.files.photo) {
      throw generateError("Recommendations require an image", 401);
    }
    const photo = await processImage(req.files.photo);
    console.log(photo);
    const { title, classId, location, abstract, content } = req.body;

    const idRecommendation = await postRecommendation(
      req.auth.id,
      title,
      classId,
      location,
      abstract,
      content,
      photo
    );

    res.statusCode = 201;
    res.setHeader("Content-Location", `/recommendations/${idRecommendation}`);
    res.send({
      status: "ok",
      message: "Entrada creada correctamente.",
    });
  } catch (error) {
    next(error);
  }
};

//CREATE COMMENT
const commentRecommendationController = async (req, res, next) => {
  try {
    await recommendationComment.validateAsync(req.body);

    const { idRecommendation } = req.params;
    const { content } = req.body;
    const idUser = req.auth.id;

    const commentNum = await commentRecommendation(
      idUser,
      idRecommendation,
      content
    );
    res.send({
      status: "ok",
      message: `Comment added to the comments table with id ${commentNum}`,
    });
  } catch (error) {
    next(error);
  }
};

//VOTE RECOMMENDATION
const voteRecommendationController = async (req, res, next) => {
  try {
    await recommendationVote.validateAsync(req.query);
    const { idRecommendation } = req.params;
    const { rating } = req.query;
    const idUser = req.auth.id;

    const vote = await voteRecommendation(idUser, idRecommendation, rating);
    res.send({
      status: "ok",
      message: `Rating for recommendation ${idRecommendation} by user ${idUser} has been registered`,
    });
  } catch (error) {
    next(error);
  }
};

//DELETE RECOMMENDATION
const deleteRecommendationController = async (req, res, next) => {
  try {
    //req.UserId
    const { idRecommendation } = req.params;
    const idUser = req.auth.id;
    //Localizar el id

    const recommendation = await getRecommendationByID(idRecommendation);

    //Comprobar que el usuario del token es el mismo que lo ha creado

    if (req.userId !== recommendation.user_id) {
      throw generateError(
        "No tienes permisos para borrar la recomendación",
        401
      );
    }
    //Borrar el tweet
    await deleteRecommendationById(idRecommendation);

    res.send({
      status: "ok",
      message: `Recommendation with id : ${idRecommendation} deleted`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listRecommendationsController,
  getRecommendationController,
  postRecommendationController,
  voteRecommendationController,
  commentRecommendationController,
  deleteRecommendationController,
};
