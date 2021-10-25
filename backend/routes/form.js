"use strict";

let express = require("express");
let formController = require("../controllers/form");

let formRouter = express.Router();

//Rutas Útiles
formRouter.post("/send_contact_email", formController.sendContactEmail);

module.exports = formRouter;
