var passport = require("passport");
var passportJWT = require("passport-jwt");
var cfg = require("./config.js");
var ExtractJwt = passportJWT.ExtractJwt;
var Strategy = passportJWT.Strategy;
var params = {
  secretOrKey: cfg.jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};
var users = [
  { userName: "Victor", password: "123" },
  { userName: "João", password: "456" },
  { userName: "Henrique", password: "789" }
];

module.exports = function() {
  var strategy = new Strategy(params, function (payload, done) {
    var user = users.filter(current => {
      return current.userName === payload.user;
    })[0];
    
    if (user) {
      return done(null, { user: user });
    } 
    else {
      return done(new Error("User not found"), null);
    }
  });
  passport.use(strategy);
  
  return {
    initialize: function() {
      return passport.initialize();
    },
    authenticate: function() {
      return passport.authenticate("jwt", cfg.jwtSession);
    }
  };
};