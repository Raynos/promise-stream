var toArray = require("write-stream").toArray
    , ReadStream = require("read-stream")
    , PromiseState = {
        UNRESOLVED: 0
        , FULFILLED: 1
        , REJECTED: 2
    }

module.exports = Promise

function Promise(stream) {
    var state = PromiseState.UNRESOLVED
        , reason
        , value

    return {
        then: then
    }

    function then(fulfilledCallback, rejectedCallback) {
        // Retarded sync case for when the promise is already fulfilled.
        if (state !== PromiseState.UNRESOLVED) {
            return handleSync(fulfilledCallback, rejectedCallback)
        }

        var fulfillStream

        // Rejection is simply listening on errors
        if (rejectedCallback) {
            // Promises suck. No way to send multiple errors
            stream.once("error", cleanup)
        }

        // Fullfillment is simply waiting for the stream to end with data
        if (fulfilledCallback) {
            fulfillStream = stream.pipe(toArray(finished))
        }

        // What? Promises return promises? >_<
        var returnedQueue = ReadStream()

        return Promise(returnedQueue.stream)

        function cleanup(err) {
            state = PromiseState.REJECTED
            // If rejected then kill fulfillment handler
            if (fulfillStream) {
                stream.unpipe(fulfillStream)
            }

            reason = err

            try {
                var result = rejectedCallback(err)

                // Fullfill the returned promise with the result
                // Only one value >_<.
                // Y U NO STREAM INFINITE MANY VALUES
                returnedQueue.push(result)
                returnedQueue.end()
            } catch (err) {
                returnedQueue.error(err)
            }
        }

        function finished(list) {
            state = PromiseState.FULFILLED
            // If fulfilled do not allow rejection to be called
            if (rejectedCallback) {
                stream.removeListener("error", cleanup)
            }

            value = list

            try {
                var result = fulfilledCallback(list)

                // Fullfill the returned promise with the result
                // Only one value >_<
                // Y U NO STREAM INFINITE MANY VALUES
                returnedQueue.push(result)
                returnedQueue.end()
            } catch (err) {
                returnedQueue.error(err)
            }
        }
    }

    function handleSync(fulfilledCallback, rejectedCallback) {
        if (state === PromiseState.FULFILLED && fulfilledCallback) {
            // Not allowed to be fullfilled inside the then function -.-
            process.nextTick(function () {
                fulfilledCallback(value)
            })
        } else if (state === PromiseState.REJECTED && rejectedCallback) {
            // Not allowed to be rejected inside the then function -.-
            process.nextTick(function () {
                rejectedCallback(reason)
            })
        }
    }
}
