## api-chain
---
When performing many asynchronous operations in javascript, nested callbacks can become difficult to read and maintain.  Api-chain is a very light and easy to use interface for creating a fluent synchronous style API for control flow of asynchronous javascript.  It is packaged as a commonJS module through NPM but not only works with Node.js, but has been tested and works with PhantomJS as well.

### installation
    npm install api-chain

### example
    // require api-chain module
    var api = require('api-chain');

    // define your api by passing custom methods to `create
    var myApi = api.create({
        get: function (url, next) {
            console.log('getting page at', url);
            // simulate async operation
            setTimeout(function () {
                myApi.page = '<div>test</div>';
                next();
            }, 1000)
        },
        done: function (msg) {
            console.log('the page contains:', this.page);
        }
    });

    // example using 'myApi'
    myApi
        .get('http://nopage.fake')
        .done();

For more examples look in the examples subdirectory.

### options
| name           | type | default     | description                                                     |
|:---------------|:-----|:------------|:----------------------------------------------------------------|
| onError        | fn   | undefined   | called when error is emitted unless error method is overwritten |
| throwErrors    | bool | true        | whether to throw unhandled errors (ignored if onError exists)   |
| continueErrors | bool | false       | whether to resume execution of commands after errors occur      |  

### built in chainable methods
***api*.wait(n)** - pause execution flow for *n* milliseconds

***api*.until(fn)** - wait until callback *fn* returns true before continuing execution flow

***api*.chain(fn)** - add callback **fn** to be executed next in the control flow stack.
- callback signature: **fn([arg1,] [arg2,] ... [arg *n*,] [next])**

***api*.set(name, value, [immediate])** - set api object property *name* to *value*
- if the *immediate* flag is set, the value will be set immediately rather than within the control flow

### immediate methods
###### The following methods execute immediately (rather than within the control flow) and always return the api object 
***api*.setOption(option, value)** - set *option* to *value*

***api*.setOptions(options)** - set several options at once based on *options* collection of key/value pairs

### testing
to test you will need mocha and chai installed.  Then just cd to the directory api-chain is installed in and type

    mocha

### license
MIT Style License - see license.txt
