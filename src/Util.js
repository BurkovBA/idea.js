(function(){
    Idea.Util = {
        SVGNS: "http://www.w3.org/2000/svg",
        XMLNS: "http://www.w3.org/1999/xhtml",
        XLINKNS: 'http://www.w3.org/1999/xlink',
        MOUSE_EVENTS: ["click", "dblclick", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup"],
        KEYBOARD_EVENTS: ["keydown", "keypress", "keyup"],
        UINTREGEX: /^\d+$/,
        isHexColor: function(color){return /^#[0-9A-F]{6}$/i.test(color)},
        extend: function(Child, Parent){
           var F = function(){ };
           F.prototype = Parent.prototype;
           Child.prototype = new F();
           Child.prototype.constructor = Child;
           Child.superclass = Parent.prototype;
        },
        /*
         * Dynamically adds attributes to constructor's prototype.
         *
         * @method
         * @memberof Idea.Util
         * @param constructor   constructor, its prototype will get new attrs.
         * @param attrs         object, whose attributes will get copied to
         *                      constructor.prototype.
         * 
         */
        addAttrsToPrototype: function(constructor, attrs){
            for (var key in attrs){
                constructor.prototype[key] = attrs[key];
            }
        },
        /*
         * Creates, appends to father tag and returns SVG primitive 
         * (e.g. rect, group etc.).
         *
         * @method
         * @memberof Idea.Util
         * @param father  svg element that is the parent of newly created one.
         * @param tag     type of newly created svg element (e.g. 'rect' or 'g').
         * @param attrs   dict with attributes of newly created element.
         *
         */

        createSVGElement: function(father, tag, attrs){
            var elem = document.createElementNS(this.SVGNS, tag);
            for (var key in attrs){
                if (key == "xlink:href") {
                    elem.setAttributeNS(XLINKNS, 'href', attrs[key]);
                }
                else {elem.setAttribute(key, attrs[key]);}
            }
            father.appendChild(elem);
            return elem;
        },
        
        /*
         * Idea.js makes use of getterSetters (possibly overloaded) to
         * access attributes. E.g. you can say widget.opacity() to obtain
         * opacity value of your widget and say widget.opacity(0.5) to set
         * its opacity to 50%. So the same method "opacity" acts both as
         * getter and setter.
         * 
         * When you invoke setter, Idea.js checks that you supplied an
         * appropriate value to it - performs "validation". In order to 
         * re-use the simplest and most common getterSetters, we store
         * factory functions, generating them, here.
         */ 

        /*
         * Factory function that returns getterSetter function, which,
         * as getter, returns value of arg_name or, as setter, validates
         * input value, checking, if it's an unsigned integer.
         * 
         * @function
         * @memberof Idea.Util
         * @param arg_name  name of argument to get/set with this method.
         */
        uintGetterSetter: function(arg_name){
            return function(arg){
                if (arg === undefined) {return this["_"+arg_name];}
                else {
                    if (Idea.Util.UINTREGEX.test(arg)) {
                        this["_"+arg_name] = arg;
                    }
                    else {
                        throw new Error(arg_name + " should be unsigned int, got: '" + arg + "'!");
                    }
                }
            };
        },
        /*
         * Factory function that returns getterSetter function, which,
         * as getter, returns value of arg_name or, as setter, validates
         * input value, checking, if it's a color literal.
         * 
         * @function
         * @memberof Idea.Util
         * @param arg_name  name of argument to get/set with this method.
         */
        colorGetterSetter: function(arg_name){
            //TODO!!! COLOR literals, e.g. rgb, rgba or trivial color names
            return function(arg){
            if (arg === undefined) {return this["_"+arg_name];}
            else {
                if (Idea.Util.isHexColor(arg)){ this["_"+arg_name] = arg;}
                else {
                    throw new Error(arg_name + " should be a valid color string, e.g #ACDC66, got: '" + arg + "'!")};
                }
            };
        },
        /*
         * Factory function that returns getterSetter function, which,
         * as getter, returns value of arg_name or, as setter, validates
         * input value, checking, if it's a Util.Widget subclass.
         * 
         * @function
         * @memberof Idea.Util
         * @param arg_name  name of argument to get/set with this method.
         */
        widgetGetterSetter: function(arg_name){
            return function(arg){
                if (arg === undefined) {return this["_"+arg_name];}
                else {
                    if (arg instanceof Idea.Widget) {this["_"+arg_name] = arg;}
                    else {throw new Error(arg_name + "should be a Util.Widget subclass, got:'" + typeof arg + "'!");}
                }
            };
        }

    };
})();
