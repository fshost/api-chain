var apiChain = require('../api-chain');

var log = '';

// define an api
var myApi = apiChain.create({
    log: function (msg, next) {
        log += msg;
        next();
    },
    readyUp: function (next) {
        var api = this;
        setTimeout(function () {
            log += 'ready!';
            next();
        }, 1500);

    },

    test: function (name, next) {
        if (log === 'starting up...ready up...ready!wait for x...test dynamic method...all done.') {
            console.log(name, 'passed.');
        }
        else console.log(name, 'failed');
        next();
    },
    exit: function () {
        console.log('tests complete.');
        if (typeof phantom !== 'undefined') {
            phantom.exit();
        }
    } 
});

// set up an async event
var x = 0;
setTimeout(function () {
    x = 1;
}, 3000);


// use the api
myApi
    .log('starting up...')
    .wait(1000)
    .log('ready up...')
    .readyUp()
    .log('wait for x...')
    .until(function () {
        return x === 1;
    })
    .log('test dynamic method...')
    .chain(function (next) {
        setTimeout(function () {
            next();
        }, 1000);
    })
    .log('all done.')
    .test('extended chain API test')
    .exit();
