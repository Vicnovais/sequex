var BaseModel = require('./../arch/BaseModel.js');
var Sequelize = require('sequelize');

var structure = {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING(255),
        allowNull: false
    }
};

var defineOptions = {
    tableName: 'User',
    timestamps: true,
    schema: "devbase"
};

var User = new BaseModel('user', structure, defineOptions);

var init = function () {
}

module.exports.init = init;
module.exports.model = User;
module.exports.sequelizeModel = User.model;