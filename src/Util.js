(function(){
    Idea.Util = {
        MOUSE_EVENTS: ["click", "dblclick", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup"],
        KEYBOARD_EVENTS: ["keydown", "keypress", "keyup"],
        INTREGEX: /^\d+$/,
        isHexColor: function(color){return /^#[0-9A-F]{6}$/i.test(color)},
        extend: function(Child, Parent){
           var F = function() { }
           F.prototype = Parent.prototype
           Child.prototype = new F()
           Child.prototype.constructor = Child
           Child.superclass = Parent.prototype
        },
        /*
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
        }
    };
})();
