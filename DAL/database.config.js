const _Sequelize = require('sequelize');

var sequelizeInstance = new _Sequelize('devbase', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
});

sequelizeInstance.dialect.supports.schemas = true;

module.exports.sequelizeInstance = sequelizeInstance;