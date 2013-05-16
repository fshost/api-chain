/* 
    api-chain example using the set method with and without the immediate flag
    and an alternative to using the `next´ argument to resume control flow

    run this example and view the output
*/

// define your api by passing custom methods to `create
var myApi = require('../api-chain').create({
    log: function (msg, next) {
        console.log('>>', msg);
        next();
    },
    done: function (msg, next) {
        // resolve chain
        myApi.next();
        // final output
        if (msg) myApi.log(msg);
    }
});

myApi
    .log('to illustrate differences in using the set method with or without the immediate flag')
    .set('monkeys', 3)
    .log('we set monkeys to 3')
    .chain(function () {
        myApi.log('and monkeys is ' + myApi.monkeys);
        setTimeout(function () {
            myApi
                .log('but after a few ms monkeys is ' + myApi.monkeys)
                .log('even though this comes earlier in our execution flow')
                .log('the next set method uses the immediate flag and sets it to ' + myApi.monkeys)
                .log('now we will advance the control flow by using myApi.next')
                .log('showing an alternative to using the `next´ argument')
                .next();
        }, 1000);

    })
    .set('monkeys', 4, true)
    .done('all done');