var BaseController = require('./../arch/BaseController');
var Task = require('./../models/Task');
var User = require('./../models/User');

var TaskController = class TaskController extends BaseController { };
var _TaskController = new TaskController('Task', 'task', Task.model, ['setDone']);

var oldGet = _TaskController.get;
_TaskController.get = function (req, res, next) {
    oldGet.apply(_TaskController, [req, res, next, 
        { 
            include: [
                { model: User.sequelizeModel, as: 'User', required: true }
            ] 
        }
    ]);
};

var oldGet = _TaskController.getById;
_TaskController.getById = function (req, res, next) {
    oldGet.apply(_TaskController, [req, res, next, 
        { 
            include: [
                { model: User.sequelizeModel, as: 'User', required: true }
            ] 
        }
    ]);
};

_TaskController.update = function (req, res) {
    if (!!_TaskController.model) {
        if (!!req.params.id) {
            if (!!req.body) {
                var options = {
                    where:  { id: req.params.id }
                };

                _TaskController.model.update(req.body, options)
                .then(result => {
                    if (result[0] === 1) {
                        _TaskController.model.findAll(options).then(ret => {
                            res.json(ret[0]);
                        });
                    }
                    else res.json(result);
                })
                .catch(error => {
                    throw { status: 500, message: error };
                });
            }
            else {
                throw { status: 500, message: 'Values are required.' };
            }    
        }
        else {
            throw { status: 500, message: 'Params are required.' };
        }
    }
    else {
        throw { status: 500, message: 'Model is required.' };
    }
}

_TaskController.setDone = function (req, res) {
    if (!!_TaskController.model) {
        if (!!req.body) {
            var options = {
                where:  { id: req.body.id }
            };

            _TaskController.model.update({ done: 1 }, options)
            .then(result => {
                if (result[0] === 1) {
                    _TaskController.model.findAll(options).then(ret => {
                        res.json(ret[0]);
                    });
                }
                else res.json(result);
            })
            .catch(error => {
                throw { status: 500, message: error };
            });
        }
        else {
            throw { status: 500, message: 'Values are required.' };
        } 
    }
    else {
        throw { status: 500, message: 'Model is required.' };
    }
}

module.exports = _TaskController;