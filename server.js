require("dotenv").config();

const chalk = require("chalk");
const morgan = require("morgan");
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const { authUser, isAdmin } = require("./middlewares/auth");

//USER
const {
  createUserController,
  loginUserController,
  getUserController,
  listRecommendationsByUserController,
} = require("./controllers/user");

//RECOMMENDATIONS
const {
  getStaffPicksController,
  getRecommendationController,
  nearbyRecommendationsController,
  listRecommendationsController,
  postRecommendationController,
  commentRecommendationController,
  voteRecommendationController,
  deleteRecommendationController,
  getCommentsController,
} = require("./controllers/recommendations");

const app = express();
const port = process.env.PORT || 4000;

app.use(morgan("dev"));
app.use(express.json());
app.use(fileUpload());
app.use(cors());
app.use("/images", express.static("./images"));

//USER ROUTES

//PUBLIC
app.get("/users/:id/recommendations", listRecommendationsByUserController);
app.get("/users/:id", getUserController);
app.post("/users/login", loginUserController);
app.post("/users", createUserController);

//PROTECTED

//RECOMMENDATION ROUTES

//PUBLIC
app.get("/recommendations/:idRecommendation/comment", getCommentsController);
app.get("/recommendations/staffpicks", getStaffPicksController);
app.get("/recommendations/nearby", nearbyRecommendationsController);
app.get("/recommendations/:id", getRecommendationController);
app.get("/recommendations", listRecommendationsController);

//PROTECTED
app.post("/recommendations", authUser, postRecommendationController);
app.post(
  "/recommendations/:idRecommendation/comment",
  authUser,
  commentRecommendationController
);
app.post(
  "/recommendations/:idRecommendation/vote",
  authUser,
  voteRecommendationController
);
app.post(
  "/recommendations/staffpicks",
  authUser,
  isAdmin,
  getStaffPicksController
); //development
app.delete(
  "/recommendations/:idRecommendation",
  authUser,
  deleteRecommendationController
);

//404 middlewate
app.use((req, res) => {
  res.status(404).send({
    status: "error",
    message: "Not found",
  });
});

//Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.httpStatus || 500).send({
    status: "error",
    message: error.message,
  });
});

app.listen(port, () => {
  console.log(chalk.green(`app listening in port ${port}`));
});
