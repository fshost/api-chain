   // require api-chain module
    var api = require('../api-chain');

    // define your api by passing custom methods to `create
    var myApi = api.create({
        log: function (msg, next) {
            console.log('>>', msg);
            next();
        },
        load: function (next) {
            var api = this;
            setTimeout(function () {
                api._lasersLoaded = true;
                console.log('>> lasers locked and loaded!');
                next();
            }, 1500);
        },
        done: function (msg) {
            if (msg) this.log(msg);
        }
    });

    // example using 'myApi'
    myApi
        .log('starting game...')
        .wait(1000)
        .log('loading ammo...')
        .load()
        .log('establishing psi-link with moosey...')
        .chain(function (next) {
            setTimeout(function () {
                console.log('>> moosey thinks: * I\'m ready to rock! *');
                next();
            }, 1000);
        })
        .log('starting mission...')
        .wait(1000)
        .set('monkeys', 3, true)
        .log('firing at space-monkeys...')
        .until(function () {
            var hit = Math.random() > .3;
            if (hit) {
                console.log('    * hit *');
                console.log('    space-monkey destroyed!');
                this.monkeys--;
            }
            else console.log('    * miss *');
            var done = this.monkeys < 1;
            if (!done) console.log('>> firing...');
            else console.log('    *** all space-monkeys have been destroyed! ***');
            return done;
        })
        .log('game over - thanks for playing')
        .done('mission complete');