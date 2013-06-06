   // require api-chain module
    var api = require('../api-chain');

    // define your api by passing custom methods to `create

    var totalShots = 0;
    var myApi = api.create({
        log: function () {
            var args = Array.prototype.slice.call(arguments);
            var next = args.pop();
            var msg = args.join(' ');
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
        showScore: function (next) {
            this.log('it took you', this.shots, 'shots');
            if (this.shots === 3) this.log('perfect mission!');
            else if (this.shots < 6) this.log('not bad for a rookie.');
            else this.log('you need to work on your aim, space-cadet!');
            next();
        }
    });


    // example using 'myApi'
    myApi
        .log('starting game...')
        .set('shots', 0)
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
            this.shots++;
            var hit = Math.random() > 0.3;
            if (hit) {
                this.log('    * hit *');
                this.log('    space-monkey destroyed!');
                this.monkeys--;
            }
            else this.log('    * miss *');
            var done = this.monkeys < 1;
            if (!done) this.log('firing...');
            else this.log('    *** all space-monkeys have been destroyed! ***');
            return done;
        })
        .showScore();