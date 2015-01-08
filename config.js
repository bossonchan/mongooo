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
  ]
};
