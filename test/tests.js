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

QUnit.test( "Idea.Util.parseTransform", function( assert ) {
    var transformString = "rotate(30) translate(20,40)";
    var results = Idea.Util.parseTransform(transformString);
    var matrix = results[0];
    var transforms = results[1];

    assert.deepEqual(matrix, {a:Math.cos(30), b:Math.sin(30), c:-Math.sin(30), d:Math.cos(30), e:20, f:40}, "result matrix tested");
    assert.deepEqual(transforms, [{type:'rotate', angle:30, a:Math.cos(30), b:Math.sin(30), c:-Math.sin(30), d:Math.cos(30), e:0, f:0, x:0, y:0}, {type:'translate', x:20, y:40, a:1, b:0, c:0, d:1, e:20, f:40}], "individual transforms tested");
});