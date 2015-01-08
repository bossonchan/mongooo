var database = require("../database");
var should = require("should");

describe("test -- database", function () {

  it("should have right properties", function () {
    database.should.have.property("getConnection");
    database.should.have.property("getCollection");
  });

  it("should get collection", function () {
    var users = database.getCollection("users");
    users.should.have.property("name", "users");
    users.should.have.property("find");
    users.should.have.property("findOne");
    users.should.have.property("update");
    users.should.have.property("findAndModify");
    users.should.have.property("remove");
    users.should.have.property("save");
  });

  it("should connect to database correctly", function (done) {
    database.getConnection(function (db) {
      db.should.be.an.Object;
      done();
    });
  });
});
