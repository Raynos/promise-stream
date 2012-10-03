var ReadWriteStream = require("read-write-stream")
    , assert = require("assert")
    , Domain = require("domain")

var domain = Domain.create()

domain.run(function () {
    var one = ReadWriteStream()
        , two = ReadWriteStream(function write(chunk, queue) {
            console.log("one", chunk)
            queue.push("two")
        })
        , three = ReadWriteStream(function write(chunk, queue) {
            console.log("two", chunk)
            queue.error("three")
        })
        , four = ReadWriteStream()

    one.stream
        .pipe(two.stream)
        .pipe(three.stream)
        .pipe(four.stream)

    domain.on("error", function (err) {
        console.log("three", err)
    })

    // Flow data through one's queu
    one.end("one")
})
