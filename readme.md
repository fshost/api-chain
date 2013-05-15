## api-chain
---
When performing many asynchronous operations in javascript, nested callbacks can become difficult to read and maintain.  Api-chain is a very light and easy to use interface for creating a fluent synchronous style API for control flow of asynchronous javascript.  It is packaged as a commonJS module through NPM but not only works with Node.js, but has been tested and works with PhantomJS as well.

### installation
    npm install api-chain

### usage example
    // require api-chain module
    var api = require('api-chain');

    // define your api by passing custom methods to `create
    var myApi = api.create({
        log: function (msg, next) {
            log += msg;
            next();
        },
        readyUp: function (next) {
            // context, i.e. 'this' within a method is the api object
            var api = this;
            // simulate an async op
            setTimeout(function () {
                log += 'ready!';
                next();
            }, 1500);
        },
        done: function (msg) {
            if (msg) console.log(msg);
        }
    });
    // at this point you could package the above within a new module

    // an example of using 'myApi'
    myApi
        .log('starting up...')
        .wait(1000)
        .log('ready up...')
        .readyUp()
        .log('wait for x...')
        .until(function () {
            return true;
        })
        .log('some more async js...')
        .chain(function (next) {
            setTimeout(function () {
                next();
            }, 1000);
        })
        .done('all done');

### options
| name           | type | default     | description                                                     |
|:---------------|:-----|:------------|:----------------------------------------------------------------|
| onError        | fn   | undefined   | called when error is emitted unless error method is overwritten |
| throwErrors    | bool | true        | whether to throw unhandled errors (ignored if onError exists)   |
| continueErrors | bool | false       | whether to resume execution of commands after errors occur      |  

### built in chainable methods
***api*.wait(n)** - pause execution flow for *n* milliseconds

***api*.until(fn)** - wait until callback *fn* returns true before continuing execution flow

***api*.chain(fn)** - add callback **fn** to be executed next in the control flow stack.  The signature for this function should be of the form:
    fn([arg1,] [arg2,] ... [arg *n*,] [next])

### convenience methods
###### The following methods execute immediately (rather than within the control flow) and always return the api object
***api*.set(name, value)** - set api object property *name* to *value*

***api*.setOption(option, value)** - set *option* to *value*

***api*.setOptions(options)** - set several options at once based on *options* collection of key/value pairs

### license
MIT Style License - see license.txt
