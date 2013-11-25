// example of a creating a chainable fs module

module.exports = require('../api-chain').create({
    read: require('fs').readFile,
    toString: function(data, next) {
        next(null, data.toString());
    },
    view: function(contents) {
        console.log(contents);
    }
});