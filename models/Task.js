var BaseModel = require('./../arch/BaseModel.js');
var Sequelize = require('sequelize');

var structure = {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.UUID,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    done: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0
    }
};

var defineOptions = {
    tableName: 'Task',
    timestamps: true,
    schema: "devbase"
};

var Task = new BaseModel('task', structure, defineOptions);

var init = function () {
}

module.exports.init = init;
module.exports.model = Task;
module.exports.sequelizeModel = Task.model;