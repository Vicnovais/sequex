var express = require("express");
var app_start = require('./app_start/app_start.js');
var path = require('path');
var app = express();

app_start.init(app, express);
app.use(express.static(path.resolve('./client')));

app.listen(3000, function() {
  console.log("API is running...");
});