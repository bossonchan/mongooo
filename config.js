module.exports = {

  mongodb: {
    url: "mongodb://localhost:27017",
    db: "test"
  },

  collections: [
    "users",
    "messages",
    "webPages",
    "themes",
    "notifications",
    "positions",
    "histories",
    "hotWebPages",
    "topics",
    "viewPoints"
  ],

  indexes: [
    { collection: "webPages",   field: "urls",     type: { unique: true } },
    { collection: "users",      field: "username", type: { unique: true } },
    { collection: "users",      field: "email",    type: { unique: true } },
    { collection: "themes",     field: { "loc": "2d" } },
    { collection: "messages",   field: { "loc": "2d" } },
    { collection: "positions",  field: { "loc": "2d" } },
    { collection: "viewPoints", field: { "loc": "2d" } }
  ],

  anonymous: {
    _id: "anonymous",
    username: "匿名用户",
    avatar: "/avatars/s/50/0",
    signature: "暂无个性签名",
    gender: "U"
  },

  avatars: {
    prefix   : "http://localhost:10823",
    defaults : ["/avatars/s/50/0"],
    small    : "50",
    normal   : "90",
    big      : "180"
  }
};
