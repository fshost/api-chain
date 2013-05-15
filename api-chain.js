
/***
api-chain
create a fluent synchronous style API for async javascript control flow
commonJs module tested with node.js and phantomjs javascript engines

options:
---
name:           default:    description:
onError         undefined   called when error is emitted unless error method is overwritten
throwErrors     true        whether to throw unhandled errors (ignored if onError exists)
continueErrors  false       execution of commands will continue after errors 

built-in api methods that chain (and should be left alone - don't modify)
---
chain       chain any cb that accepts next, call next to continue


usage: 

example of setting up an api with a few custom methods
---
    var myApi = require('./chain')
        .create({
            log: function (msg, next) {
                console.log('special logging method');
                next();
            },
            ready: function (next) {
                console.log('setting ready to true');
                this.ready = true;
                next();
            }
        });

then to use your api...
---
    myApi
        .slog('starting up')
        .ready();

*/

function API(options) {
    var api = this;
    api._callbacks = [];
    api._isQueueRunning = false;
    api.next = api._next(api);
    api = options ? api.setOptions(options) : api;
    if (api._throwErrors === undefined && api.onErrors === undefined) {
        api._throwErrors = true;
    }
    return api;
}

// add a method to the prototype
API.prototype._addMethod = function (name, method) {
    API.prototype[name] = function () {
        var api = this;
        var args = Array.prototype.slice.call(arguments);
        this.chain(function (next) {
            args.push(next);
            method.apply(api, args);
        });
        return this;
    };
    return this;
};

// add a collection of methods (key/value pairs) to the prototype
API.prototype._addMethods = function (methods) {
    var api;
    for (var name in methods) {
        if (methods.hasOwnProperty(name)) {
            api = this._addMethod(name, methods[name]);
        }
    }
    return api;
};

// used internally to advance to next cb
API.prototype._next = function (api) {
    return function (err) {
        if (err) {
            if (api.onError) api.onError(err, api.next);
            else if (api._throwErrors) throw err;
        }
        if (api._continueErrors || !err) {
            if (api._callbacks.length > 0) {
                api._isQueueRunning = true;
                var cb = api._callbacks.shift();
                try { cb(api.next) }
                catch(ex) { api.next(ex) }

            }
            else api._isQueueRunning = false;
        }
        return api;
    };
};

// immediately set instance properties
API.prototype.set = function (name, value) {
    if (arguments.length === 1) {
        var props = name;
        for (var name in props) {
            if (props.hasOwnProperty(name)) {
                console.log('setting property', name, 'to a value');
                this[name] = props[name];
            }
        }
    }
    else this[name] = value;
    return this;
};

// set an option value
API.prototype.setOption = function (name, value) {
    this.set('_' + name, value);
};

// set options based on key/value pairs
API.prototype.setOptions = function (options) {
    for (var name in options) {
        if (props.hasOwnProperty(name)) {
            this.setOption(name, options[name]);
        }
    }
};

// add a callback to the execution chain
API.prototype.chain = function (cb) {
    this._callbacks.push(cb);
    if (!this._isQueueRunning) {
        this.next();
    }
    return this;
};

API.prototype.wait = function (ms) {
    this.chain(function (next) {
        setTimeout(function () {
            next();
        }, ms);
    });
    return this;
};

// until - pause execution flow until [cb] returns true
API.prototype.until = function (cb) {
    var timeout;
    var api = this;
    this.chain(function (next) {
        var evaluator = setInterval(function () {
            if (cb()) {
                clearInterval(evaluator);
                if (timeout !== undefined) clearTimeout(timeout);
                next();
            }
        }, api.untilInterval || 30);
        // to set a timeout for condition to be met, set the _untilTimeout property to ms value
        if (api.untilTimeout) {
            timeout = setTimeout(function () {
                if (evaluator !== undefined) {
                    clearInterval(evaluator);
                    // to catch timeout of until conditions, set onUntilTimeout handler
                    if (api.onUntilTimeout) api.onUntilTimeout(next);
                    // otherwise execution flow simply continues as if condition was met
                    else next();
                }
            }, api.untilTimeout);
        }
    });
    return this;
};

// module exports
// -----
exports.API = API;

exports.create = function (options, methods) {
    if (arguments.length === 1) {
        methods = options;
        options = null;
    }
    return new API(options)._addMethods(methods);
};
