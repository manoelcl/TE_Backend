const { generateError, processImage } = require("../helpers");
const {
  recommendationSchema,
  recommendationComment,
  recommendationVote,
} = require("../validators/recommendationsValidator");
const {
  getStaffPicks,
  getRecommendationByID,
  listRecommendations,
  postRecommendation,
  voteRecommendation,
  commentRecommendation,
  deleteRecommendationById,
  getComments,
  nearbyRecommendations,
} = require("../db/recommendationsDB");

// ALL RECOMMENDATIONS
const listRecommendationsController = async (req, res, next) => {
  try {
    const { lat, lon, distance, classId, idUser, order } = req.query;

    const recommendationsList = await listRecommendations(
      lat,
      lon,
      distance,
      classId,
      idUser,
      order
    );

    res.send({
      status: "ok",
      data: recommendationsList,
    });
  } catch (error) {
    next(error);
  }
};

const nearbyRecommendationsController = async (req, res, next) => {
  try {
    const { distance, lat, lon, classId, idUser, order } = req.query;

    const recommendationsList = await nearbyRecommendations(
      distance,
      lat,
      lon,
      classId,
      idUser,
      order
    );

    res.send({
      status: "ok",
      data: recommendationsList,
    });
  } catch (error) {
    next(error);
  }
};

const getCommentsController = async (req, res, next) => {
  try {
    const { idRecommendation } = req.params;
    console.log(idRecommendation);
    const recommendationsList = await getComments(idRecommendation);

    res.send({
      status: "ok",
      data: recommendationsList,
    });
  } catch (error) {
    next(error);
  }
};

const getStaffPicksController = async (req, res, next) => {
  try {
    const recommendationsList = await getStaffPicks();

    res.send({
      status: "ok",
      data: recommendationsList,
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
  console.log(req.body);
  try {
    await recommendationSchema.validateAsync(req.body);

    if (!req.files.photo) {
      throw generateError("Recommendations require an image", 401);
    }
    const photo = await processImage(req.files.photo, 2048);

    const { title, classId, lat, lon, abstract, content } = req.body;

    const idRecommendation = await postRecommendation(
      req.auth.id,
      title,
      classId,
      lat,
      lon,
      abstract,
      content,
      photo
    );

    res.statusCode = 201;
    res.setHeader("Content-Location", `/recommendations/${idRecommendation}`);
    res.send({
      status: "ok",
      message: "Entrada creada correctamente.",
      data: idRecommendation,
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
    console.log(content, req.body);
    const commentNum = await commentRecommendation(
      idUser,
      idRecommendation,
      content
    );

    res.statusCode = 201;

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

    //Check user is allowed

    if (req.userId !== recommendation.user_id) {
      throw generateError(
        "No tienes permisos para borrar la recomendación",
        401
      );
    }
    //Delete post
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
  getStaffPicksController,
  listRecommendationsController,
  nearbyRecommendationsController,
  getRecommendationController,
  postRecommendationController,
  voteRecommendationController,
  commentRecommendationController,
  deleteRecommendationController,
  getCommentsController,
};
