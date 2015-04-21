// note that QUnit allows for multiple assertions in a single test and first failed assert
// doesn't prevent others to be run: 
// http://programmaticallyspeaking.com/one-assertion-per-test-please.html

QUnit.test( "Idea.Util.addEventListener/removeEventListener", function( assert ) {

    var obj = {1:[]};

    var evt = new Event('build');

    var eventListener = function (arg1, arg2, e) {
        console.log("eventListener called");
        this[arg1].push(arg2);
        return this.arg1;
	};

                             //obj, eventType, listener, useCapture, thisArg, argumentsList
    Idea.Util.addEventListener(document, 'build', eventListener, false, obj, [1, 2]);
    document.dispatchEvent(evt);

    assert.deepEqual( obj, {1: [2]}, "addEventListener tested" );

    Idea.Util.removeEventListener(document, 'build', eventListener, false, obj, [1, 2]);
    document.dispatchEvent(evt);

    assert.deepEqual( obj, {1: [2]}, "removeEventListener tested" );
});
