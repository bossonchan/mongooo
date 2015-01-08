var MongoClient = require("mongodb").MongoClient;
var config = require("./config");
var async  = require("async");
var client  = null;

function connectToDatabase(callback) {
  if (client) {
    process.nextTick(function () {
      callback(client);
    });
  } else {
    MongoClient.connect(config.mongodb.url, function (error, mongoClient) {
      if (error) throw error;
      client = mongoClient.db(config.mongodb.db);
      loadCollections(client);
      createIndexes(client, function () {
        callback(client);
      });
    });
  }
}

function loadCollections(client) {
  config.collections.forEach(function (collection) {
    client[collection] = client.collection(collection);
  });
}

function createIndexes(client, callback) {
  async.eachSeries(config.indexes, function (index, next) {
    if (index.type) {
      client[index.collection].ensureIndex(index.field, index.type, next);
    } else {
      client[index.collection].ensureIndex(index.field, next);
    }
  }, callback);
}

exports.getConnection = connectToDatabase;

exports.getCollection = function (name) {
  var collection = {};
  collection.name = name;
  ["mapReduce", "distinct", "aggregate", "count", "insert", "save", "findOne", "update", "findAndModify", "remove"].forEach(function (method) {
    collection[method] = (function (method) {
      return function () {
        var args = arguments;
        connectToDatabase(function (db) {
          var collection = db[name];
          collection[method].apply(collection, args);
        });
      };
    })(method);
  });

  // rewrite `find` method
  collection.find = function (query, options, callback) {
    connectToDatabase(function (db) {
      var collection = db[name];
      collection.find(query, options).toArray(callback);
    });
  };

  return collection;
};
