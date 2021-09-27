"use strict";

let mongoose = require("mongoose");
let schema = mongoose.Schema;

let articleSchema = schema({
  title: String,
  content: String,
  date: { type: Date, default: Date.now },
  image: String,
});

module.exports = mongoose.model("Article", articleSchema);
