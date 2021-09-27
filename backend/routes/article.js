"use strict";

let express = require("express");
let articleController = require("../controllers/article");

let articleRouter = express.Router();

let multiparty = require("connect-multiparty");
let middlewareUpload = multiparty({ uploadDir: "./upload/images/article" });

//Rutas Útiles
articleRouter.post("/article_save", articleController.saveArticle);
articleRouter.get("/article_list/:last_five?", articleController.getArticles);
articleRouter.get("/article/:id", articleController.getArticle);
articleRouter.put("/article_update/:id", articleController.updateArticle);
articleRouter.delete("/article_delete/:id", articleController.deleteArticle);
articleRouter.post("/article_img_upload/:id", middlewareUpload, articleController.uploadArticleImg);
articleRouter.get("/article_img/:img", articleController.getArticleImg);
articleRouter.get("/article_search/:search", articleController.searchArticle);

module.exports = articleRouter;
