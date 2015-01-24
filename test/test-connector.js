var Connector = require("../connector");
var should = require("should");

describe("test -- connector", function () {

  var connector = new Connector("messages");
  connector.index({ "field": { "loc": "2d" } });

  it("should perform all methods correctly", function (done) {
    connector.should.have.property("collection");
    connector.should.have.property("read");
    connector.should.have.property("write");
    connector.should.have.property("remove");
    connector.should.have.property("create");
    connector.should.have.property("performAction");
    connector.should.have.property("performAsyncAction");
    connector.should.have.property("setFlag");
    connector.should.have.property("resetFlag");

    connector.create({ _id: "" + Math.random(), content: "test" }, function (error, doc) {
      (!error).should.be.true;

      doc.should.have.property("content");
      doc.should.have.property("_id");

      var instance = function () { return connector.setFlag({ query: {_id: doc._id} }); };

      instance().read(function (error, data) {
        (!error).should.be.true;

        data.should.have.property("content");
        data.should.have.property("_id");

        instance().performAction(function (doc) {
          doc.name = "testing";
          return doc;
        }, function (error, doc) {
          (!error).should.be.true;
          doc.should.have.property("name", "testing");

          instance().performAsyncAction(function (doc, next) {
            doc.isSet = true;
            next(null, doc);
          }, function (error, doc) {
            (!error).should.be.true;
            doc.should.have.property("isSet", true);

            instance().write({ name: "me" }, function (error, doc) {
              (!error).should.be.true;
              doc.should.have.property("name", "me");
              done();
            });
          });
        });
      });
    });
  });

  it("should work in aggregate query", function (done) {
    connector.should.have.property("isAggregateQuery");
    connector.should.have.property("getAggregatePipeline");

    connector.create({ loc: { lng: 100, lat: 20 } }, function (error, doc) {
      (!error).should.be.true;
      connector.setFlag({ query: [{ $geoNear: { near: [100, 19], distanceField: "dist" } }] }).read(function (error, data) {
        (!error).should.be.true;
        data.should.have.properties("dist", "loc");

        connector.setFlag({ query: [{ $geoNear: { near: [100, 19], distanceField: "dist" } }] }).write({ name: "xxx" }, function (error, data) {
          error.should.be.an.Error;
          done();
        });
      });
    });
  });
});
