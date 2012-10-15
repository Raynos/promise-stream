var ReadStream = require("read-stream")
    , assert = require("assert")
    , Promise = require("..")

var p = rejected("foo")
p.then(function () {

}, function (err) {
    console.log("error?", err)
    assert.equal(err, "foo")
})

function rejected(reason) {
    var rs = ReadStream()
        , promise = Promise(rs.stream)

    rs.stream.emit("error", reason)
    return promise
}
