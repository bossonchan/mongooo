var factory = require("../");
var should = require("should");

describe("test -- factory", function () {
  it("should have correct property", function (done) {
    factory.should.have.property("models");
    factory.should.have.property("build");
    
    var Users = factory.build("users");
    factory.models.should.have.property("users", Users);

    Users.should.have.property("getOne");
    Users.should.have.property("getList");
    Users.should.have.property("create");
    Users.should.have.property("destroy");
    Users.should.have.property("connector");
    Users.should.have.property("index");

    Users.index({ field: "name", type: { unique: true }});

    var user = Users.getOne({});

    user.should.have.property("retrieve");
    user.should.have.property("update");
    user.should.have.property("remove");

    Users.create({name: "Shin"}, function (error, user) {
      (!error).should.be.true;

      user.retrieve(function (error, data) {
        (!error).should.be.true;
        data.should.have.property("_id");
        data.should.have.property("name");

        Users.destroy({}, function (error) {
          (!error).should.be.true;
          done();
        });
      });
    });
  });
});
