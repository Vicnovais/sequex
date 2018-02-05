var requireDir = require('require-dir');

module.exports = class BaseController {
    constructor(name, apiUrl, model, customActions) {
        this.name = name;
        this.apiUrl = apiUrl;
        this.model = model;
        this.customActions = customActions;
    }

    get(req, res, next) {
        if (!!this.model) {
            var extraOptions = arguments[3];

            if (req.query.hasOwnProperty("pagesize") && req.query.hasOwnProperty("pageindex")) {
                this.getPage(req, res, next, extraOptions);
            }
            else {
                var options = {};
    
                this._attachInclude(extraOptions, options);
                this._attachFilter(req, options);
                this._attachSorting(req, options);

                this.model.findAll(options)
                .then(result => {
                    res.json(result);
                })
                .catch(error => {
                    throw { status: 500, message: error };
                });
            }
        }
        else {
            throw { status: 500, message: 'Model is required.' };
        }
    }

    getPage(req, res, next, extraOptions) {
        if (req.query.hasOwnProperty("pagesize") && req.query.hasOwnProperty("pageindex")) {
            var pageSize = parseInt(req.query.pagesize);
            var pageIndex = parseInt(req.query.pageindex);
            var offset = pageSize * (pageIndex - 1);
            var options = {
                offset: offset,
                limit: pageSize
            };

            this._attachInclude(extraOptions, options);
            this._attachFilter(req, options);
            this._attachSorting(req, options);

            this.model.findAndCountAll(options)
            .then(result => {
                res.json(result);
            })
            .catch(error => {
                throw { status: 500, message: error };
            });
        }
        else {
            throw { status: 500, message: 'PageIndex and PageSize are required.' };
        }
    }

    _attachSorting(req, options) {
        var sortField = req.query.sortfield;
        var sortOrder = req.query.sortorder;

        if (!!sortField && !!sortOrder) {
            if (sortField.indexOf(".") !== -1) {
                var arrayOrder = [].concat(sortField.split("."));
                arrayOrder.push(sortOrder.toUpperCase());

                options.order = [
                    arrayOrder    
                ]
            }
            else {
                options.order = [
                    [ sortField, sortOrder.toUpperCase() ]
                ]
            }
        }
    }

    _attachFilter(req, options) {
        if (req.query.hasOwnProperty("filter") && req.query.hasOwnProperty("term") && req.query.term !== "") {
            options.where = this._buildIncludeFilter(req, this._buildFilter(req)).where;
        }
    }

    _attachInclude(extraOptions, options) {
        if (!!extraOptions && !!extraOptions.include) {
            options.include = extraOptions.include;
        }
    }

    _buildIncludeFilter(req, filter) {
        if (req.query.hasOwnProperty("filter") && req.query.hasOwnProperty("term")) {
            var that = this;
            var ignoreProperties = ["createdAt", "updatedAt"];
            var filterType = req.query.filter;
            var term = req.query.term;
            filter = filter || { 
                where: { 
                    $or: []
                }
            };

            if (filterType === "global" && term !== "") {
                var rawAttributes = this.model.getRawAttributes();

                if (!!this.model.model.associations && Object.keys(this.model.model.associations).length > 0) {
                    Object.keys(rawAttributes).forEach((key) => {
                        if (ignoreProperties.indexOf(key) === -1) {
                            var currentModel = rawAttributes[key].Model;
                            var targetKey = Object
                                            .keys(currentModel.associations)
                                            .filter((keyAssociation) => {
                                                return currentModel.associations[keyAssociation].identifier === key;
                                            });
                                
                            if (!!targetKey && targetKey.length === 1) {
                                targetKey = targetKey[0];
                                var targetModel = currentModel.associations[targetKey].target;
                                var targetAttributes = targetModel.attributes;

                                Object.keys(targetAttributes).forEach((targetAttrKey) => {
                                    var whereKey = "$" + targetKey;
                                    var obj = {};
                                    var attrType = targetModel.attributes[targetAttrKey].type.key;

                                    if (attrType === "DATE" && isNaN(Date.parse(term))) {
                                        return;
                                    }

                                    if (this._isNumberType(attrType) && isNaN(term)) {
                                        return;
                                    }

                                    var operator = this._getOperator(attrType);
                                    var value = null;
                                    if (!!!operator) operator = "$eq";

                                    switch(operator) {
                                        case "$like": value = "%" + term + "%";
                                                    break;
                                        case "$eq": value = term;
                                                    break;
                                        default: value = term;
                                    }

                                    whereKey += "." + targetAttrKey + "$";

                                    obj[whereKey] = {};
                                    obj[whereKey][operator] = value;
                                    filter.where.$or.push(obj);
                                });
                            }
                        }
                    });
                }
            }

            return filter;            
        }
    }

    _buildFilter(req) {
        if (req.query.hasOwnProperty("filter") && req.query.hasOwnProperty("term")) {
            var ignoreProperties = ["createdAt", "updatedAt"];
            var filterType = req.query.filter;
            var term = req.query.term;
            var filter = { 
                where: { 
                    $or: []
                }
            };

            if (filterType === "global" && term !== "") {
                var rawAttributes = this.model.getRawAttributes();

                Object.keys(rawAttributes).forEach((key) => {
                    if (ignoreProperties.indexOf(key) === -1) {
                        var obj = {};
                        var attrType = this._getAttributeType(key);

                        if (attrType === "DATE" && isNaN(Date.parse(term))) {
                            return;
                        }

                        if (this._isNumberType(attrType) && isNaN(term)) {
                            return;
                        }

                        var operator = this._getOperator(attrType);
                        var value = null;
                        if (!!!operator) operator = "$eq";

                        switch(operator) {
                            case "$like": value = "%" + term + "%";
                                        break;
                            case "$eq": value = term;
                                        break;
                            default: value = term;
                        }

                        obj[key] = {};
                        obj[key][operator] = value;

                        filter.where.$or.push(obj);
                    }
                });
            }

            return filter;            
        }
    }

    _isNumberType(attrType) {
        return attrType === "TINYINT"
            || attrType === "SMALLINT"
            || attrType === "BIGINT"
            || attrType === "INTEGER";
    }

    _getAttributeType(attrName) {
        var attr = this.model.getAttributes()[attrName];
        if (!!attr) {
            return attr.type.key;
        }
        else return null;
    }

    _getAttributeTypeByModel(model, attrName) {
        var attr = model.getAttributes()[attrName];
        if (!!attr) {
            return attr.type.key;
        }
        else return null;
    }

    _getOperator(attrType) {
        var objCfg = {
            "STRING": "$like",
            "CHAR": "$like",
            "DATE": "$eq",
            "TINYINT": "$eq",
            "SMALLINT": "$eq",
            "BIGINT": "$eq",
            "INTEGER": "$eq"
        };

        return objCfg[attrType];
    }

    getById(req, res) {
        if (!!this.model) {
            if (!!req.params.id) {
                var options = {
                    where: { id: req.params.id }
                };
                var extraOptions = arguments[3];
                
                this._attachInclude(extraOptions, options);

                this.model.findAll(options)
                .then(result => {
                    res.json(result);
                })
                .catch(error => {
                    throw { status: 500, message: error };
                });
            }
            else {
                throw { status: 500, message: 'Id is required.' };
            }
        }
        else {
            throw { status: 500, message: 'Model is required.' };
        }
    }

    create(req, res) {
        if (!!this.model) {
            if (!!req.body) {
                var extraOptions = arguments[3];
                var options = {};

                if (!!extraOptions) {
                    if (!!extraOptions.include) {
                        options.include = extraOptions.include;
                    }
                }

                this.model.create(req.body, options)
                .then(result => {
                    res.json(result);
                })
                .catch(error => {
                    throw { status: 500, message: error };
                });
            }
            else {
                throw { status: 500, message: 'New registry data is required.' };
            }
        }
        else {
            throw { status: 500, message: 'Model is required.' };
        }
    }

    update(req, res) {
        if (!!this.model) {
            if (!!req.params.id) {
                if (!!req.body) {
                    var extraOptions = arguments[3];
                    var options = {
                        where:  { id: req.params.id }
                    };

                    if (!!extraOptions) {
                        if (!!extraOptions.include) {
                            options.include = extraOptions.include;
                        }
                    }

                    this.model.update(req.body, { where:  { id: req.params.id } })
                    .then(result => {
                        if (result[0] === 1) {
                            this.model.findAll(options).then(ret => {
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
                throw { status: 500, message: 'Id is required.' };
            }
        }
        else {
            throw { status: 500, message: 'Model is required.' };
        }
    }

    deleteById(req, res) {
        if (!!this.model) {
            if (!!req.params.id) {
                this.model.destroy({ where: { id: req.params.id } })
                .then(result => {
                    res.json(result);
                })
                .catch(error => {
                    throw { status: 500, message: error };
                });
            }
            else {
                throw { status: 500, message: 'Id is required.' };
            }
        }
        else {
            throw { status: 500, message: 'Model is required.' };
        }
    }
};