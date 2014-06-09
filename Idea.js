/*
 * Idea.js is a library, meant for creating rich presentations that primarily
 * contain interactive animations and pictures right in the browser window.
 * 
 * Idea.js also comes with an in-browser GUI viewer/editor, where you can 
 * create or view your presentations.
 * 
 * Your GUI editor may be in one of 2 modes: edit or view. In edit mode you
 * are supplied with a canvas to draw your presentation on and with tools to 
 * aid you. You can drag presentation elements around the canvas. 
 * You'll use view mode to display your presentation to users. If your audience 
 * is viewing your presentation in a browser, they can also interact with 
 * presentation, but only in the manner, that you specified.
 * 
 * Presentaton window is split into 4 parts.
 *   - The leftmost part is slidebar. Presentation consists of slides.
 *   - The lower part is timeline. Each slide contains its own timeline, 
 *     independent of other slides.
 *   - The central part is Canvas. This is where your slides are shown, here
 *     you create your presentation elements and this is what your audience 
 *     wants to see in view mode.
 *   - The right-central part is a tabbed Tools panel. In edit mode it contains
 *     Layers bar, Widgets selection bar, Widget options panel, Transitions 
 *     selection bar, Transition options panel, Source code bar, Properties
 *     bar and Comments bar.
 *     In view mode it contains only Properties bar and Comments bar.
 *
 * Presentation elements are called Widgets. In edit mode you can add new 
 * widgets to the Canvas, choosing them from Widgets selection bar. You can 
 * customize widget, by clicking on it and using Widget options panel that 
 * appears in the Tools panel. You can also directly set its properties in
 * javascript code in Source code bar.
 * 
 * Widgets may contain daughterly widgets.
 *
 * Each widget corresponds to a Group in the Layers bar. Group may
 * contain daughterly Layers and Groups. Layer is a logical object, which
 * corresponds to the widget itself, while its daughterly widgets
 * are represented by their own Groups within current widget's Group.
 *
 * Note that you CAN'T write absolutely arbitrary javascript code in Source 
 * code bar for security reasons - otherwise, black hat hackers would've been
 * able to introduce malicious code otherwise. All the code, entered in Source
 * code bar is sanitized via white-list-based sanitizer.
 *
 * Idea.js makes use of getterSetters (possibly overloaded, i.e. in multiple forms)
 * to access and modify attributes of objects. E.g. you can say widget.opacity()
 * to obtain opacity value of your widget and say widget.opacity(0.5) to set
 * its opacity to 50%. So the same method "opacity" acts both as getter and setter.
 * 
 */

var Idea = {};
(function(){
    Idea = {
        Util: {},

        Canvas: {},

        Slide: {},

        Widget: {},

        Arrow: {}
    };
})();

(function(){
    Idea.Conf = {
        canvas_width: 4096,
        canvas_height: 4096,
        default_viewport_width: 800,
        default_viewport_height: 800,
        framerate: 25
    };
})();

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

/*
 * Canvas is a huge, almost infinite flat area, and user looks
 * at it through a finite viewport, can zoom in and out. In practice,
 * these "almost infinite" width and height of canvas are defined
 * as constants in Idea.Conf.
 *
 * ........  <-- the big thing, denoted with . is the whole canvas
 * ........
 * ..---- <-- the small thing is the viewport
 * ..|..|..
 * ..----..
 * ........
 * ........
 *
 */

(function(){
    /*
     * Creates an instance of canvas, the working area, 
     * where you create your presentation.
     *
     * @constructor
     * @param width - width of viewport in pixels
     * @param height - height of viewport in pixels
     *
     */

    Idea.Canvas = function(width, height){
        //create a div container for our canvas
        this._div = document.createElement('div');
        this._div.style.border = "1px solid rgb(200,200,200)";
        this._div.style.display = "inline-block";
        document.body.appendChild(this._div);

        //create the canvas itself, set its attributes and insert it into div    
        this._canvas = document.createElementNS(Idea.Util.SVGNS, 'svg');

        //this._canvas.setAttribute("version", "1.1")
        //this._canvas.setAttribute("xmlns", Idea.Util.SVGNS);
        this._canvas.setAttribute("width", Idea.Conf.default_viewport_width);
        this._canvas.setAttribute("height", Idea.Conf.default_viewport_height);

        //check if width/height is set and define the size of viewport
        var viewbox;
        if (!((width === undefined) || (height === undefined))) {
            var x = Idea.Conf.canvas_width/2;
            var y = Idea.Conf.canvas/2 - height;
            var width = width;
            var height = height;
            viewbox =  "" + x + " " + y + " " + width + " " + height;
        }
        else {
            var x = Idea.Conf.canvas_width/2;
            var y = Idea.Conf.canvas_height/2 - Idea.Conf.default_viewport_width;
            var width = Idea.Conf.default_viewport_width;
            var height = Idea.Conf.default_viewport_height;
            viewbox =  "" + x + " " + y + " " + width + " " + height;
        }
        alert(viewbox);
        this._canvas.setAttributeNS(Idea.Util.SVGNS, "viewBox", viewbox);

        this._div.appendChild(this._canvas);

        //create resize grip
        this._grip = document.createElement('div');
        this._grip.style.width = 10;
        this._grip.style.height = 10;
        this._grip.style.display = "inline-block";
        this._grip.style.background = "#AAAAAA";
        this._grip.style.float = "right";
        this._div.appendChild(this._grip);
        //to fight incompatibilitiy of mouse button codes between IE and browsers,
        //we use tricks with event.which and event.button, for explanation see:
        //http://www.martinrinehart.com/early-sites/mrwebsite_old/examples/cross_browser_mouse_events.html
        this._grip.onmousedown = function(event){
            var event = event || window.event;
            var which = event.which ? event.which :
                event.button === 1 ? 1 :
                event.button === 2 ? 3 : 
                event.button === 4 ? 2 : 1;
            if (which == 1) {
                this._grip_pressed = true;
                this._grip_x = event.x || event.clientX;
                this._grip_y = event.y || event.clientY;
                //add event listeners to <html> (i.e. document.documentElement)
                //to respond to mousemove and mouseup if they're outside _grip.
                //idea taken from here:
                //http://stackoverflow.com/questions/8960193/how-to-make-html-element-resizable-using-pure-javascript
                var Up = function(event){
                    var event = event || window.event;
                    var which = event.which ? event.which :
                    event.button === 1 ? 1 :
                    event.button === 2 ? 3 : 
                    event.button === 4 ? 2 : 1;
                    if (which == 1) {
                        this._grip_pressed = false;
                        document.documentElement.removeEventListener('mousemove', Move, false);
                        document.documentElement.removeEventListener('mouseup', Up, false);
                    }
                }.bind(this);
                
                var Move = function(event) {
                    var event = event || window.event;
                    event.x = event.x || event.clientX;
                    event.y = event.y || event.clientY;
                    if (this._grip_pressed == true){
                        this.width(parseInt(this.width()) + event.x - this._grip_x);
                        this.height(parseInt(this.height()) + event.y - this._grip_y);
                        this._grip_x = event.x;
                        this._grip_y = event.y;
                    }
                }.bind(this);

                document.documentElement.addEventListener('mouseup', Up, false);
                document.documentElement.addEventListener('mousemove', Move, false);
            }
        }.bind(this);
        this._grip.onmouseover = function(event){
            var event = event || window.event;
            this.style.cursor = "nw-resize";
        };
        //create clear element to clear floats
        this._clear = document.createElement('div');
        this._grip.style.clear = "both";
        this._div.appendChild(this._clear);

        //TODO REMOVE THIS IT'S A TEST
        this.rect = Idea.Util.createSVGElement(this._canvas, 'rect', {
            "x": 10,
            "y": 10,
            "width": 50,
            "height": 50,
        });
        this.rect.style.stroke = "black";
        this.rect.style.fill = "none";
        //TODO REMOVE THIS IT'S A TEST

        this.slides = [new Idea.Slide(this)]; //array of slides in order from 1st to last
        this._slide = this.slides[0];
        this._mode = "view"; // "view" or "edit" mode

        // http://en.wikipedia.org/wiki/HTML_attribute - list of events

        // Note: we call bind() on event handlers to have "this" refer
        // to our Idea.Canvas object, not to this._canvas, as it would've
        // been in event handler context.
        this._canvas.onclick = this.click.bind(this);
        this._canvas.ondblclick = this.dblclick.bind(this);
        this._canvas.onmousedown = this.mousedown.bind(this);
        this._canvas.onmousemove = this.mousemove.bind(this);
        this._canvas.onmouseout = this.mouseout.bind(this);
        this._canvas.onmouseover = this.mouseover.bind(this);
        this._canvas.onmouseup = this.mouseup.bind(this);

        this._canvas.onkeydown = this.keydown.bind(this);
        this._canvas.onkeypress = this.keypress.bind(this);
        this._canvas.onkeyup = this.keyup.bind(this);

    };

    Idea.Canvas.prototype = {
        slide: function(slide){
            if (slide === undefined) {return this._slide;}
            else {
                if (this.slides.contains(slide)) {this._slide = slide;}
                else {throw new Error("Slide not in slides!");}
            }
        },

        mode: function(mode){
            if (mode === undefined) {return this._mode;}
            else {
                if (mode == "view" || mode == "edit") {this._mode = mode;}
                else {throw new Error("Wrong mode value: '" + mode + "', should be in ['view', 'edit']!");}
            }
        },

        width: function(width){
            if (width === undefined){return this._canvas.getAttribute("width");}
            else {this._canvas.setAttribute("width", width);}
        },

        height: function(height){
            if (height === undefined){return this._canvas.getAttribute("height");}
            else {this._canvas.setAttribute("height", height);}
        },

        //events-related code
        _propagateEventToWidgets: function(evt){
            for (i=this.slide().widgets.length-1; i >= 0; i++) {
                var widget = this.slide().widgets[i];
                if (widget.accepts_event(evt)){
                    break;
                }
            }
        },
        canvasCoordsForMouseEvent: function(evt){
            var rect = this._canvas.getBoundingClientRect();
            return {
                x: evt.x - rect.left,
                y: evt.y - rect.top
            };
        },
        click: function(event){
            var event = event || window.event // "|| window.event" for  cross-IEness
            this._propagateEventToWidgets(event);
        },
        dblclick: function(event){
            var event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
        mousedown: function(event){
            var event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
        mousemove: function(event){
            var event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
        mouseout: function(event){
            var event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
        mouseover: function(event){
            var event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
        mouseup: function(event){
            var event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },

        keydown: function(event) {
            var event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
        keypress: function(event){
            var event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
        keyup: function(event){
            var event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
    };
})();

(function(){
    Idea.Slide = function(canvas){
        this.canvas = canvas; //canvas, this slide belongs to
        this.widgets = []; //list of widgets ordered from deepest to upmost
    };

    Idea.Slide.prototype = {
        
    };

})();

(function(){
    Idea.Widget = function(slide){
        this.slide = slide;
        this.events = {
            click: function(){},
            dblclick: function(){},
            mousedown: function(){},
            mousemove: function(){},
            mouseout: function(){},
            mouseover: function(){},
            mouseup: function(){},

            keydown: function() {},
            keypress: function(){},
            keyup: function(){},
        };
        this.signals = {
        };
    };

    Idea.Widget.prototype = {
        /*
         * this accepts_event() implementation is a dummy template for heir 
         * widgets; override it in widgets, you inherit from Widget
         */
        accepts_event: function(evt){
            if (Idea.MOUSE_EVENTS.contains(evt.type)) {
                var coords = this.canvas.canvasCoordsForMouseEvent(evt);
                //do meaningful check, that event belongs to this widget
                //propagate the check to daughterly widgets!!!
            }
            return false; //here we just return dummy false
        }
    };
})();

(function(){

    var widthGetterSetter = Idea.Util.uintGetterSetter("width");
    var colorGetterSetter = Idea.Util.colorGetterSetter("color");
    var baseGetterSetter = function(base){
        if (base === undefined) {return this._base}
        else {
            if (base.hasOwnProperty("x") && Idea.Util.UINTREGEX.test(base.x) && base.hasOwnProperty("y") && Idea.Util.UINTREGEX.test(base.y)){
                this._base = base;
            }//TODO TEST CANVAS SIZE
        }
    };
    var tipGetterSetter = function(tip){
        if (tip === undefined) {return this._tip}
        else {
            if (tip.hasOwnProperty("x") && Idea.Util.UINTREGEX.test(tip.x) && tip.hasOwnProperty("y") && Idea.Util.UINTREGEX.test(tip.y)){
                this._tip = tip;
            }//TODO TEST CANVAS SIZE
           
        }
    };
    var baseWidgetGetterSetter = Idea.Util.widgetGetterSetter("base_widget");
    var tipWidgetGetterSetter = Idea.Util.widgetGetterSetter("tip_widget");


    /*
     * Straight arrow
     *
     * @memberof Idea
     * @constructor
     * @param father      Util.Widget, parental to Arrow, or Util.Canvas,
     *                    if Arrow doesn't have a parent and is drawn right
                          on the canvas.
     * @param width       width of arrow line, defaults to 1px.
     * @param color       color of arrow, defaults to black.
     * @param base        coordinates of arrow's base, e.g.{x:42, y:42}.
     * @param tip         coordinates of arrow's tip, e.g. {x:42, y:42}.
     * @param base_widget see tip_widget.
     * @param tip_widget  arbitrary widgets that represent base and tip of 
     *                    arrow (if not specified, Triangles will be 
     *                    created and used by default).
     */

    Idea.Arrow = function(father, width, color, base, tip, base_widget, tip_widget){
        if (width === undefined) {widthGetterSetter.call(this, 1);}
        else {widthGetterSetter.call(this, width);}
        if (color === undefined) {colorGetterSetter.call(this, "#AAAAAA");}
        else {colorGetterSetter.call(this, color);}
        //TODO allow to use other widgets dock points to be used 
        // as base and tip instead of just coordinates. Then arrow will
        // stick to widgets.
        if (base === undefined) {throw new Error("Arrow's base coordinates undefined!");}
        else {baseGetterSetter.call(this, base);}
        if (tip === undefined) {throw new Error("Arrow's tip coordinates undefined!");}
        else {tipGetterSetter.call(this, tip);}
        if (base_widget === undefined) {this._base_widget = null;}
        else {baseWidgetGetterSetter.call(this, base_widget);}
        if (tip_widget === undefined) {this._tip_widget = null;}
        else {tipWidgetGetterSetter.call(this, tip_widget);}
        //draw primitives
        this.father = father;
        if (this.father instanceof Idea.Canvas) {
            this._group = Idea.Util.createSVGElement(this.father._canvas, 'g', {});
            this._drawing = Idea.Util.createSVGElement(this._group, 'line', {
                "x1": this._base.x,
                "y1": this._base.y,
                "x2": this._tip.x,
                "y2": this._tip.y
            });
            this._drawing.style.stroke = this._color;
            this._drawing.style['stroke-width'] = this.width;
        }
        else {
            //TODO!!!!
        }

    };

    Idea.Util.extend(Idea.Arrow, Idea.Widget);
    Idea.Util.addAttrsToPrototype(Idea.Arrow, {
        width: widthGetterSetter, 
        color: colorGetterSetter,
        base: baseGetterSetter,
        tip: tipGetterSetter,
        base_widget: baseWidgetGetterSetter,
        tip_widget: tipWidgetGetterSetter,
        accepts_event: function(evt){
            if (Idea.MOUSE_EVENTS.contains(evt.type)){
                var coords = this.canvas.canvasCoordsForMouseEvent(evt);
                if (Idea.Util.pointOnLine(this.base().x, this.base().y, this.tip().x, this.tip().y, this.width(), coords.x, coords.y)) {
                        return true;
                }
                else {
                    return false;
                }
            }
        }
    });
})();

(function(){
    var xGetterSetter = Idea.Util.uintGetterSetter("x");
    var yGetterSetter = Idea.Util.uintGetterSetter("y");
    var widthGetterSetter = Idea.Util.uintGetterSetter("width");
    var heightGetterSetter = Idea.Util.uintGetterSetter("height");
    var rxGetterSetter = Idea.Util.uintGetterSetter("rx");
    var ryGetterSetter = Idea.Util.uintGetterSetter("ry");


    /*
     * Simple rectangle with content and/or with rounded corners.
     *
     * @param father       Util.Widget, parental to Rectangle, or Util.Canvas,
     *                     if Rectangle doesn't have a parent and is drawn right
     *                     on the canvas.
     * @param x            x coordinate of top-left corner of the rectangle
     * @param y            y coordinate of top-left corner of the rectangle
     * @param width        width of the rectangle
     * @param height       height of the rectangle
     * @param rx           x-axis radius of corners
     * @param ry           y-axis radius of corners
     * @param stroke       set of stroke attributes.
     * @param fill         set of fill attributes.
     * @param content
     */
    Idea.Rectangle = function(father, width, height, rx, ry) { //, stroke, fill, content){
        if (x === undefined) {throw new Error("x not specified!");}
        if (y === undefined) {throw new Error("y not specified!");}
        if (width === undefined) {throw new Error("width not specified");}
        if (height === undefined) {throw new Error("height not specified");}
        if (rx === undefined) {rxGetterSetter.call(this, 0);}
        if (ry === undefined) {ryGetterSetter.call(this, 0);}
        //draw primitives
        this.father = father;
        if (this.father instanceof Idea.Canvas) {
            this._group = Idea.Util.createSVGElement(this.father._canvas, 'g', {});
            this._drawing = Idea.Util.createSVGElement(this._group, 'rect', {
                "x1": this._base.x,
                "y1": this._base.y,
                "x2": this._tip.x,
                "y2": this._tip.y
            });
            //this._drawing.style.stroke = this._color;
            //this._drawing.style['stroke-width'] = this.width;
        }
        else {
            //TODO!!!!
        }

    };

    Idea.Util.extend(Idea.Arrow, Idea.Widget);
    Idea.Util.addAttrsToPrototype(Idea.Arrow, {
        x: xGetterSetter,
        y: yGetterSetter,
        width: widthGetterSetter,
        height: heightGetterSetter,
        rx: rxGetterSetter,
        ry: ryGetterSetter,
    });
})();
