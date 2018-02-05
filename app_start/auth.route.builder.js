var jwt = require("jwt-simple");
var cfg = require("./../authentication/config.js");
var database = require('./../DAL/database.config.js');
var path = require('path');

var users = [
  { userName: "Victor", password: "123" },
  { userName: "João", password: "456" },
  { userName: "Henrique", password: "789" }
];

module.exports.buildRoute = function (app, auth) {  
  app.get("/cookies", function (req, res) {
    res.json(req.cookies);
  }),

  app.post("/signout", function (req, res) {
    req.session.destroy();
    res
      .clearCookie("user")
      .clearCookie("auth")
      .redirect("/");
  }),

  app.post("/token", function(req, res) {
    if (req.body.username && req.body.password) {
      var userName = req.body.username;
      var password = req.body.password;

      var existingUser = users.filter(current => {
        return current.userName === userName && current.password === password;
      });

      if (!!existingUser && existingUser.length === 1) {
        existingUser = existingUser[0];

        var payload = { user: existingUser.userName, datetime: new Date(), secret: "secretToken" };
        var token = jwt.encode(payload, cfg.jwtSecret);

        req.session.loggedIn = true;
        res
          .cookie('user', payload.user, { maxAge: 1000 * 60 * 30, httpOnly: true })
          .cookie('auth', token, { maxAge: 1000 * 60 * 30, httpOnly: true })
          .redirect("/");
      }
      else {
        res.sendStatus(401);
      }
    } else {
      res.sendStatus(401);
    }
  });
};