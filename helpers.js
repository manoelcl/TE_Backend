const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const uuid = require("uuid");

const generateError = (message, status) => {
  const error = new Error(message);
  error.httpStatus = status;
  return error;
};

const createPathIfNotExists = async (path) => {
  try {
    await fs.access(path);
  } catch {
    await fs.mkdir(path);
  }
};

const processImage = async (image, size) => {
  const imgPath = path.join(__dirname, "images");
  await createPathIfNotExists(imgPath);

  const img = await sharp(image.data);

  const imageInfo = await img.metadata();

  if (imageInfo.width > size) {
    await img.resize(size);
  }

  const fileName = `${uuid.v4()}.jpg`;
  await img.toFile(path.join(imgPath, fileName));

  return fileName;
};

module.exports = {
  generateError,
  processImage,
};
