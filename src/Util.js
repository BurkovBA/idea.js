(function(){
    Idea.Util = {
        SVGNS: "http://www.w3.org/2000/svg",
        XMLNS: "http://www.w3.org/1999/xhtml",
        XLINKNS: 'http://www.w3.org/1999/xlink',
        MOUSE_EVENTS: ["click", "dblclick", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup"],
        KEYBOARD_EVENTS: ["keydown", "keypress", "keyup"],
        INTREGEX: /^\d+$/,
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
        }
    };
})();
