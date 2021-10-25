"use strict";

let fileSystem = require("fs");
let path = require("path");

let assetsController = {
  getAssetImg: (request, response) => {
    let image = request.params.img;
    let imgPath = "./assets/images/" + image;

    fileSystem.stat(imgPath, (error, stats) => {
      if (error && error.toString().includes("no such file or directory")) {
        return response.status(404).send({
          status: "Error",
          message: "¡No se encontró la imagen!",
        });
      } else {
        return response.sendFile(path.resolve(imgPath));
      }
    });
  },
};

module.exports = assetsController;
