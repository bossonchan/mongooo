var Model = require("./model");
var Connector = require("./connector");

var factory = module.exports = {};

factory.models = {};

factory.build = function (name) {

  if (this.models[name]) return this.models[name];

  var connector = new Connector(name);

  var Factory = function (query, options, multi) {
    Model.call(this);

    if (typeof query === "string") query = { _id: query };
    if (typeof query !== "object")
      throw new Error("instance requires an id string or query object as first argument.");

    if (typeof options !== "object") options = {};

    multi = !!multi;

    this.__defineGetter__("connector", function () {
      return this.constructor.connector.setFlag({
        query  : query,
        options: options,
        multi  : multi
      });
    });

    this.__defineGetter__("collection", function () {
      return this.constructor.collection;
    });

  };

  // inherits
  Factory.__proto__ = Model;
  Factory.prototype.__proto__ = Model.prototype;

  Factory.__defineGetter__("connector", function () {
    return connector;
  });

  Factory.__defineGetter__("collection", function () {
    return name;
  });

  this.models[name] = Factory;

  return Factory;
};

factory.config = function (userConfig) {
  var config = require("./config");
  for (var key in userConfig) {
    config[key] = userConfig[key];
  }
};
