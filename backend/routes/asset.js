"use strict";

let express = require("express");
let assetController = require("../controllers/asset");

let assetRouter = express.Router();

//Rutas Útiles
assetRouter.get("/asset_img/:img", assetController.getAssetImg);

module.exports = assetRouter;
