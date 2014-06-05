/*
 * Idea.js is a library, meant for creating rich presentations that primarily
 * contain interactive animations and pictures right in the browser window.
 * 
 * Idea.js also comes with an in-browser GUI viewer/editor, where you can 
 * create or view your presentations.
 * 
 * Your GUI editor may be in one of 2 modes: edit or view. In edit mode you
 * are suppliedi with a canvas to draw your presentation on and with tools to 
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
 * Each widget corresponds to a LayerSet in the Layers bar. LayerSet may
 * contain daughterly Layers and LayerSets. Layer is an object, to which you 
 * apply low-level javascript drawing functions, such as lineTo(), stroke() 
 * etc.
 *
 * Note that you CAN'T write absolutely arbitrary javascript code in Source 
 * code bar for security reasons - otherwise, black hat hackers would've been
 * able to introduce malicious code otherwise. All the code, entered in Source
 * code bar is sanitized via white-list-based sanitizer.

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
        default_viewport_width: 1024,
        default_viewport_height: 1024,
        framerate: 25
    };
})();

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
        if (canvas === undefined) {
            this._canvas = document.createElement('svg');
            this._canvas.setAttribute("version", "1.1")
            this._canvas.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            this._canvas.setAttribute("width", Idea.Conf.canvas_width);
            this._canvas.setAttribute("height", Idea.Conf.canvas_height);

            //check if width/height is set and define the size of viewport
            var viewbox;
            if (!((width === undefined) || (height === undefined))) {
                viewbox = "" + Idea.Conf.canvas_width/2 + " "
                 + Idea.Conf.canvas/2 - height + " " + width + " " + height;
                alert(viewbox);
            }
            else {
                viewbox =  "" + Idea.Conf.canvas_width/2 + " "
                 + Idea.Conf.canvas/2 - Idea.Conf.default_viewport_width + " "
                 + Idea.Conf.default_viewport_width + " " 
                 + Idea.Conf.default_viewport_height;
                alert(viewbox)
            }
            this._canvas.setAttribute("viewBox", viewbox)

            document.body.appendChild(this._canvas);

            this.slides = [new Idea.Slide(this)]; //array of slides in order from 1st to last
            this._slide = this.slides[0];
            this._mode = "view"; // "view" or "edit" mode

            // http://en.wikipedia.org/wiki/HTML_attribute - list of events
            this._canvas.onclick = this.click;
            this._canvas.ondblclick = this.dblclick;
            this._canvas.onmousedown = this.mousedown;
            this._canvas.onmousemove = this.mousemove;
            this._canvas.onmouseout = this.mouseout;
            this._canvas.onmouseover = this.mouseover;
            this._canvas.onmouseup = this.mouseup;

            this._canvas.onkeydown = this.keydown;
            this._canvas.onkeypress = this.keypress;
            this._canvas.onkeyup = this.keyup;

            //alert("Creating canvas");
            //var ctx=this._canvas.getContext("2d");
            //ctx.beginPath();
            //ctx.moveTo(0,0);
            //ctx.lineTo(300,150);
            //ctx.stroke();
        }
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
            if (width === undefined){return this._canvas.width;}
            else {this._canvas.width = width;}
        },

        height: function(height){
            if (height === undefined){return this._canvas.height;}
            else {this._canvas.height = height;}
        },
        _propagateEventToWidgets: function(evt){
            for (i=this.slide().widgets.length; i >= 0; i++) {
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
        click: function(){
            this._propagateEventToWidgets(event);
        },
        dblclick: function(){
            this._propagateEventToWidgets(event);
        },
        mousedown: function(){
            this._propagateEventToWidgets(event);
        },
        mousemove: function(){
            this._propagateEventToWidgets(event);
        },
        mouseout: function(){
            this._propagateEventToWidgets(event);
        },
        mouseover: function(){
            this._propagateEventToWidgets(event);
        },
        mouseup: function(){
            this._propagateEventToWidgets(event);
        },

        keydown: function() {
            this._propagateEventToWidgets(event);
        },
        keypress: function(){
            this._propagateEventToWidgets(event);
        },
        keyup: function(){
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
    /*
     * Straight arrow
     *
     * @param width       width of arrow line, defaults to 1px.
     * @param color       color of arrow, defaults to black.
     * @param base        coordinates of arrow's base, e.g.{x:42, y:42}.
     * @param tip         coordinates of arrow's tip, e.g. {x:42, y:42}.
     * @param base_widget see tip_widget.
     * @param tip_widget  arbitrary widgets that represent base and tip of 
     *                    arrow (if not specified, Triangles will be 
     *                    created and used by default).
     */
    Idea.Arrow = function(width, color, base, tip, base_widget, tip_widget){
        if (width === undefined) {this._width = 1;}
        else {this._width = width;}
        if (color === undefined) {this._color = color;}
        else {this._color = color;}
        //TODO allow to use other widgets dock points to be used 
        // as base and tip instead of just coordinates. Then arrow will
        // stick to widgets.
        this._base = base;
        this._tip = tip;
        if (base_widget === undefined) {this._base_widget = new Triangle();}
        else {this._base = base_widget;}
        if (tip_widget === undefined) {this._tip_widget = new Triangle();}
        else {this._tip = tip_widget;}
    };

    Idea.Util.extend(Idea.Arrow, Idea.Widget);
    Idea.Util.addAttrsToPrototype(Idea.Arrow, {
        width: function(width){
            if (width === undefined) {return this._width;}
            else {
                if (Idea.INTREGEX.test(width)) {this._width = width;}
                else {throw new Error("Width should be int, got: '" + width + "'!");}
            }
        },
        color: function(color){
            if (color === undefined) {return this._color;}
            else {
                if (Idea.isHexColor(color)){ this._color = color;}
                else {
                    throw new Error("Color should be a valid color string, e.g #ACDC66, got: '" + color + "'!")};
            }
        },
        base: function(base){
            if (base === undefiend) {return this._base}
            else {
                if (base.hasattribute("x") && INTREGEX.test(base.x) && base.hasattribute("y") && INTREGEX.test(base.y)){
                    this._base = base;
                }//TODO TEST CANVAS SIZE
            }
        },
        tip: function(tip){
            if (tip === undefined) {return this._tip}
            else {
                if (tip.hasattribute("x") && INTREGEX.test(tip.x) && tip.hasattribute("y") && INTREGEX.test(tip.y)){
                    this._tip = tip;
                }//TODO TEST CANVAS SIZE
               
            }
        },
        base_widget: function(widget){
            if (widget === undefined) {return this._base_widget;}
            else {
                if (widget instanceof Idea.Widget) {this._base_widget = widget;}
                else {throw new Error("Expected widget as base_widget, got:'" +typeof widget + "'");}
            }
        },
        tip_widget: function(widget){
            if (widget === undefined) {return this._tip_widget;}
            else {
                if (widget instanceof Idea.Widget) {this._tip_widget = widget;}
                else {throw new Error("Expected widget as tip_widget, got:'" +typeof widget + "'");}
            }
        },
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
