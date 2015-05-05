(function(){
Idea.Validators = {
    uintValidator: function(arg, argName){
        if (!Idea.Util.UINTREGEX.test(arg)) throw new Error(argName + " should be unsigned int, got: '" + arg + "'!");
    },

    intValidator: function(arg, argName){
        if (!Idea.Util.INTREGEX.test(arg)) {
            var error = new Error(argName + " should be int, got: '" + arg + "'!");
            console.log(error.stack);
            throw error;
        }
    },

    floatValidator: function(arg, argName){
        if (isNaN(parseFloat(arg))) {
            var error = new Error(argName + " should be float, got: '" + arg + "'!");
            console.log(error.stack);
            throw error;
        }
    },

    colorValidator: function(arg, argName){
        if (!Idea.Util.isHexColor(arg)) {
            var error = new Error(argName + " should be a color, got: '" + arg + "'!");
            console.log(error.stack);
            throw error;
        } 
    },

    stringValidator: function(arg, argName){
        if (!arg instanceof String) {
            var error = new Error(argName + " should be a String, got: '" + arg + "'!");
            console.log(error.stack);
            throw error;
        } 
    },

    objectValidator: function(arg, argName){
        if (!arg instanceof Idea.prototype.Object) {
            var error = new Error(argName + "should be a Idea.Object subclass, got:'" + typeof arg + "'!");
            console.log(error.stack);
            throw error;
        }
    },

    transformValidator: function(arg, argName){
        var transforms = Idea.Util.parseTransform(arg);
    },

    /*
     * Parses string representation of transform and returns a 2-list: [matrix, transforms].
     * Example: input string was 'rotate(Math.PI) translate(20,40)'. Matrix is the result of application
     * of all the transformations in the input string (in this example, rotation and translation), it's
     * an object {a:Math.cos(Math.PI), b:Math.sin(Math.PI), c:Math.cos(Math.PI), d:Math.sin(Math.PI), e:20, g:40}.
     *
     * Array is array of individual transforms in this list. Individual transform could be of the following types:
     *  - matrix, e.g. {'type':'matrix', 'a':1,'b':1,'c':1,'d':1,'e':1,'f':1}
     *  - translate, e.g. {'type':'translate 'x':3, 'y':3, 'a':1,'b':0,'c':0,'d':1,'e':3,'f':3}
     *  - scale, e.g. {'type':'scale', 'x':4, 'y':4, 'a':4, 'b':0, 'c':0, 'd':4, 'e':0, 'f':0}
     *  - rotate. e.g. {'type':'rotate', 'angle':Math.PI, 'x':1, 'y':1 'a':'number','b':'number','c':'number','d':'number','e':'number','f':'number'}
     *  - skewX, e.g. {'angle': Math.PI, 'a':1, 'b':0, 'c':Math.tan(Math.PI), 'd':1, 'e':0, 'f':0}
     *  - skewY, e.g. {'angle': Math.PI, 'a':1, 'b':Math.tan(Math.PI), 'c':0, 'd':1, 'e':0, 'f':0}
     * 
     * For reference see: https://developer.mozilla.org/ru/docs/Web/SVG/Attribute/transform
     *
     * Warning! We split by whitespaces, so there should not be whitespaces in e.g. 
     *    translate(1,_2)
     *                ^
     *                |
     *                There shouldn't be whitespaces here! 
     */

    parseTransform: function(transformString){
        var matrix = {a:1, b:0, c:0, d:1, e:0, f:0};
        var transforms = []; // output
        var match, transform; // temporary local variables
        var individualTransformStings = transformString.split(" ");
        individualTransformStings.forEach(function(el, index, array){
            switch (true){
                case /matrix\(.+\)/.test(el):
                    match = /matrix\((\-?[0-9]*[.]?[0-9]+),(\-?[0-9]*[.]?[0-9]+),(\-?[0-9]*[.]?[0-9]+),(\-?[0-9]*[.]?[0-9]+),(\-?[0-9]*[.]?[0-9]+),(\-?[0-9]*[.]?[0-9]+)\)/.exec(el);
                    transform = {
                        type: 'matrix',
                        a: parseFloat(match[1]),
                        b: parseFloat(match[2]),
                        c: parseFloat(match[3]),
                        d: parseFloat(match[4]),
                        e: parseFloat(match[5]),
                        f: parseFloat(match[6])
                    };
                    break;
                case /translate\(.+\)/.test(el):
                    match = /translate\((\-?[0-9]*[.]?[0-9]+),(\-?[0-9]*[.]?[0-9]+)\)/.exec(el);
                    transform = {
                        type: 'translate',
                        x: parseFloat(match[1]),
                        y: parseFloat(match[2]),
                        a: 1,
                        b: 0,
                        c: 0,
                        d: 1,
                        e: parseFloat(match[1]),
                        f: parseFloat(match[2])
                    };
                    break;
                case /scale\(.+\)/.test(el):
                    match = /scale\((\-?[0-9]*[.]?[0-9]+),(\-?[0-9]*[.]?[0-9]+)\)/.exec(el);
                    transform = {
                        type:'scale',
                        x: parseFloat(match[1]),
                        y: parseFloat(match[2]),
                        a: parseFloat(match[1]),
                        b: 0,
                        c: 0,
                        d: parseFloat(match[2]),
                        e: 0,
                        f: 0
                    };
                    break;
                case /rotate\(.+\)/.test(el):
                    match = /rotate\((\-?[0-9]*[.]?[0-9]+)(,(\-?[0-9]*[.]?[0-9]+),(\-?[0-9]*[.]?[0-9]+))*\)/.exec(el);
                    if (match[3] === undefined || match[4] === undefined){
                        transform = {
                            type: 'rotate',
                            angle: parseFloat(match[1]),
                            x: 0,
                            y: 0,
                            a: Math.cos(parseFloat(match[1])),
                            b: Math.sin(parseFloat(match[1])),
                            c: -Math.sin(parseFloat(match[1])),
                            d: Math.cos(parseFloat(match[1])),
                            e: 0,
                            f: 0
                        };                            
                    }
                    else{
                        var result = Idea.Util.matrixMultiplication({a:1, b:0, c:0, d:1, e:parseFloat(match[3]), f:parseFloat(match[4])}, 
                            {a:Math.cos(parseFloat(match[1])), b:Math.sin(parseFloat(match[1])), c:-Math.sin(parseFloat(match[1])), d:Math.cos(parseFloat(match[1])), e:0, f:0});
                        result = Idea.Util.matrixMultiplication(result, {a:1, b:0, c:0, d:1, e:-parseFloat(match[3]), f:-parseFloat(match[4])});
                        transform = {
                            type: 'rotate',
                            angle: parseFloat(match[1]),
                            x: parseFloat(match[3]),
                            y: parseFloat(match[4]),
                            a: result.a,
                            b: result.b,
                            c: result.c,
                            d: result.d,
                            e: result.e,
                            f: result.f
                        };
                    }

                    break;
                    // TODO CALCULATE MATRIX
                    // TODO if match groups 2 and 3 don't exist
                case /skewX\(.+\)/.test(el):
                    match = /skewX\((\-?[0-9]*[.]?[0-9]+)\)/.exec(el);
                    transform = {
                        type: 'skewX',
                        angle: parseFloat(match[1]),
                        a: 1,
                        b: 0,
                        c: Math.tan(parseFloat(match[1])),
                        d: 1,
                        e: 0,
                        f: 0
                    };
                    break;
                case /skewY\(.+\)/.test(el):
                    match = /skewY\((\-?[0-9]*[.]?[0-9]+)\)/.exec(el);
                    transform = {
                        type: 'skewY',
                        angle: parseFloat(match[1]),
                        a: 1,
                        b: Math.tan(parseFloat(match[1])),
                        c: 0,
                        d: 1,
                        e: 0,
                        f: 0
                    };
                    break;
            }
            transforms.push(transform);
        });
        // note that initial matrix should be reversed!
        transforms.reverse();
        transforms.forEach(function(el){ matrix = Idea.Util.matrixMultiplication(matrix, el); });
        transforms.reverse();
        return [matrix, transforms];
    },

    matrixMultiplication: function(matrix1, matrix2){
        var result = {};
        result.a = matrix1.a*matrix2.a + matrix1.c*matrix2.b;
        result.b = matrix1.b*matrix2.a + matrix1.d*matrix2.b;
        result.c = matrix1.a*matrix2.c + matrix1.c*matrix2.d;
        result.d = matrix1.b*matrix2.c + matrix1.d*matrix2.d;
        result.e = matrix1.a*matrix2.e + matrix1.c*matrix2.f + matrix1.e;
        result.f = matrix1.b*matrix2.e + matrix1.d*matrix2.f + matrix1.f;
        return result;
    }        
}
})();
