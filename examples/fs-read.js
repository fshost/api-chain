// example of using a chainable fs module
var fs = require('./fs-chain');

fs.read('./fs-chain.js')
  .toString()
  .view();