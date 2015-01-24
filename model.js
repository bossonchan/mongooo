var uuid = require("node-uuid");

module.exports = Model;

function Model() { }

Model.index = function(index) {
  this.connector.index(index);
}

Model.getOne = function (query, options, callback) {
  if (typeof options === "function") callback = options, options = {};
  var instance = new (this)(query, options, false);
  if (typeof callback === "function") instance.retrieve(callback);
  return instance;
};

Model.getList = function (query, options, callback) {
  if (typeof options === "function") callback = options, options = {};
  var instance = new (this)(query, options, true);
  if (typeof callback === "function") instance.retrieve(callback);
  return instance;
};

Model.create = function (data, callback) {
  if (!data._id) data._id = this.generateId();
  var instance = new (this)(data._id);
  this.connector.create(data, function (error, doc) {
    callback && callback(error, instance, doc);
  });
  return instance;
};

Model.destroy = function (condition, callback) {
  this.connector.setFlag({ query: condition }).remove(callback);
  return this;
};

Model.generateId = function () {
  return uuid.v4();
};

Model.mapReduce = function (map, reduce, options, callback) {
  this.connector.mapReduce(map, reduce, options, callback);
};

/*============= proto =============*/

Model.prototype.retrieve = function (callback) {
  var self = this;
  this.connector.read(function(error, docs) {
    callback(error, docs, self)
  });
};

Model.prototype.update = function (update, callback) {
  this.connector.write(update, callback);
};

Model.prototype.remove = function (callback) {
  this.connector.remove(callback);
};

Model.prototype.count = function (callback) {
  this.connector.count(callback);
};

Model.prototype.distinct = function (key, callback) {
  this.connector.distinct(key, callback);
};
