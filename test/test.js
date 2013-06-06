var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var assert = require('should');
var log = '';
var expectedLog = 'starting up...startedready up...wait for change...changed';

describe("api-chain creates a chainable api from async javascript", function() {

    var myApi;

    it("has a create method that accepts an object hash of functions", function() {

        myApi = require('../api-chain').create({
            log: function(msg, next) {
                this._log = this._log || '';
                this._log += msg;
                next();
            },
            readyUp: function(next) {
                this._log += 'ready up...';
                setTimeout(function() {
                    next();
                }, 200);

            },
            exit: function(done, next) {
                done.bind(this)(next);
            }
        });

        describe("using the created chainable api", function() {

            it("will make methods chainable", function() {
                myApi.log('starting up...')
                .set('test', 'starting up...');
            });

            it("has a set method for setting arbitrary properties", function () {
                var log = myApi._log;
                myApi.set('_log', log + 'started');
            });

            it("has a built-in wait method", function () {
                myApi.wait(200).readyUp();
            });

            it("has a built-in method for chaining dynamic async functions", function (done) {
                myApi.chain(function(next) {
                    setTimeout(function () {
                        // call next has to resolve the object
                        next();
                        // let mocha know this test is complete
                        done();
                    }, 200);
                });
            });

            it("has a built-in until method to wait until a callback returns true", function (done) {

                var x = 0;
                setTimeout(function () {
                        x = 1;
                    }, 200);

                function changed() {
                    return x !== 0;
                }
                myApi
                    .log('wait for change...')
                    .until(changed)
                    .log('changed')
                    .exit(function (resolve) {
                        expect(this._log).to.eql(expectedLog);
                        done();
                    });
            });
        });

    });
});