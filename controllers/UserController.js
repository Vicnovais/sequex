var BaseController = require('./../arch/BaseController');
var User = require('./../models/User');

var UserController = class UserController extends BaseController { };
var _UserController = new UserController('User', 'user', User.model);

module.exports = _UserController;