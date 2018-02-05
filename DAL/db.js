var db = {};

db.Tasks = require('../models/Task').sequelizeModel;
db.Users = require('../models/User').sequelizeModel;

db.configure = () => {
    db.Tasks.belongsTo(db.Users, { as: 'User', foreignKey: 'user_id', sourceKey: 'id' });
    db.Users.hasMany(db.Tasks, { as: 'Task', foreignKey: 'user_id', targetKey: 'id' });
};

module.exports = db;