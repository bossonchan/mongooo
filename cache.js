/* 使用LFU策略来管理内存， 内存最大容量为200条 */
function Cache() {
  this.maxRecords = 200;
  this.count = 0;
  this.store = {};
  this.__defineGetter__("isFull", function () {
    return this.count >= this.maxRecords;
  });
}

Cache.prototype.get = function (key) {
  var record = this.store[key];
  if (record) {
    return record.data;
  }
  return null;
};

Cache.prototype.set = function (key, val) {
  if (this.store[key]) {
    // update
    this.store[key] = {
      data: val,
      insertTime: new Date()
    };
  } else {
    // insert or replace
    if (this.isFull) {
      var keyToDelete = this.findLastOne();
      this.del(keyToDelete);
    }
    this.store[key] = {
      data: val,
      insertTime: new Date()
    };
    this.count++;
  }
};

Cache.prototype.del = function (key) {
  if (this.store[key]) {
    this.count--;
  }
  delete this.store[key];
};

Cache.prototype.findLastOne = function () {
  var lastOneKey, lastOneInsertTime;
  for (var key in this.store) {
    var record = this.store[key];
    if (!lastOneInsertTime || record.insertTime < lastOneInsertTime) {
      lastOneKey = key;
      lastOneInsertTime = record.insertTime;
    }
  }
  return lastOneKey;
};

Cache.prototype.setCacheById = function (obj) {
  if (!obj._id) return;
  var key = JSON.stringify({ _id: obj._id });
  this.set(key, obj);
};

Cache.prototype.getCacheByFlag = function (flag) {
  var query   = flag.query;
  var options = flag.options;
  if (options.skip !== undefined) return null;
  if (options.limit !== undefined) return null;
  if (options.sort !== undefined) return null;

  var key = JSON.stringify(query);
  return this.get(key);
};

Cache.prototype.delCacheByFlag = function (flag) {
  var query = flag.query;
  var key = JSON.stringify(query);
  this.del(key);
};

module.exports = Cache;
