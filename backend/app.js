"use strict";

// Cargar módulos de Node para crear servidor
let express = require("express");
let bodyParser = require("body-parser");
let cors = require("cors");

// Ejecutar express (HTTP)
let app = express();

// Cargar Ficheros Rutas
let articleRoutes = require("./routes/article");
let formRoutes = require("./routes/form");

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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

app.use(cors(corsOptions));

/* app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  response.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  response.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
}); */

// Añadir prefijos a rutas / Cargar Rutas
app.use("/api", articleRoutes);
app.use("/api", formRoutes);

// Exportar módulo (fichero actual)
module.exports = app;
