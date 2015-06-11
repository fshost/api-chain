var api = require('../api-chain');

var tester = api.create({
  A: A,
  B: B,
  C: C,
  D: D,
});

function A(next) {
  console.log('A');
  this
    .B()
    .C()
  next();
}

function B(next) {
  setTimeout(function(){
    console.log('B');
    next();
  }, 2000);
}

function C(next) {
  console.log('C');
  next();
}

function D(next) {
  console.log('D');
  next();
}

tester
  .A()
  .D()