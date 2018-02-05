var expressSession = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var cookieParser = require('cookie-parser')


var init = function (app, express, auth) {
    app.use(auth.initialize());
    app.use(bodyParser.urlencoded({
        'extended': 'true'
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(expressSession({secret: 'sessionSecret'}));
    app.use(cookieParser());
}

module.exports.init = init;