# promise-stream

A Promises/A implementation based on streams

Promises and streams are the same thing. Except promises
are far less powerful / flexible

## Example using PromiseStream

``` js
var ReadStream = require("read-stream")
    , assert = require("assert")
    , Promise = require("promise-stream")

// one is a queue
var one = ReadStream()
    // Create a promise from one's stream.
    , pone = Promise(one.stream)

var ptwo = pone.then(function (v) {
    assert(true, "one is fulfilled")
    console.log("one", v)

    return "two"
}, function (e) {
    assert(false, "one is not rejected")
})

var pthree = ptwo.then(function (v) {
    assert(true, "two is fulfilled")
    console.log("two", v)

    throw "three"
}, function (e) {
    assert(false, "two is not rejected")
})

var pfour = pthree.then(function (v) {
    assert(false, "three is not fulfilled")
}, function (e) {
    assert(true, "three is rejected")
    console.log("three", e)
})

// Flow data through one's queue
one.end("one")
```

## Same example using just streams and domains

``` js
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

```

## Installation

`npm install promise-stream`

## Contributors

 - Raynos

## MIT Licenced
