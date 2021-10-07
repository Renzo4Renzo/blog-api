"use strict";

let mongoose = require("mongoose");
let connectionURL = "mongodb://localhost:27017/blog-db";
let app = require("./app");
let appPort = 4400;

mongoose.set("useFindAndModify", false);
mongoose.Promise = global.Promise;
mongoose.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log("¡La conexión a la base de datos se ha realizado con soberbia!");

  //Crear Servidor y escuchar peticiones HTTP
  app.listen(appPort, () => {
    console.log("Servidor corriendo en http://localhost:" + appPort);
  });
});
