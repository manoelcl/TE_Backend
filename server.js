require("dotenv").config();

const chalk = require("chalk");
const morgan = require("morgan");
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const { authUser } = require("./middlewares/auth");

//USER
const {
  createUserController,
  loginUserController,
  getUserController,
  listRecommendationsByUserController,
} = require("./controllers/user");

//RECOMMENDATIONS
const {
  getRecommendationController,
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

//Rutas de User

app.post("/users", createUserController);
app.get("/users/:id", getUserController); //development
app.get("/users/:id/recommendations", listRecommendationsByUserController); //development
app.post("/users/login", loginUserController);

//Rutas de Recommendations

app.get("/recommendations", listRecommendationsController);
app.get("/recommendations/:id", getRecommendationController);
app.get("/recommendations/:idRecommendation/comment", getCommentsController);

//Private paths
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
app.delete(
  "/recommendations/:idRecommendation",
  authUser,
  deleteRecommendationController
);

//Middleware 404
app.use((req, res) => {
  res.status(404).send({
    status: "error",
    message: "Not found",
  });
});

//Middleware de gestion de errores
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
