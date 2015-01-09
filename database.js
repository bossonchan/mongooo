var MongoClient = require("mongodb").MongoClient;
var config = require("./config");
var async  = require("async");
var client = null;

function connectToDatabase(callback) {
  if (client) {
    process.nextTick(function () {
      callback(client);
    });
  } else {
    MongoClient.connect(config.mongodb.url, function (error, mongoClient) {
      if (error) throw error;
      client = mongoClient.db(config.mongodb.db);
      callback(client);
    });
  }
}

function createIndex(collection, index, callback) {
  if (!index || !index.field) return callback();
  if (index.type) {
    collection.ensureIndex(index.field, index.type, callback);
  } else {
    collection.ensureIndex(index.field, callback);
  }
}

function loadCollection(client, name, index, callback) {
  var collection = client[name];
  if (collection) return callback(collection);
  collection = client[name] = client.collection(name);
  createIndex(collection, index, function () {
    callback(collection);
  });
}

exports.getConnection = connectToDatabase;
exports.getCollection = function (name, index) {
  var collection = {};
  collection.name = name;
  ["mapReduce", "distinct", "aggregate", "count", "insert", "save", "findOne", "update", "findAndModify", "remove"].forEach(function (method) {
    collection[method] = (function (method) {
      return function () {
        var args = arguments;
        connectToDatabase(function (db) {
          loadCollection(db, name, index, function (collection) {
            collection[method].apply(collection, args);
          });
        });
      };
    })(method);
  });

  // rewrite `find` method
  collection.find = function (query, options, callback) {
    connectToDatabase(function (db) {
      loadCollection(db, name, index, function (collection) {
        collection.find(query, options).toArray(callback);
      });
    });
  };

  collection.createIndex = function (index) {
    connectToDatabase(function (db) {
      loadCollection(db, name, index, function (collection) {
        createIndex(collection, index, function () {});
      });
    });
  };

  return collection;
};

