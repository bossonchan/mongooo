mongooo
------

Offer an Object-Oriented way to use mongodb.

## Design

```javascript
var users = require("business").users;

// Query
// 1. 根据查询条件获取整个文档
users.getOne("uid-1", callback);
users.getOne({ _id: "uid-1" }, callback); // callback(error, user);
users.getList({ _id: {$in: ["uid-1", "uid-2"]} }, callback); // callback(error, users);

// 2. 根据查询条件获取再进一步获取内容
users.getOne("uid-1").getProfile(callback); // callback(error, profile)
users.getList({ username: "hahaha" }).getProfile(callback); // callback(error, profiles)

// 3. 查询中有排序、偏移量、数量
users.getOne({_id: "uid-1"}, options, callback);
users.getList({ username: "kasfj"}, options, callback);

// 4. 带有地理位置信息的查询
messages.getList({ $geoNear: { near: [100, 20], distanceField: "dist" } }, options).toResponse(callback);

// Command
// 1. 直接修改某些属性
users.getOne("uid-1").update({ $set: { username: "bossonchan" } }, callback);
users.getList({ _id: {$in: []} }).update({ $inc: "age" }, callback);

// 2. 调用其他方法修改
users.getList({ _id: {$in: []} }).addMention(callback);

// 3. 与其他文档有交互
users.getOne("uid-1").acceptFriend( users.getOne("uid-2"), callabck );

// 4. 删除文档
users.getOne("uid-1").remove(callback);
users.getList({ _id: {$in: []} }).remove(callback);
```

## TODO

1. 插件机制
2. 性能，缓存优化
