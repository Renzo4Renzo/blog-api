"use strict";

let validator = require("validator");
let fileSystem = require("fs");
let path = require("path");
var Article = require("../models/article");
const article = require("../models/article");

let articleController = {
  saveArticle: (request, response) => {
    //Recoger parámetros por POST
    let parameters = request.body;
    console.log(parameters);

    //Validar datos (validator)
    try {
      var titleValid = !validator.isEmpty(parameters.title);
      var contentValid = !validator.isEmpty(parameters.content);
    } catch (error) {
      return response.status(400).send({
        status: "Error",
        message: "¡No se enviaron todos los campos requeridos!",
      });
    }

    if (titleValid && contentValid) {
      //Crear el objeto a guardar
      let currentArticle = new Article();

      //Asignar valores
      currentArticle.title = parameters.title;
      currentArticle.content = parameters.content;

      if (parameters.image) currentArticle.image = parameters.image;
      else currentArticle.image = null;

      //Guardar el artículo
      currentArticle.save((error, articleStored) => {
        //console.log("Error: " + error);
        if (error && error.name == "MongooseServerSelectionError") {
          return response.status(500).send({
            status: "Error",
            message: "¡No se pudo conectar con la base de datos!",
          });
        }
        //Devolver una respuesta
        return response.status(200).send({
          status: "Ok",
          article: articleStored,
        });
      });
    } else {
      return response.status(400).send({
        status: "Error",
        message: "¡La data enviada no es válida!",
      });
    }
  },
  getArticles: (request, response) => {
    let findQuery = Article.find({});

    //NOTA: Request.params gets data from HTTP Request, including Request.Querystring. Don't change it!
    let lastFive = request.params.last_five;
    if (lastFive != undefined) {
      if (lastFive == "last_five") {
        findQuery.limit(5);
      } else {
        return response.status(404).send({
          status: "Error",
          message: "¡La URL consultada no es válida!",
        });
      }
    }

    findQuery.sort("-_id").exec((error, articles) => {
      //console.log("Error: " + error);
      if (error && error.name == "MongooseServerSelectionError") {
        return response.status(500).send({
          status: "Error",
          message: "¡No se pudo conectar con la base de datos!",
        });
      }
      if (articles == "") {
        return response.status(404).send({
          status: "Error",
          message: "¡No hay artículos registrados!",
        });
      }
      return response.status(200).send({
        status: "Ok",
        articles,
      });
    });
  },
  getArticle: (request, response) => {
    let articleID = request.params.id;
    Article.findById(articleID, (error, article) => {
      //console.log("Error: " + error);
      if (error) {
        if (error.name == "MongooseServerSelectionError") {
          return response.status(500).send({
            status: "Error",
            message: "¡No se pudo conectar con la base de datos!",
          });
        }
        if (error.name == "CastError") {
          return response.status(404).send({
            status: "Error",
            message: "¡No existe ningún artículo con este ID!",
          });
        }
      }
      if (article == null) {
        return response.status(404).send({
          status: "Error",
          message: "¡No existe ningún artículo con este ID!",
        });
      }
      return response.status(200).send({
        status: "Ok",
        article,
      });
    });
  },
  updateArticle: (request, response) => {
    let articleID = request.params.id;
    let parameters = request.body;

    //Validar datos
    try {
      var titleValid = !validator.isEmpty(parameters.title);
      var contentValid = !validator.isEmpty(parameters.content);
    } catch (error) {
      return response.status(400).send({
        status: "Error",
        message: "¡No se enviaron todos los campos requeridos!",
      });
    }

    if (titleValid && contentValid) {
      //Find and Update
      Article.findOneAndUpdate({ _id: articleID }, parameters, { new: true }, (error, articleUpdated) => {
        //console.log("Error: " + error);
        if (error) {
          if (error.name == "MongooseServerSelectionError") {
            return response.status(500).send({
              status: "Error",
              message: "¡No se pudo conectar con la base de datos!",
            });
          }
          if (error.name == "CastError") {
            return response.status(404).send({
              status: "Error",
              message: "¡No existe ningún artículo con este ID!",
            });
          }
        }
        if (articleUpdated == null) {
          return response.status(404).send({
            status: "Error",
            message: "¡No existe ningún artículo con este ID!",
          });
        }
        return response.status(200).send({
          status: "Ok",
          article: articleUpdated,
        });
      });
    } else {
      return response.status(400).send({
        status: "Error",
        message: "¡La data enviada no es válida!",
      });
    }
  },
  deleteArticle: (request, response) => {
    let articleID = request.params.id;
    Article.findOneAndDelete({ _id: articleID }, (error, articleRemoved) => {
      //console.log("Error: " + error);
      if (error) {
        if (error.name == "MongooseServerSelectionError") {
          return response.status(500).send({
            status: "Error",
            message: "¡No se pudo conectar con la base de datos!",
          });
        }
        if (error.name == "CastError") {
          return response.status(404).send({
            status: "Error",
            message: "¡No existe ningún artículo con este ID!",
          });
        }
      }
      if (articleRemoved == null) {
        return response.status(404).send({
          status: "Error",
          message: "¡No existe ningún artículo con este ID!",
        });
      }
      return response.status(200).send({
        status: "Ok",
        article: articleRemoved,
      });
    });
  },
  uploadArticleImg: (request, response) => {
    if (request.files.file0 == undefined) {
      return response.status(500).send({
        status: "Error",
        message: "¡No se enviaron todos los campos requeridos!",
      });
    }

    let filePath = request.files.file0.path;
    console.log("File Path: " + filePath);
    let filePathSplit = filePath.split("/");
    let fileName = filePathSplit[3];
    let fileExtensionSplit = fileName.split(".");
    let fileExtension = fileExtensionSplit[1];

    if (fileExtension == undefined) {
      fileSystem.unlink(filePath, (error) => {});
      return response.status(500).send({
        status: "Error",
        message: "¡No se cargó ninguna imagen!",
      });
    }

    if (fileExtension != "png" && fileExtension != "jpg" && fileExtension != "jpeg" && fileExtension != "gif") {
      fileSystem.unlink(filePath, (error) => {
        return response.status(500).send({
          status: "Error",
          message: "¡La extensión de la imagen no es válida!",
        });
      });
    } else {
      let articleID = request.params.id;

      if (articleID) {
        Article.findOneAndUpdate({ _id: articleID }, { image: fileName }, { new: true }, (error, articleUpdated) => {
          if (error) {
            if (error.name == "MongooseServerSelectionError") {
              fileSystem.unlink(filePath, (error) => {});
              return response.status(500).send({
                status: "Error",
                message: "¡No se pudo conectar con la base de datos!",
              });
            }
            if (error.name == "CastError") {
              fileSystem.unlink(filePath, (error) => {});
              return response.status(404).send({
                status: "Error",
                message: "¡No existe ningún artículo con este ID!",
              });
            }
          }
          if (articleUpdated == null) {
            fileSystem.unlink(filePath, (error) => {});
            return response.status(404).send({
              status: "Error",
              message: "¡No existe ningún artículo con este ID!",
            });
          }
          return response.status(200).send({
            status: "Ok",
            article: articleUpdated,
          });
        });
      } else {
        return response.status(200).send({
          status: "Ok",
          image: fileName,
        });
      }
    }
  },
  getArticleImg: (request, response) => {
    let img = request.params.img;
    let imgPath = "./upload/images/article/" + img;

    fileSystem.stat(imgPath, (error, stats) => {
      //console.log("Error: " + error.toString());
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
  searchArticle: (request, response) => {
    //Sacar el string a buscar
    let searchString = request.params.searchString;
    //Find or
    Article.find({
      $or: [{ title: { $regex: searchString, $options: "i" } }, { content: { $regex: searchString, $options: "i" } }],
    })
      .sort([["date", "descending"]])
      .exec((error, articles) => {
        if (error && error.name == "MongooseServerSelectionError") {
          return response.status(500).send({
            status: "Error",
            message: "¡No se pudo conectar con la base de datos!",
          });
        }
        if (articles == "") {
          return response.status(404).send({
            status: "Error",
            message: "¡No hay artículos que coincidan con la búsqueda!",
          });
        }
        return response.status(200).send({
          status: "Ok",
          articles,
        });
      });
  },
};

module.exports = articleController;
