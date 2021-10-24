"use strict";

let express = require("express");
let formController = require("../controllers/form");

let formRouter = express.Router();

let cors = require("cors");

// CORS
var corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders:
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method",
  credentials: true,
  preflightContinue: false,
  maxAge: 600,
  optionsSuccessStatus: 204,
};

//Rutas Útiles
//formRouter.options("/send_contact_email" , cors());
formRouter.post("/send_contact_email", cors(corsOptions), formController.sendContactEmail);

module.exports = formRouter;
