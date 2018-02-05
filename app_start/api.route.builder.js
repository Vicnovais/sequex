var requireDir = require('require-dir');
var controllersDir = requireDir('../controllers');

var buildRoute = function (app, auth) {
    var controllers = controllersDir;
    
    for (var name in controllers) {
        var controller = controllers[name];

        if (!!controller.customActions) {
            controller.customActions.forEach(current => {
                buildCustom(app, controller, auth, current);
            });
        }
        
        build(app, controller, auth);
    }
}

var buildCustom = function (app, controller, auth, actionName) {
    app.post('/api/' + controller.apiUrl + '/' + actionName, auth.authenticate(), controller[actionName].bind(controller));
}

var build = function (app, controller, auth) {
    app.get('/api/' + controller.apiUrl, auth.authenticate(), controller.get.bind(controller));
    app.get('/api/' + controller.apiUrl + '/:id', auth.authenticate(), controller.getById.bind(controller));
    app.post('/api/' + controller.apiUrl, auth.authenticate(), controller.create.bind(controller));
    app.post('/api/' + controller.apiUrl + '/:id', auth.authenticate(), controller.update.bind(controller));
    app.delete('/api/' + controller.apiUrl + '/:id', auth.authenticate(), controller.deleteById.bind(controller));
}

module.exports.buildRoute = buildRoute;