var database = require("./database");
var async = require("async");
var Cache = require("./cache");

module.exports = Connector;

function Connector(collection) {
  this.collection = database.getCollection(collection);
  this.cache = new Cache();
  this.flag = {
    query  : {},
    options: {},
    multi  : false
  };
}

Connector.prototype.index = function(index) {
  this.collection.createIndex(index);
};

Connector.prototype.setFlag = function (flag) {
  this.flag.query   = flag.query || {};
  this.flag.options = flag.options || {};
  this.flag.multi   = flag.multi || false;
  return this;
};

Connector.prototype.resetFlag = function () {
  this.flag = {
    query  : {},
    options: {},
    multi  : false
  };
  return this;
};

Connector.prototype.isAggregateQuery = function () {
  var query = this.flag.query;
  return Object.prototype.toString.call(query) === "[object Array]";
};

Connector.prototype.getAggregatePipeline = function () {
  var pipeline = this.flag.query;
  var options  = this.flag.options;
  if (options.sort)  pipeline.push({ $sort:  options.sort  });
  if (options.skip)  pipeline.push({ $skip:  options.skip  });
  if (options.limit) pipeline.push({ $limit: options.limit });
  return pipeline;
};

Connector.prototype.read = function (callback) {
  var self = this;
  if (this.flag.multi) {
    if (this.isAggregateQuery()) {
      this.collection.aggregate(this.getAggregatePipeline(), function (error, docs) {
        if (error) return callback(error);
        callback(null, docs || [], self);
      });
    } else {
      this.collection.find(this.flag.query, this.flag.options, function (error, docs) {
        if (error) return callback(error);
        callback(null, docs || [], self);
      });
    }
  } else {
    var temp = this.cache.getCacheByFlag(this.flag);
    if (temp) {
      process.nextTick(function () { callback(null, temp); });
    } else {
      if (this.isAggregateQuery()) {
        this.collection.aggregate(this.getAggregatePipeline(), function (error, docs) {
          if (error || !docs || !docs[0]) return callback(error);
          var doc = docs[0];
          self.cache.setCacheById(doc);
          callback(error, doc, self);
        });
      } else {
        this.collection.findOne(this.flag.query, this.flag.options, function (error, doc) {
          if (error || !doc) return callback(error, doc);
          self.cache.setCacheById(doc);
          callback(error, doc, self);
        });
      }
    }
  }
  return this.resetFlag();
};

Connector.prototype.write = function (update, callback) {
  if (this.isAggregateQuery()) {
    callback && callback(new Error("cannot perform write action to aggregate query"));
  } else {
    var query = this.flag.query, self = this;
    if (this.flag.multi) {
      var options = { multi: true, upsert: false, writeConcern: true };
      this.collection.update(query, update, options, function (error) {
        if (error) return (callback && callback(error));
        self.collection.find(query, {}, function (error, docs) {
          if (error) return (callback && callback(error));
          docs = docs || [];
          docs.forEach(function (doc) {
            self.cache.setCacheById(doc);
          });
          callback && callback(null, docs);
        });
      });
    } else {
      var options = { upsert : false, new: true }, self = this;
      this.collection.findAndModify(query, {}, update, options, function (error, doc) {
        if (error || !doc) return (callback && callback(error, doc));
        self.cache.setCacheById(doc);
        callback && callback(error, doc);
      });
    }
  }
  return this.resetFlag();
};

Connector.prototype.remove = function (callback) {
  if (this.isAggregateQuery()) {
    callback(new Error("cannot perform remove to aggregate query"));
  } else {
    this.collection.remove(this.flag.query, callback);
    this.cache.delCacheByFlag(this.flag);
  }
  return this.resetFlag();
};

Connector.prototype.count = function (callback) {
  if (this.isAggregateQuery()) {
    callback(new Error("cannot perform count to aggregate query"));
  } else {
    this.collection.count(this.flag.query, callback);
  }
  return this.resetFlag();
};

Connector.prototype.distinct = function (key, callback) {
  if (this.isAggregateQuery()) {
    callback(new Error("cannot perform count to aggregate query"));
  } else {
    this.collection.distinct(key, this.flag.query, callback);
  }
  return this.resetFlag();
};

Connector.prototype.mapReduce = function (map, reduce, options, callback) {
  if (this.isAggregateQuery()) {
    callback(new Error("cannot perform mapReduce to aggregate query"));
  } else {
    if (!options.query) options.query = this.flag.query;
    this.collection.mapReduce(map, reduce, options, callback);
  }
  return this.resetFlag();
};

Connector.prototype.create = function (data, callback) {
  var self = this;
  this.collection.insert(data, {w: 1}, function (error, docs) {
    if (error) return callback(error);
    if (!docs || !docs.length) return callback(new Error("Insert falied."));
    self.cache.setCacheById(docs[0]);
    callback(error, docs[0]);
  });
  return this.resetFlag();
};

Connector.prototype.performAction = function (action, callback) {
  var isList = this.flag.multi;
  var self = this;
  return this.read(function (error, data) {
    if (error) return callback(error);
    if (!data) return callback(new Error("cannot find docs in " + self.collection));
    try {
      var result = null;
      if (isList) {
        result = data.map(action);
      } else {
        result = action(data);
      }
      callback(null, result);
    } catch(err) {
      callback(err);
    }
  });
};

Connector.prototype.performAsyncAction = function (action, callback) {
  var isList = this.flag.multi;
  var self = this;
  return this.read(function (error, data) {
    if (error) return callback(error);
    if (!data) return callback(new Error("cannot find docs in " + self.collection));
    if (isList) {
      async.map(data, action , callback);
    } else {
      action(data, callback);
    }
  });
};
