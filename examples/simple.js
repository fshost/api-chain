/* api-chain - simple example */

// require api-chain module
var api = require('../api-chain');

// define your api by passing custom methods to `create
var myApi = api.create({
    get: function (url, next) {
        console.log('getting page at', url);
        // simulate async operation
        setTimeout(function () {
            myApi.page = '<div>test</div>';
            next();
        }, 1000);
    },
    done: function (msg) {
        console.log('the page contains:', this.page);
    }
});

// example using 'myApi'
myApi
    .get('http://nopage.fake')
    .done();