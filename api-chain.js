/***
 * api-chain
 * create a fluent synchronous style API for async javascript control flow
 * commonJs module tested with node.js and phantomjs javascript engines
 */

// to make this compatible with PhantomJS, add Function.prototype.bind polyfill if necessary
// from https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }
        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function() {},
            fBound = function() {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}


function API(options) {
    for (var method in APIPrototype) {
        if (APIPrototype.hasOwnProperty(method)) {
            API.prototype[method] = APIPrototype[method].bind(this);
        }
    }
    options = options || {};
    this._callbacks = [];
    this._isQueueRunning = false;
    this.options = this._extend({
        throwErrors: !options.onError ? true : false,
        continueErrors: false
    }, options);
}

var APIPrototype = {

    _onError: function(err) {
        if (this.options.onError) {
            this.options.onError(err);
        }
        else if (this.options.throwErrors) throw err;
        return this;
    },

    // merge/overwrite objects
    _extend: function(target, source, all) {
        target = target || {};
        for (var key in source) {
            // merge only if hasOwnProperty unless `all´ flag is set
            if (all || source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
        return target;
    },

    // add a method to the prototype
    _addMethod: function(name, method) {
        API.prototype[name] = function() {
            var api = this;
            var args = Array.prototype.slice.call(arguments);
            this.chain(function(next) {
                var cargs = [].slice.call(arguments);

                cargs = args.concat(cargs);

                // args.push(next);
                method.apply(api, cargs);
            });
            return this;
        };
        return this;
    },

    // add a collection of methods (key/value pairs) to the prototype
    _addMethods: function(methods) {
        var api;
        for (var name in methods) {
            if (methods.hasOwnProperty(name)) {
                api = this._addMethod(name, methods[name]);
            }
        }
        return api;
    },

    // advance to next cb
    next: function(err) {
        if (err) this._onError(err);
        if (this._continueErrors || !err) {
            var args = [].slice.call(arguments);
            if (this._callbacks.length > 0) {
                this._isQueueRunning = true;
                var cb = this._callbacks.shift();
                cb = cb.bind(this);
                args = args.slice(1);
                args.push(this.next);
                cb.apply(this, args);

            } else {
                this._isQueueRunning = false;
                this.start = (function() {
                    this.start = null;
                    this.next.apply(this, args);
                }).bind(this);

            }
        }
        return this;
    },

    // set instance property
    set: function(name, value, immediate) {
        if (immediate) {
            this[name] = value;
        } else this.chain(function() {
            var args = Array.prototype.slice.call(arguments);
            var next = args.pop();
            this[name] = value;
            args.unshift(null);
            next.apply(this, args);
        });
        return this;
    },

    // set an option value (chainable)
    setOption: function(name, value) {
        this.options[name] = value;
        return this;
    },

    // set options based on key/value pairs (chainable)
    setOptions: function(options) {
        for (var name in options) {
            if (options.hasOwnProperty(name)) {
                this.setOption(name, options[name]);
            }
        }
        return this;
    },

    // add a callback to the execution chain
    chain: function(cb) {
        cb = this.wrap(cb);
        this._callbacks.push(cb);
        if (!this._isQueueRunning) {
            if (this.start) {
                this.start();
            } else this.next();
            // this.start();
        }
        return this;
    },

    // wrap a function that has a signature of ([arg1], [arg2], ...[argn], callback)
    // where callback has a signature of (err, [arg1], [arg2], ... [argn])
    // example: api.wrap(require('fs').readFile)
    wrap: function (cb) {
        return function() {
            var args = Array.prototype.slice.call(arguments);
            var next = args.pop();

            args.push(function() {
                // if (err) return next(err);
                var iargs = Array.prototype.slice.call(arguments);

                next.apply(this, iargs);
            });
            cb.apply(this, args);
        };
    },
    // wait - pause execution flow for specified milliseconds
    wait: function(ms) {
        this.chain(function(next) {
            setTimeout(function() {
                next();
            }, ms);
        });
        return this;
    },

    // until - pause execution flow until [cb] returns true
    until: function(cb) {
        var timeout;
        this.chain(function(next) {
            function evaluate() {
                var ccb = cb.bind(api);
                var result = ccb();
                if (result) {
                    clearInterval(poll);
                    if (timeout !== undefined) clearTimeout(timeout);
                    next();
                }
            }
            var api = this;
            var poll = setInterval(evaluate, api._untilInterval || 30);
            // to set a timeout for condition to be met, set the _untilTimeout property to ms value
            if (api.untilTimeout) {
                timeout = setTimeout(function() {
                    if (poll !== undefined) {
                        clearInterval(poll);
                        // to catch timeout of until conditions, set onUntilTimeout handler
                        if (api.onUntilTimeout) api.onUntilTimeout(next);
                        // otherwise execution flow simply continues as if condition was met
                        else next();
                    }
                }, api.untilTimeout);
            }
        });
        return this;
    }

};


// module exports
// -----
exports.API = API;

exports.create = function(options, methods) {
    if (arguments.length === 1) {
        methods = options;
        options = null;
    }
    var api = new API(options);

    api = api._addMethods(methods);

    return api;
};

