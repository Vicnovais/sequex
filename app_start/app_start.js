var database = require('./../DAL/database.config.js');
var middleware = require('./middleware.js');
var auth = require('./../authentication/auth.js')();
var authRouteBuilder = require('./auth.route.builder');
var apiRouteBuilder = require('./api.route.builder');
var db = require('./../DAL/db.js');
var path = require('path');
var jwt = require("jwt-simple");
var cfg = require("./../authentication/config.js");

var initFunc = function (app, express) {
    middleware.init(app, express, auth);
    authRouteBuilder.buildRoute(app, auth);
    apiRouteBuilder.buildRoute(app, auth);

    app.get("/", function(req, res) {
      var cookies = req.cookies;
      var auth = cookies.auth;

      if (!!auth && !!req.session && req.session.loggedIn) {
        var decoded = jwt.decode(auth, cfg.jwtSecret);
        var secret = decoded.secret;

        if (!!secret && secret === "secretToken") {
          res.sendFile(path.resolve('client/index.html'))
        }
        else {
          res.sendStatus(401);
        }
      }
      else {
        if (req.isAuthenticated()) res.sendFile(path.resolve('client/index.html'));
        else res.sendFile(path.resolve('client/login.html'));
      }
    });
    
    app.use(function (err, req, res, next) {
      res.status(err.status || 500).json({ status: err.status, message: err.message });
    });
    
    database
      .sequelizeInstance
      .authenticate()
      .then(() => {
        console.log("Connection Established");
        db.configure();
      })
      .catch((error) => {
        console.log("Error on establishing connection: " + error);
      })
}

module.exports.init = initFunc;