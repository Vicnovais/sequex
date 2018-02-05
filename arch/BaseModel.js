var database = require('./../DAL/database.config.js');

module.exports = class BaseModel {
    constructor(modelName, config, defineOptions) {
        this._sequelize = database.sequelizeInstance;
        this.modelName = modelName;
        this.model = this.createModel(config, defineOptions);
    }

    createModel(options, defineOptions) {
        return this._sequelize.define(this.modelName, options, defineOptions);
    }

    sync(options, thenCallback) {
        var that = this;
        if (!!this.model) {
            return new Promise(function (resolve, reject) {
                that
                    .model
                    .sync(options)
                    .then((result) => resolve(result));
            });
        }
        else throw new Error("Model " + this.modelName + " cannot be null.");
    }

    create(options) {
        var that = this;
        if (!!this.model) {
            return new Promise(function (resolve, reject) {
                that.model.create(options).then(result => {
                    resolve(result);
                });
            });
        }
        else throw new Error("Model " + this.modelName + " cannot be null.");
    }

    findAll(options) {
        var that = this;
        if (!!this.model) {
            return new Promise(function (resolve, reject) {
                that.model.findAll(options).then(result => {
                    resolve(result);
                });
            });
        }
        else throw new Error("Model " + this.modelName + " cannot be null.");
    }

    findAndCountAll(options) {
        var that = this;
        if (!!this.model) {
            return new Promise(function (resolve, reject) {
                that.model.findAndCountAll(options).then(result => {
                    resolve(result);
                });
            });
        }
        else throw new Error("Model " + this.modelName + " cannot be null.");
    }

    findById(id) {
        var that = this;
        if (!!this.model) {
            return new Promise(function (resolve, reject) {
                that.model.findById(id).then(result => {
                    resolve(result);
                });
            });
        }
        else throw new Error("Model " + this.modelName + " cannot be null.");
    }

    update(values, options) {
        var that = this;
        if (!!this.model) {
            return new Promise(function (resolve, reject) {
                that.model.update(values, options).then(result => {
                    resolve(result);
                });
            });
        }
        else throw new Error("Model " + this.modelName + " cannot be null.");
    }

    destroy(options) {
        var that = this;
        if (!!this.model) {
            return new Promise(function (resolve, reject) {
                that.model.destroy(options).then(result => {
                    resolve(result);
                });
            });
        }
        else throw new Error("Model " + this.modelName + " cannot be null.");
    }

    getRawAttributes() {
        if (!!this.model) {
            return this.model.rawAttributes;
        }
        else throw new Error("Model " + this.modelName + " cannot be null.");
    }

    getAttributes() {
        if (!!this.model) {
            return this.model.attributes;
        }
        else throw new Error("Model " + this.modelName + " cannot be null.");
    }
};