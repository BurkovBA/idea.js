/*
 * Idea.js is a library, meant for creating rich presentations that primarily
 * contain interactive animations and pictures right in the browser window.
 * 
 * Idea.js also comes with an in-browser GUI viewer/editor, where you can 
 * create or view your presentations.
 * 
 * GUI viewer/editor elements
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
 * Layers bar
 *
 * Layers bar describes the order of Widgets on your Canvas. Layers bar 
 * contains Layers and Layer Groups. A Layer is an object, on which you put
 * low-level drawing primitives that comprise your Widgets. A Layer Group 
 * (or just Group) is an ordered set of Layers and/or daughterly Layer Groups. 
 * Each Widget corresponds to a Layer Group. The most primitive Widgets consist
 * of a Layer Group, which contains a single Layer. The Widget primitives are
 * drawn on that Layer.  If the widget contains daughterly widgets, each 
 * daughterly Widget corresponds to its own Layer Group within the parent 
 * Layer's Layer Group.
 *
 * Source code bar 
 * 
 * Note that you CAN'T write absolutely arbitrary javascript code in Source 
 * code bar for security reasons - otherwise, black hat hackers would've been
 * able to introduce malicious code. All the code, entered in Source
 * code bar is sanitized via white-list-based sanitizer.
 *
 * Idea.js makes use of getterSetters (possibly overloaded, i.e. in multiple forms)
 * to access and modify attributes of objects. E.g. you can say widget.opacity()
 * to obtain opacity value of your widget and say widget.opacity(0.5) to set
 * its opacity to 50%. So the same method "opacity" acts both as getter and setter.
 * 
 */

/*
 * This is a single instance of GUI with Idea.Canvas, with GUI elements 
 * specified and with a separate set of configuration options.
 *
 */

Idea = function(){
        // create a div container for our canvas
        this._div = document.createElement('div');
        this._div.style.border = "1px solid rgb(200,200,200)";
        this._div.style.padding = "3px";
        this._div.style.display = "inline-block";
        //document.body.appendChild(this._div);

        this.slides = [new this.Slide()]; // slides in correct order
        this._slide = this.slides[0]; // currently active slide
        this._mode = "view"; // "view" or "edit" mode

        this.gui = {};

        this.svg = Idea.Util.createSVGElement(this._div, 'svg', {width: Idea.Conf.defaultViewportWidth+40, height: Idea.Conf.defaultViewportHeight+40});
        this.canvas = new this.Canvas(this);
        this.svg.appendChild(this.canvas._canvas);
        this.svg.style.display = "inline-block";
        this.svg.style.border = "1px solid black";        
        this._div.appendChild(this.svg);

        var scrollbarPageSize = parseInt(Idea.Conf.canvasHeight / this.canvas.height());
        var scrollbarScrollSize = parseInt(Idea.Conf.canvasHeight / this.canvas.height() / Idea.Conf.scrollbarScrollsPerPage);
        this._vScrollbar = new this.Scrollbar(this.svg, this.canvas, this.svg.getAttribute("width")-40, 0, 40, this.svg.getAttribute("height")-40, true, null, null, scrollbarPageSize, scrollbarScrollSize);

        scrollbarPageSize = parseInt(Idea.Conf.canvasWidth / this.canvas.width());
        scrollbarScrollSize = parseInt(Idea.Conf.canvasWidth / this.canvas.width() / Idea.Conf.scrollbarScrollsPerPage);
        this._hScrollbar = new this.Scrollbar(this.svg, this.canvas, 0, this.svg.getAttribute("height")-40, this.svg.getAttribute("width")-40, 40, false, null, null, scrollbarPageSize, scrollbarScrollSize);

        this.gui.tools = new this.Toolbar();
        this._div.appendChild(this.gui.tools._div);

        // create resize grip
        this._grip = document.createElement('div');
        this._grip.style.width = 10;
        this._grip.style.height = 10;
        this._grip.style.display = "inline-block";
        this._grip.style.background = "#AAAAAA";
        this._grip.style.float = "right";
        this._div.appendChild(this._grip);

        this._grip.onmousedown = function(event){
            event = Idea.Util.normalizeMouseEvent(event);
            if (event.which == 1) {
                this._grip_pressed = true;
                this._grip_x = event.clientX;
                this._grip_y = event.clientY;
                // add event listeners to <html> (i.e. document.documentElement)
                // to respond to mousemove and mouseup if they're outside _grip.
                // idea taken from here:
                // http://stackoverflow.com/questions/8960193/how-to-make-html-element-resizable-using-pure-javascript
                var Up = function(event){
                    event = Idea.Util.normalizeMouseEvent(event)
                    if (event.which == 1) {
                        this._grip_pressed = false;
                        document.documentElement.removeEventListener('mousemove', Move, false);
                        document.documentElement.removeEventListener('mouseup', Up, false);
                    }
                }.bind(this);
                
                var Move = function(event) {
                    event = Idea.Util.normalizeMouseEvent(event)
                    if (this._grip_pressed === true){
                        this.width(parseInt(this.width()) + event.clientX - this._grip_x);
                        this.height(parseInt(this.height()) + event.clientY - this._grip_y);
                        this._grip_x = event.clientX;
                        this._grip_y = event.clientY;
                    }
                }.bind(this);

                document.documentElement.addEventListener('mouseup', Up, false);
                document.documentElement.addEventListener('mousemove', Move, false);
            }
        }.bind(this);
        this._grip.onmouseover = function(event){
            event = Idea.Util.normalizeMouseEvent(event);
            this.style.cursor = "nw-resize";
        };

        /*
        //create clear element to clear floats
        this._clear = document.createElement('div');
        this._grip.style.clear = "both";
        this._div.appendChild(this._clear);        
        */
};

/*
 * Idea.Util contains convenience functions, objects and constants for Idea.js programmers,
 * writing both library core and extensions, widgets etc.
 */

Idea.Util = {};

/*
 * Idea.Conf contains configuration defaults (e.g. Canvas size, framerate etc.)
 * and when you say var idea = new Idea();, idea.conf's content is cloned from
 * Conf's contents.
 */

Idea.Conf = {};

/*
 * Idea.ObjectsRegistry is a mapping {CathegoryName: Cathegory} or {Cathegory: Object}, where
 * cathegories are Strings (e.g. "Basic", "Electrical Engineering", "Linear Algebra" etc.) and
 * Objects are clickable objects, that user can create on the canvas, e.g. "Line", "Rectangle", 
 * "Vertex" (in graph-theoretical sense), "Oxygen" (as a graphical representation of atom in 
 * chemical formula). Cathegories can be nested, so that within "Linear Algebra" is nested in "Math".
 *
 */

Idea.ObjectsRegistry = {};

Idea.prototype = {
    mode: function(mode){
        if (mode === undefined) {return this._mode;}
        else {
            if (mode == "view" || mode == "edit") {this._mode = mode;}
            else {throw new Error("Wrong mode value: '" + mode + "', should be in ['view', 'edit']!");}
        }
    },

    slide: function(slide){
        if (slide === undefined) {return this._slide;}
        else {
            if (this.slides.contains(slide)) {this._slide = slide;}
            else {throw new Error("Slide not in slides!");}
        }
    },

    insertSlide: function(index, slide){
        // create and insert slide preview to the slidebar
        if (index > this.slides.length){
            // raise Exception
        }
        else {
            var previous_slide_preview = this.gui.slidebar.getChildNodes()[index];
            var div = document.createElement('div');
            // TODO create preview
            this.gui.slidebar.insertBefore(div, previous_slide_preview)
        }
        this.splice(index, 0, slide);
    },

    appendSlide: function(slide){
        this.insertSlide(this.length, slide);
    }

};

Idea.prototype.constructor = Idea;

(function(){
    Idea.Conf = {
    	canvasWidth: 2000, // this determines the size of coordinates grid (in canvas coordinates)
    	canvasHeight: 2000, // this determines the size of coordinates grid (in canvas coordinates)
    	canvasLeft: -1000, // this is where coordinates grid pattern starts to be drawn (in canvas coordinates)
    	canvasTop: -1000, // this is where coordinates grid pattern starts to be drawn (in canvas coordinates)

        defaultViewboxWidth: 4096, // this is in canvas coordinates
        defaultViewboxHeight: 4096, // this is in canvas coordinates
        defaultViewportWidth: 800, // this is in browser window coordinates
        defaultViewportHeight: 800, // this is in browser window coordinates

    	scrollbarScrollsPerPage: 20, // how many lines per page are there in vertical scrollbar or how many chars per line in horizontal scrollbar

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
        INTREGEX: /^\-?\d+$/,
        isHexColor: function(color){return /^#[0-9A-F]{6}$/i.test(color)},

        // classList is available in ie8+ or ie10+ according to different sources; not in Opera Mini
        // thus we define jquery-like utility methods for manipulations with classes
        hasClass: function(element, className){
            if (element.classList)
              return element.classList.contains(className);
            else
              return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
        },

        addClass: function(element, className){
            if (element.classList) {
                element.classList.add(className);
            }
            else
                element.className += ' ' + className;
        },

        removeClass: function(element, className){
            if (element.classList)
              element.classList.remove(className);
            else
              element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        },

        normalizeMouseEvent: function(event){
            // ie has event undefined; instead, it has window.event
            event = event || window.event;

            // ie events have button property instead of which property and 
            // reasonable 1/2/4 key codes instead of 1/3/2 (alas, W3C chose 1/3/2).
            // We map event.button onto event.which as described here:
            // http://www.martinrinehart.com/early-sites/mrwebsite_old/examples/cross_browser_mouse_events.html
            var which = event.which ? event.which :
            event.button === 1 ? 1 :
            event.button === 2 ? 3 : 
            event.button === 4 ? 2 : 1;

            // ie has event.x/event.y instead of event.clientX/event.clientY
            var clientX = event.x || event.clientX;
            var clientY = event.y || event.clientY;

            // ie ain't got pageX/pageY, create them, using the code from:
            // http://javascript.ru/tutorial/events/properties#elementy-svyazannye-s-sobytiem
            var pageX, pageY;
            if (event.pageX){
                pageX = event.pageX;
                pageY = event.pageY;
            }
            else{
                // see here, how to check for null/undefined:
                // http://stackoverflow.com/questions/2559318/how-to-check-for-an-undefined-or-null-variable-in-javascript
                if (event.pageX == null && clientX != null ) { 
                    var html = document.documentElement;
                    var body = document.body;
                
                    pageX = clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
                    pageY = clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
                }                
            }

            // ie has srcElement instead of event.target
            var target = event.target || event.srcElement;

            // ie has fromElement/srcElement instead of target
            var relatedTarget;
            if (event.relatedTarget) relatedTarget = event.relatedTarget;
            if (!event.relatedTarget && event.fromElement) {
                relatedTarget = (event.fromElement == event.target) ? event.toElement : event.fromElement
            }

            var normalizedEvent = {
                target: target,
                nativeEvent: event,
                which: which,
                clientX: clientX,
                clientY: clientY,
                pageX: pageX,
                pageY: pageY
            }
            if (relatedTarget) normalizedEvent.relatedTarget = relatedTarget;
            return normalizedEvent;
        },

        /*
         * Classical Douglas Crockford's extend.
         *
         * @method
         * @memberof Idea.Util
         * @param Child - Child constructor, whose prototype shall extend Parent's prototype
         * @param Parent - Parent constructor, whose prototype is extended
         */

        crockfordsExtend: function(Child, Parent){
            var F = function(){};
            F.prototype = Parent.prototype;
            Child.prototype = new F();
            Child.prototype.constructor = Child;
            Child.superclass = Parent.prototype;
        },

        /*
         * Variation of Crockford's extend with regard to getters/setters:
         * Sometimes I say e.g. new idea.Slide(), where idea.Slide is not
         * the real Slide constructor, but getter method, which returns the result
         * of binding of the actual Slide constructor to Idea instance:
         * Slide.bind(this) ("this" is idea instance, the getter is stored in,
         * so that within Slide constructor the idea instance is available as a variable,
         * automatically passed to the constructor. The problem is that prototype
         * of this bound constructor differs from prototype of unbound constructor.
         * Thus we store a reference to the real prototype of unbound constructor 
         * in "fn" variable of bound. This extend checks, whether "fn" attribute is
         * present or not in the Child and Parent and extends it, if it exists.
         *
         */

        extend: function(Child, Parent){
            var parent_prototype;
            if ("fn" in Parent){ parent_prototype = Parent.fn } // WARNING
            else { parent_prototype = Parent.prototype; }


            var F = function(){};
            F.prototype = parent_prototype;
            if ("fn" in Child) {
                Child.fn = new F();
                Child.fn.constructor = Child.cons;
                Child.cons.superclass = parent_prototype;
            }
            else {
                Child.prototype = new F();
                Child.prototype.constructor = Child;
                Child.superclass = parent_prototype;
            }  
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
            var key;
            if ("fn" in constructor){
                for (key in attrs){
                    constructor.fn[key] = attrs[key];
                }
            }
            else{
                for (key in attrs){
                    constructor.prototype[key] = attrs[key];
                }                
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
         * @param attrs   object with attributes of newly created element.
         * @returns       newly created element
         *
         */

        createSVGElement: function(father, tag, attrs){
            var elem = document.createElementNS(this.SVGNS, tag);
            for (var key in attrs){
                if (key == "xlink:href") {
                    elem.setAttributeNS(this.XLINKNS, 'href', attrs[key]);
                }
                else {elem.setAttribute(key, attrs[key]);}
            }
            father.appendChild(elem);
            return elem;
        },

        /*
         * Given coordinates of mouse event in window coordinate system
         * (e.g. (event.clientX, event.clientY)) that happened within an <svg> element,
         * returns the canvas coordinates (we call that <svg> element "canvas") of
         * that location. We also call those coordinates "viewbox" coordinates
         * or "real world" coordinates.
         *
         * For description of coordinate systems, see:
         *     http://www.w3.org/TR/SVG/coords.html
         *     http://sarasoueidan.com/blog/svg-coordinate-systems/
         * 
         * Note: coordinate system of an element within svg canvas (e.g. <rect>)
         * may differ from global canvas coordinate system, if transformations 
         * (e.g. rotation) are applied to your <rect> - your <rect>'s coordinate 
         * system will be rotated relative to canvas coordinate system.
         *
         * Note: if rotation is applied to your element, it also has a
         * different boundingclientrect.
         *   http://phrogz.net/getboundingclientrect-is-lame-for-svg
         *
         * Note: this also assumes that preserveAspectRatio on canvas is disabled.
         *
         * @method
         * @memberof Idea.Util
         * @param x         user coordinates x
         * @param y         user coordinates y
         * @param canvas    svg canvas where the mouse event happened
         * 
         */

        windowCoordsToCanvasCoords: function(x, y, canvas){
            // Note the difference between getBoundingClientRect() and getBBox():
            // http://stackoverflow.com/questions/6179173/how-is-the-getbbox-svgrect-calculated
            var canvasRectangle = canvas.getBoundingClientRect(); // this is relative to window - the browser viewport
            var canvasTopOffset = y - canvasRectangle.top; // in window coordinates
            var canvasLeftOffset = x - canvasRectangle.left; // in window coordinates

            var viewbox = canvas.getAttributeNS(null, 'viewBox');
            var viewboxDimensions = viewbox.split(" ");
            viewboxDimensions.forEach(function(element, index, array){array[index] = parseInt(element);})

            var canvasToUserXRatio = viewboxDimensions[2] / canvasRectangle.width;
            var canvasToUserYRatio = viewboxDimensions[3] / canvasRectangle.height;

            var canvasX = parseInt(viewboxDimensions[0] + canvasToUserXRatio * canvasLeftOffset);
            var canvasY = parseInt(viewboxDimensions[1] + canvasToUserYRatio * canvasTopOffset);
            var canvasCoords = {x: canvasX, y: canvasY};
            return canvasCoords;
        },
        
        /*
         * Idea.js makes use of getterSetters (possibly overloaded) to
         * access attributes. E.g. you can say widget.opacity() to obtain
         * opacity value of your widget and say widget.opacity(0.5) to set
         * its opacity to 50%. So the same method "opacity" acts both as
         * getter and setter.
         * 
         * When you invoke setter, Idea.js checks that you supplied an
         * appropriate value to it - performs "validation". E.g. opacity
         * value should be a non-negative float between 0 and 1 and when you
         * call widget.opacity(value), it first validates the value, i.e. 
         * checks that it is between 0 and 1, before assigning opacity to it.
         *
         * In order to re-use the simplest and most common getterSetters, 
         * we store factory functions, generating them, here.
         */ 

        /*
         * Factory function that returns getterSetter function, which,
         * as getter, returns value of argName or, as setter, validates
         * input value, checking, if it's an unsigned integer.
         * 
         * @function
         * @memberof Idea.Util
         * @param argName  name of argument to get/set with this method.
         */

        uintGetterSetter: function(argName){
            return function(arg){
                if (arg === undefined) {return this["_"+argName];}
                else {
                    Idea.Util.uintValidator(arg, argName);
                    this["_"+argName] = arg;
                }
            };
        },

        uintValidator: function(arg, argName){
            if (!Idea.Util.UINTREGEX.test(arg)) throw new Error(argName + " should be unsigned int, got: '" + arg + "'!");
        },

        intValidator: function(arg, argName){
            if (!Idea.Util.INTREGEX.test(arg)) throw new Error(argName + " should be int, got: '" + arg + "'!");
        },

        /*
         * Factory function that returns getterSetter function, which,
         * as getter, returns value of argName or, as setter, validates
         * input value, checking, if it's a color literal.
         * 
         * @function
         * @memberof Idea.Util
         * @param argName  name of argument to get/set with this method.
         */

        colorGetterSetter: function(argName){
            //TODO!!! COLOR literals, e.g. rgb, rgba or trivial color names
            return function(arg){
                if (arg === undefined) {return this["_"+argName];}
                else {
                    if (Idea.Util.isHexColor(arg)){ this["_"+argName] = arg;}
                    else {
                        throw new Error(argName + " should be a valid color string, e.g #ACDC66, got: '" + arg + "'!");
                    }
                }
            };
        },

        /*
         * Factory function that returns getterSetter function, which,
         * as getter, returns value of argName or, as setter, validates
         * input value, checking, if it's a Util.Widget subclass.
         * 
         * @function
         * @memberof Idea.Util
         * @param argName  name of argument to get/set with this method.
         */

        widgetGetterSetter: function(argName){
            return function(arg){
                if (arg === undefined) {return this["_"+argName];}
                else {
                    if (arg instanceof Idea.prototype.Widget) {this["_"+argName] = arg;}
                    else {throw new Error(argName + "should be a Util.prototype.Widget subclass, got:'" + typeof arg + "'!");}
                }
            };
        }

    };
})();

/*
 * Canvas is an infinite flat area, and user looks
 * at it through a finite viewport (part of browser window), while
 * the part of canvas under the viewport is called viewBox.
 * Viewport can zoom in and out. Its size is specified as an input
 * parameter to idea.Canvas.
 *
 * ........  <-- the big thing, denoted with . is the whole canvas
 * ........
 * ..---- <-- the small thing is the viewBox
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

    Idea.prototype.Canvas = function(idea, width, height){
        // create the canvas itself, set its attributes and insert it into div    
        this._canvas = document.createElementNS(Idea.Util.SVGNS, 'svg');
        //this._canvas.style.border = "1px solid #000";

        //this._canvas.setAttribute("version", "1.1")
        //this._canvas.setAttribute("xmlns", Idea.Util.SVGNS);
        this._canvas.setAttribute('x', "0");
        this._canvas.setAttribute('y', "0");
        this.width(Idea.Conf.defaultViewportWidth);
        this.height(Idea.Conf.defaultViewportHeight);

        // check if width/height is set and define the size and location of viewBox
        var x = 0;
        var y = 0;        
        if ((width === undefined) || (height === undefined)) {
            width = Idea.Conf.defaultViewportWidth;
            height = Idea.Conf.defaultViewportHeight;
        }
        this.viewBox({x:x, y:y, width:width, height:height});

        // create defs and grid, stolen from:
        // http://stackoverflow.com/questions/14208673/how-to-draw-grid-using-html5-and-canvas-or-svg
        this.defs = Idea.Util.createSVGElement(this._canvas, 'defs', {});
        this.smallGridPattern = Idea.Util.createSVGElement(this.defs, 'pattern', {id:"smallGridPattern",
                                                                                  width: "8",
                                                                                  height: "8",
                                                                                  patternUnits: "userSpaceOnUse",
                                                                                  });
        Idea.Util.createSVGElement(this.smallGridPattern, 'path', {d:"M 8 0 L 0 0 0 8", fill:"none", stroke:"#c0c0c0", "stroke-width":"0.5"});
        this.gridPattern = Idea.Util.createSVGElement(this.defs, 'pattern', {id:"gridPattern",
                                                                       width: "80",
                                                                       height: "80",
                                                                       patternUnits: "userSpaceOnUse"});
        Idea.Util.createSVGElement(this.gridPattern, 'rect', {width:"80", height:"80", fill:"url(#smallGridPattern)"});
        Idea.Util.createSVGElement(this.gridPattern, 'path', {d:"M 80 0 L 0 0 0 80", fill:"none", stroke: "#c0c0c0", "stroke-width": "1"});

        //this.grid = Idea.Util.createSVGElement(this._canvas, 'rect', {width:"100%", height: "100%", fill:"url(#gridPattern)"});
        this.grid = Idea.Util.createSVGElement(this._canvas, 'rect', {x:Idea.Conf.canvasLeft, y:Idea.Conf.canvasTop, width:Idea.Conf.canvasWidth, height:Idea.Conf.canvasHeight, fill:"url(#gridPattern)"});

        // TODO REMOVE THIS IT'S A TEST
        this.rect = Idea.Util.createSVGElement(this._canvas, 'rect', {
            "x": 10,
            "y": 10,
            "width": 50,
            "height": 50,
        });
        this.rect.style.stroke = "black";
        this.rect.style.fill = "none";

        var another_rect = Idea.Util.createSVGElement(this._canvas, 'rect', {
            "x": -100,
            "y": -100,
            "width": 350,
            "height": 350
        });
        another_rect.style.stroke = "black";
        another_rect.style.fill = "none";
        // TODO REMOVE THIS IT'S A TEST

        // http://en.wikipedia.org/wiki/HTML_attribute - list of events
    };

    Idea.prototype.Canvas.prototype = {
        width: function(width){
            if (width === undefined) return this._canvas.getAttribute("width");
            else this._canvas.setAttribute("width", width);
        },

        height: function(height){
            if (height === undefined) return this._canvas.getAttribute("height");
            else this._canvas.setAttribute("height", height);
        },

        viewBox: function(viewBox){
            var dimensions, viewBoxAttribute;
            if (viewBox === undefined){
                viewBoxAttribute = this._canvas.getAttribute('viewBox'); //this._canvas.getAttributeNS(null, 'viewBox');
                dimensions = viewBoxAttribute.split(" ");
                dimensions.forEach(function(element, index, array){array[index] = parseInt(element);});
                viewBox = {x: dimensions[0], y: dimensions[1], width: dimensions[2], height: dimensions[3]};
                return viewBox;
            }
            else {
                for (var key in viewBox) Idea.Util.intValidator(viewBox[key], "viewBox." + key);
                viewBoxAttribute = viewBox.x + " " + viewBox.y + " " + viewBox.width + " " + viewBox.height;
                this._canvas.setAttribute("viewBox", viewBoxAttribute);  //this._canvas.setAttributeNS(Idea.Util.SVGNS, "viewBox", viewBoxAttribute);
            }
        }
    };
})();

(function(){

	var Slide = function(idea){
        this.widgets = []; //list of widgets ordered from deepest to upmost
    };

    Slide.prototype = {
      constructor: Slide  
    };

	Object.defineProperty(Idea.prototype, "Slide", {
		get: function(){
            var binded_slide = Slide.bind(null, this);
            binded_slide.fn = Slide.prototype;
            binded_slide.cons = Slide;
            return binded_slide;
		}
	});

})();

(function(){
    var Slidebar = function(idea){
        this.idea = idea;
        this._div = document.createElement('div');
        this._div.style.border = "1px solid rgb(200,200,200)";
        this._div.style.display = "inline-block";
        this._div.style.overflow = "scrollbar";
        this._div.style.width = "200px";
    };

    Slidebar.prototype = {constructor: Slidebar};

    Object.defineProperty(Idea.prototype, "Slidebar", {
        get: function(){
            return Slidebar.bind(null, this);
        }
    });

    var Timeline = function(idea){
        this.idea = idea;
        this._div = document.createElement('div');
        this._div.style.border = "1px solid rgb(200,200,200)";        
        this._div.style.display = "inline-block";
        this._div.style.overflow = "scrollbar";
        this._div.style.width = "200px";
    };

    Timeline.prototype = {};
    Timeline.prototype.constructor = Timeline;

    Object.defineProperty(Idea.prototype, "Timeline", {
        get: function(){
            return Timeline.bind(null, this);
        }
    });

    var Toolbar = function(idea){
    	this.idea = idea;
        this._div = document.createElement('div');
        this._div.className = 'toolbar';
        this._div.style.width = "" + (Idea.Conf.defaultViewportWidth + 40) +"px";
        this._div.style.height = "" + (Idea.Conf.defaultViewportHeight + 40) +"px";

        this.tabBar = document.createElement('div');
        this._div.appendChild(this.tabBar);
        Idea.Util.addClass(this.tabBar, 'toolbar-tabbar');

        this.fileTab = document.createElement('div');
        this.fileTab.innerHTML = "File"; //ie8+/9+
        this.tabBar.appendChild(this.fileTab);
        Idea.Util.addClass(this.fileTab, 'toolbar-tab');
        Idea.Util.addClass(this.fileTab, 'active');

        this.objectsTab = document.createElement('div');
        this.objectsTab.innerHTML = "Objects"; //ie8+/9+
        this.tabBar.appendChild(this.objectsTab);
        Idea.Util.addClass(this.objectsTab, 'toolbar-tab');

        this.animationsTab = document.createElement('div');
        this.animationsTab.innerHTML = "Animations"; //ie8+/9+
        this.tabBar.appendChild(this.animationsTab);
        Idea.Util.addClass(this.animationsTab, 'toolbar-tab')

        this.filePage = document.createElement('div');
        this._div.appendChild(this.filePage);
        Idea.Util.addClass(this.filePage, 'toolbar-page');
        Idea.Util.addClass(this.filePage, 'active');

        this.objectsPage = document.createElement('div');
        this._div.appendChild(this.objectsPage);
        Idea.Util.addClass(this.objectsPage, 'toolbar-page');

        this.animationsPage = document.createElement('div');
        this._div.appendChild(this.animationsPage);
        Idea.Util.addClass(this.animationsPage, 'toolbar-page');

        var toolbarTabs = [this.fileTab, this.objectsTab, this.animationsTab];
        var toolbarPages = [this.filePage, this.objectsPage, this.animationsPage];

        this.fileTab.addEventListener('click', function(){
            toolbarPages.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            toolbarTabs.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            if (!Idea.Util.hasClass(this.fileTab, 'active')) Idea.Util.addClass(this.fileTab, 'active');
            if (!Idea.Util.hasClass(this.filePage, 'active')) Idea.Util.addClass(this.filePage, 'active');
        }.bind(this));

        this.objectsTab.addEventListener('click', function(){
            toolbarPages.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            toolbarTabs.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            if (!Idea.Util.hasClass(this.objectsTab, 'active')) Idea.Util.addClass(this.objectsTab, 'active');
            if (!Idea.Util.hasClass(this.objectsPage, 'active')) Idea.Util.addClass(this.objectsPage, 'active');
        }.bind(this));

        this.animationsTab.addEventListener('click', function(){
            toolbarPages.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            toolbarTabs.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            if (!Idea.Util.hasClass(this.animationsTab, 'active')) Idea.Util.addClass(this.animationsTab, 'active');
            if (!Idea.Util.hasClass(this.animationsPage, 'active')) Idea.Util.addClass(this.animationsPage, 'active');
        }.bind(this));


        this.objectsMenu = document.createElement('div');
        this.objectsTab.appendChild(this.objectsMenu);

        this.objectContext = document.createElement('div');
        this.objectsTab.appendChild(this.objectContext);


    };

    Toolbar.prototype = {};
    Toolbar.prototype.constructor = Toolbar;

    Object.defineProperty(Idea.prototype, "Toolbar", {
        get: function(){
            return Toolbar.bind(null, this);
        }
    });

})();

(function(){

    var Widget = function(slide){
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

    Widget.prototype = {
        constructor: Widget,
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

    Object.defineProperty(Idea.prototype.Slide.fn, "Widget", {
        get: function(){
            var binded_widget = Widget.bind(null, this);
            binded_widget.fn = Widget.prototype;
            binded_widget.cons = Widget;
            return binded_widget;
        }
    });

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
     * @param owner       Idea.Canvas.Slide or its child widget that contains
                          the Arrow.
     * @param father      Util.Widget, parental to Arrow, or Canvas,
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

    var Arrow = function(owner, father, width, color, base, tip, base_widget, tip_widget){
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
        if (this.father instanceof Idea.prototype.Canvas) {
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

    Object.defineProperty(Idea.prototype.Slide.fn, "Arrow", {
        get: function(){
            var binded_arrow = Arrow.bind(null, this);
            binded_arrow.fn = Arrow.prototype;
            binded_arrow.cons = Arrow;
            return binded_arrow;
        }
    });

    Idea.Util.extend(Arrow, Idea.prototype.Slide.fn.Widget);
    Idea.Util.addAttrsToPrototype(Idea.prototype.Slide.fn.Arrow, {
        width: widthGetterSetter, 
        color: colorGetterSetter,
        base: baseGetterSetter,
        tip: tipGetterSetter,
        base_widget: baseWidgetGetterSetter,
        tip_widget: tipWidgetGetterSetter,
        accepts_event: function(evt){
            if (Idea.Util.MOUSE_EVENTS.contains(evt.type)){
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
    var Rectangle = function(slide, father, width, height, rx, ry) { //, stroke, fill, content){
        //if (x === undefined) {throw new Error("x not specified!");}
        //if (y === undefined) {throw new Error("y not specified!");}
        if (width === undefined) {throw new Error("width not specified");}
        if (height === undefined) {throw new Error("height not specified");}
        if (rx === undefined) {rxGetterSetter.call(this, 0);}
        if (ry === undefined) {ryGetterSetter.call(this, 0);}
        //draw primitives
        this.father = father;
        if (this.father instanceof Idea.prototype.Canvas.fn.constructor) {
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

    Rectangle.prototype = {
        constructor: Rectangle
    };


    Object.defineProperty(Idea.prototype.Slide.fn, "Rectangle", {
        get: function(){
            var binded_rectangle = Rectangle.bind(null, this);
            binded_rectangle.fn = Rectangle.prototype;
            binded_rectangle.cons = Rectangle;
            return binded_rectangle;
        }
    });

    Idea.Util.extend(Rectangle, Idea.prototype.Slide.fn.Widget);
    Idea.Util.addAttrsToPrototype(Idea.prototype.Slide.fn.Arrow, {
        x: xGetterSetter,
        y: yGetterSetter,
        width: widthGetterSetter,
        height: heightGetterSetter,
        rx: rxGetterSetter,
        ry: ryGetterSetter,
    });
})();

//http://www.dotuscomus.com/svg/lib/iwsb/innerwinscroll.svg
//http://www.carto.net/papers/svg/gui/scrollbar/
//http://www.dotuscomus.com/svg/lib/library.html
(function(){

// http://www.dotuscomus.com/svg/lib/iwsb/innerwinscroll.svg
// http://www.carto.net/papers/svg/gui/scrollbar/
// http://www.dotuscomus.com/svg/lib/library.html
// http://www.codedread.com/blog/archives/2005/12/21/how-to-enable-dragging-in-svg/

/**
 *
 * Creates a scrollbar inside an <svg> element with given upper-left
 * coordinates and specified width/height. Either vertical or horizontal.
 *
 * @param father {DOMObject} - an <svg> dom node to put the scrollbar into
 * @param scrollable - an Idea.Scrollable object, scrolled by this scrollbar
 * @param x
 * @param y
 * @param width
 * @param height
 * @param vertical {boolean} - if the srollbar is vertical or horizontal
 */

// to add handler function from html scriptmelement in an inner svg, say
// onclick='top.handler_name(evt)'

// this is old style of events creation
var pageBackward = document.createEvent("CustomEvent");
// see https://developer.mozilla.org/en-US/docs/Web/API/document.createEvent
pageBackward.initCustomEvent('pageBackward', true, true, {}); //type, bubbles, cancelable, detail
window.dispatchEvent(pageBackward);

//TODO msie fireEvent

var Scrollbar = function(father, scrollable, x, y, width, height, vertical, sliderStart, sliderSize, scrollSize, pageSize){
	this.father = father;
	this.scrollable = scrollable; // TODO: remove this scrollable, instead completely rely on events?
	this.vertical = vertical;

	if (scrollSize) this.scrollSize = scrollSize; // TODO: validator
	else {
		if (vertical) this.scrollSize = height/100;
		else this.scrollSize = width/100;
	}
	console.log("scrollSize = " + this.scrollSize);	
	if (pageSize) this.pageSize = pageSize;
	else {
		if (vertical) this.pageSize = height/5;
		else this.pageSize = height/5;
	}

	this.scrollbar = Idea.Util.createSVGElement(father, 'svg', {x: x, y: y, width: width, height: height, viewBox: '0 0 ' + width + ' ' + height, xmlns: Idea.Util.SVGNS});

	this.defs = Idea.Util.createSVGElement(this.scrollbar, 'defs', {});
	this.arrowTip = Idea.Util.createSVGElement(this.defs, 'marker', {id: "arrowTip", 
																		  viewBox: "0 0 10 10", 
																		  refX:"0", refY:"5",
																		  markerUnits: "strokeWidth",
																		  markerWidth: "12",
																		  markerHeight: "9",
																		  orient: "auto"});
	Idea.Util.createSVGElement(this.arrowTip, 'path', {d: "M 0 0 L 10 5 L 0 10", fill: "none", stroke:"#c0c0c0", "stroke-linecap":"square", "stroke-linejoin":"round", style:"box-shadow: white;"});

	/*
	// innerShadow/innerGlow filter implementation takes helluva lot of code. Stolen from:
	// https://gist.github.com/archana-s/8947217, which seems to be creatively stolen from:
	// http://www.xanthir.com/b4Yv0
	this.innerGlow = Idea.Util.createSVGElement(this.defs, 'filter', {id: "innerGlow"});
	Idea.Util.createSVGElement(this.innerGlow, 'feGaussianBlur', {stdDeviation:"2", result:"blur"});
	Idea.Util.createSVGElement(this.innerGlow, 'feComposite', {'in2':"SourceAlpha", operator:"arithmetic", k2:"-1", k3:"1", result:"shadow"})
	Idea.Util.createSVGElement(this.innerGlow, 'feFlood', {"flood-color":"rgb(255, 255, 255)", "flood-opacity":"0.75", result:"color"});
	Idea.Util.createSVGElement(this.innerGlow, 'feComposite', {'in2':"shadow", operator:"in"});
	Idea.Util.createSVGElement(this.innerGlow, 'feComposite', {'in2':"SourceGraphic", operator:"over"});
	*/

	// scrollbar's buttons with arrow labels: the arrow's line is invisible, but the marker at the tip is auto-oriented with lines help
	if (this.vertical) {
		this.backwardButton = Idea.Util.createSVGElement(this.scrollbar, 'rect', {x:0, y:0, width:width, height:20, fill:"#31353c"});
		this.backwardArrow = Idea.Util.createSVGElement(this.scrollbar, 'line', {x1:parseInt(width/2), y1:17, x2:parseInt(width/2), y2:16,  "marker-end":"url(#arrowTip)", "stroke-width":"1", stroke:"#6f788a", "stroke-opacity": 0});
		this.forwardButton = Idea.Util.createSVGElement(this.scrollbar, 'rect', {x:0, y:height-20, width:width, height:20, fill:"#31353c"});
		this.forwardArrow = Idea.Util.createSVGElement(this.scrollbar, 'line', {x1:parseInt(width/2), y1:height-17, x2:parseInt(width/2), y2: height-16, "marker-end":"url(#arrowTip)", "stroke-width":"1", stroke:"#6f788a", "stroke-opacity": 0});
		this.trough = Idea.Util.createSVGElement(this.scrollbar, 'g', {});
		this.rail = Idea.Util.createSVGElement(this.trough, 'rect', {x:0, y:20, width:width, height:height-40, fill:"#6f788a"}); // this is the clickable part of scrollbar, where the slider moves
		this.slider = Idea.Util.createSVGElement(this.trough, 'rect', {x:0, y:22, width:width, height:40, fill:"#31353c", stroke:"#808080", rx:"10", ry:"10"}); // this is the draggable slider, which scrolls the element, associated with scrollbar
		// filter:"url(#innerGlow)"		
	}
	else {
		this.backwardButton = Idea.Util.createSVGElement(this.scrollbar, 'rect', {x:0, y:0, width:20, height:height, fill:"#31353c"});
		this.backwardArrow = Idea.Util.createSVGElement(this.scrollbar, 'line', {x1:17, y1:parseInt(height/2), x2:16, y2:parseInt(height/2),  "marker-end":"url(#arrowTip)", "stroke-width":"1", stroke:"#6f788a", "stroke-opacity": 0});
		this.forwardButton = Idea.Util.createSVGElement(this.scrollbar, 'rect', {x:width-20, y:0, width:20, height:height, fill:"#31353c"});
		this.forwardArrow = Idea.Util.createSVGElement(this.scrollbar, 'line', {x1:width-17, y1:parseInt(height/2), x2:width-16, y2:parseInt(height/2), "marker-end":"url(#arrowTip)", "stroke-width":"1", stroke:"#6f788a", "stroke-opacity": 0});
		this.trough = Idea.Util.createSVGElement(this.scrollbar, 'g', {});
		this.rail = Idea.Util.createSVGElement(this.trough, 'rect', {x:20, y:0, width:width-40, height:height, fill:"#6f788a"}); // this is the clickable part of scrollbar, where the slider moves
		this.slider = Idea.Util.createSVGElement(this.trough, 'rect', {x:22, y:0, width:40, height:height, fill:"#31353c", stroke:"#808080", rx:"10", ry:"10"}); // this is the draggable slider, which scrolls the element, associated with scrollbar
		// filter:"url(#innerGlow)"

	}

	this.rail.addEventListener("mousedown", this.railClickHandler.bind(this));
	this.slider.addEventListener("mousedown", this.sliderMouseDownHandler.bind(this));
	this.forwardButton.addEventListener("mousedown", this.forwardButtonMouseDownHandler.bind(this));
	this.backwardButton.addEventListener("mousedown", this.backwardButtonMouseDownHandler.bind(this));
}

Scrollbar.prototype = {
	railClickHandler: function(e){
		e.preventDefault();
		e.stopPropagation();

		var event = Idea.Util.normalizeMouseEvent(e);
		var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.scrollbar);

		var railX = parseInt(this.rail.getAttribute("x"));
		var railY = parseInt(this.rail.getAttribute("y"));
		var railHeight = parseInt(this.rail.getAttribute("height"));		
		var railWidth = parseInt(this.rail.getAttribute("width"));		
		var sliderHeight = parseInt(this.slider.getAttribute("height"));
		var sliderWidth = parseInt(this.slider.getAttribute("width"));

		if (this.vertical){
			if (canvasCoords.y + sliderHeight > railY + railHeight) this.slider.setAttribute("y", railY + railHeight - sliderHeight);
			else this.slider.setAttribute("y", canvasCoords.y);
		}
		else {
			if (canvasCoords.x + sliderWidth > railX + railWidth) this.slider.setAttribute("x", railX + railWidth - sliderWidth);
			else this.slider.setAttribute("x", canvasCoords.x);
		}

		var sliderX = parseInt(this.slider.getAttribute("x"));
		var sliderY = parseInt(this.slider.getAttribute("y"));
		var viewBox = this.scrollable.viewBox();
		if (this.vertical) viewBox.y = parseInt((sliderY - railY) / railHeight * Idea.Conf.canvasHeight - Idea.Conf.canvasHeight/2);
		else viewBox.x = parseInt((sliderX - railX) / railWidth * Idea.Conf.canvasWidth - Idea.Conf.canvasWidth/2);
		this.scrollable.viewBox(viewBox);
	},
	sliderMouseDownHandler: function(e){
		e.preventDefault();
		e.stopPropagation();

		var event = Idea.Util.normalizeMouseEvent(e);
		if (event.which != 1) return; // check that it's left mouse button, else ignore event

		// block scaling
		// block mousewheel

		// check if it is on slider middle or edge - whether we move slider or resize it
		if (true) {// if middle

			// attach mouse handlers to window, not document.documentElement (representing <html>)
			// or mouse events beyond the browser window will be lost
			this._bindedMouseUpHandler = this.sliderDragMouseUpHandler.bind(this);
			this._bindedMouseMoveHandler = this.sliderDragMouseMoveHandler.bind(this);
			window.addEventListener('mouseup', this._bindedMouseUpHandler, false);
			window.addEventListener('mousemove', this._bindedMouseMoveHandler, false);

			// remember the offset of click on the slider so that we know, where the click occurred
			var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.scrollbar);
			if (this.vertical) {
				this.sliderClickOffset = canvasCoords.y - parseInt(this.slider.getAttribute("y")); // WARNING: we assume here that scrollbar wasn't transformed (rotated/shifted etc.)
			}
			else {
				this.sliderClickOffset = canvasCoords.x - parseInt(this.slider.getAttribute("x")); // WARNING: we assume here that scrollbar wasn't transformed (rotated/shifted etc.)
			}
		}
		else { // if edge

		} 
		
	},
	sliderDragMouseMoveHandler: function(e){
		var delta; // difference of slider location relative to click location, all in canvas coordinates

		e.preventDefault();

		var event = Idea.Util.normalizeMouseEvent(e);
		var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.scrollbar);
		//console.log("canvasCoords in MouseMove = " + JSON.stringify(canvasCoords));

		var sliderX = parseInt(this.slider.getAttribute("x"));
		var sliderY = parseInt(this.slider.getAttribute("y"));
		var sliderWidth = parseInt(this.slider.getAttribute("width"));
		var sliderHeight = parseInt(this.slider.getAttribute("height"));
		var railX = parseInt(this.rail.getAttribute("x"));
		var railY = parseInt(this.rail.getAttribute("y"));
		var railWidth = parseInt(this.rail.getAttribute("width"));
		var railHeight = parseInt(this.rail.getAttribute("height"));

		//console.log("sliderX = " + sliderX, "sliderY = " + sliderY, "sliderWidth = " + sliderWidth, "sliderHeight = " + sliderHeight);
		//console.log("railX = " + railX, "railY = " + railY, "railWidth = " + railWidth, "railHeight = " + railHeight);

		// calculate delta
		if (this.vertical) {
			delta = canvasCoords.y - (sliderY + this.sliderClickOffset);
		}
		else {
			delta = canvasCoords.x - (sliderX + this.sliderClickOffset);
		}

		//console.log("delta before boundary = "+  delta);
		//console.log("delta upper boundary = " + (railHeight - (sliderY - railY) - sliderHeight), ", lower boundary = " + (railY - sliderY));

		// if slider reached the beginning or ending of the trough
		if (this.vertical){
			if (delta > railHeight - (sliderY - railY) - sliderHeight) {
				delta = railHeight - (sliderY - railY) - sliderHeight;
			}
			else if (delta < railY - sliderY) {
				delta = railY - sliderY;
			}

			this.slider.setAttribute("y", sliderY + delta); // move slider
		}
		else {
			if (delta > railWidth - (sliderX - railX) - sliderWidth) {
				delta = railWidth - (sliderX - railX) - sliderWidth;
			}
			else if (delta < railX - sliderX){
				delta = railX - sliderX;
			}

			this.slider.setAttribute("x", sliderX + delta); // redraw slider
		}

		var viewBox = this.scrollable.viewBox();
		if (this.vertical) viewBox.y = parseInt((sliderY - railY) / railHeight * Idea.Conf.canvasHeight - Idea.Conf.canvasHeight/2);
		else viewBox.x = parseInt((sliderX - railX) / railWidth * Idea.Conf.canvasWidth - Idea.Conf.canvasWidth/2);
		this.scrollable.viewBox(viewBox);
		//console.log("delta = " + delta);
	},
	sliderDragMouseUpHandler: function(e){
		e.preventDefault();

		if (window.removeEventListener){ // modern browsers use removeEventListener
			window.removeEventListener('mouseup', this._bindedMouseUpHandler);
			window.removeEventListener('mousemove', this._bindedMouseMoveHandler);
		}
		else if (window.detachEvent){ // ie8- use detachEvent
			window.detachEvent('mouseup', this._bindedMouseUpHandler);
			window.detachEvent('mousemove', this._bindedMouseMoveHandler);
		}

		delete this._bindedMouseUpHandler;
		delete this._bindedMouseMoveHandler;
		delete this.sliderClickOffset;

		// TODO unblock scaling
		// TODO unblock mousewheel
	},
	sliderResizeHandler: function(e){},
	scrollableResizeHandler: function(e){},
	forwardButtonMouseDownHandler: function(e){
		e.preventDefault();
		var event = Idea.Util.normalizeMouseEvent(e);
		if (event.which != 1) return; // check that it's left mouse button, else ignore event
		// change appearance
		// block mousewheel

		// button should continue scrolling, while you press the mouse button and keep pointer over it
		this._bindedForwardButtonMouseUpHandler = this.forwardButtonMouseUpHandler.bind(this);
		this._bindedForwardButtonMouseEnterHandler = this.forwardButtonMouseEnterHandler.bind(this);
		this._bindedForwardButtonMouseOutHandler = this.forwardButtonMouseOutHandler.bind(this);

		window.addEventListener('mouseup', this._bindedForwardButtonMouseUpHandler, false);
		this.forwardButton.addEventListener('mouseenter', this._bindedForwardButtonMouseEnterHandler, false);
		this.forwardButton.addEventListener('mouseout', this._bindedForwardButtonMouseOutHandler, false);

		this.scrollForward();
		this.scrollForwardInterval = setInterval(this.scrollForward.bind(this), 50);
	},
	forwardButtonMouseOutHandler: function(e){
		clearInterval(this.scrollForwardInterval);
		delete this.scrollForwardInterval;
	},
	forwardButtonMouseEnterHandler: function(e){
		this.scrollForwardInterval = setInterval(this.scrollForward.bind(this), 50);
	},	
	forwardButtonMouseUpHandler: function(e){
		clearInterval(this.scrollForwardInterval);
		delete this.scrollForwardInterval;
		// unblock mousewheel
		// change appearance

		if (window.removeEventListener){ // modern browsers use removeEventListener
			window.removeEventListener('mouseup', this._bindedForwardButtonMouseUpHandler);
			this.forwardButton.removeEventListener('mouseenter', this._bindedForwardButtonMouseEnterHandler);
			this.forwardButton.removeEventListener('mouseout', this._bindedForwardButtonMouseOutHandler);
		}
		else if (window.detachEvent){ // ie8- use detachEvent
			window.detachEvent('mouseup', this._bindedForwardButtonMouseUpHandler);
			this.forwardButton.detachEvent('mouseenter', this._bindedForwardButtonMouseEnterHandler);
			this.forwardButton.detachEvent('mouseout', this._bindedForwardButtonMouseOutHandler);
		}

		delete this._bindedForwardButtonMouseUpHandler;
		delete this._bindedForwardButtonMouseOutHandler;
		delete this._bindedForwardButtonMouseEnterHandler;
	},
	backwardButtonMouseDownHandler: function(e){
		e.preventDefault();
		var event = Idea.Util.normalizeMouseEvent(e);
		if (event.which != 1) return; // check that it's left mouse button, else ignore event
		// change appearance
		// block mousewheel

		// button should continue scrolling, while you press the mouse button and keep pointer over it
		this._bindedBackwardButtonMouseUpHandler = this.backwardButtonMouseUpHandler.bind(this);
		this._bindedBackwardButtonMouseEnterHandler = this.backwardButtonMouseEnterHandler.bind(this);
		this._bindedBackwardButtonMouseOutHandler = this.backwardButtonMouseOutHandler.bind(this);

		window.addEventListener('mouseup', this._bindedBackwardButtonMouseUpHandler, false);
		this.backwardButton.addEventListener('mouseenter', this._bindedBackwardButtonMouseEnterHandler, false);
		this.backwardButton.addEventListener('mouseout', this._bindedBackwardButtonMouseOutHandler, false);

		this.scrollBackward();
		this.scrollBackwardInterval = setInterval(this.scrollBackward.bind(this), 50);

	},
	backwardButtonMouseOutHandler: function(e){
		clearInterval(this.scrollBackwardInterval);
		delete this.scrollForwardInterval;
	},
	backwardButtonMouseEnterHandler: function(e){
		this.scrollForwardInterval = setInterval(this.scrollBackward.bind(this), 50);
	},
	backwardButtonMouseUpHandler: function(e){
		clearInterval(this.scrollBackwardInterval);
		delete this.scrollBackwardInterval;
		// unblock mousewheel
		// change appearance

		if (window.removeEventListener){ // modern browsers use removeEventListener
			window.removeEventListener('mouseup', this._bindedBackwardButtonMouseUpHandler);
			this.backwardButton.removeEventListener('mouseenter', this._bindedBackwardButtonMouseEnterHandler);
			this.backwardButton.removeEventListener('mouseout', this._bindedBackwardButtonMouseOutHandler);
		}
		else if (window.detachEvent){ // ie8- use detachEvent
			window.detachEvent('mouseup', this._bindedBackwardButtonMouseUpHandler);
			this.backwardButton.detachEvent('mouseenter', this._bindedBackwardButtonMouseEnterHandler);
			this.backwardButton.detachEvent('mouseout', this._bindedBackwardButtonMouseOutHandler);
		}

		delete this._bindedBackwardButtonMouseUpHandler;
		delete this._bindedBackwardButtonMouseOutHandler;
		delete this._bindedBackwardButtonMouseEnterHandler;
	},
	pageBackwardEvent: new CustomEvent("pageBackward", {detail: {}, bubbles: true, cancelable: true}),
	pageForwardEvent: new CustomEvent("pageForward", {detail: {}, bubbles: true, cancelable: true}),
	scrollForwardEvent: new CustomEvent("scrollForward", {detail: {}, bubbles: true, cancelable: true}),
	scrollBackwardEvent: new CustomEvent("scrollBackward", {detail: {}, bubbles: true, cancelable: true}),
	scrollToEvent: new CustomEvent("scrollTo", {detail: {to:0.0-1.0}, bubbles: true, cancelable: true}),
	extendSliderEvent: new CustomEvent("extendSlide", {detail: {}, bubbles: true, cancelable: true}),
	contractSliderEvent: new CustomEvent("contractSlider", {detail: {}, bubbles: true, cancelable: true}),
	// we should also listen to zoom-in/zoom-out events of the scrollable area
	scrollForward: function(){
		var sliderX = parseInt(this.slider.getAttribute("x"));
		var sliderY = parseInt(this.slider.getAttribute("y"));
		var sliderWidth = parseInt(this.slider.getAttribute("width"));
		var sliderHeight = parseInt(this.slider.getAttribute("height"));
		var railX = parseInt(this.rail.getAttribute("x"));
		var railY = parseInt(this.rail.getAttribute("y"));		
		var railWidth = parseInt(this.rail.getAttribute("width"));
		var railHeight = parseInt(this.rail.getAttribute("height"));		

		if (this.vertical){
			if (sliderY - railY + sliderHeight + this.scrollSize > railHeight) this.slider.setAttribute("y", railY + railHeight - sliderHeight);
			else this.slider.setAttribute("y", sliderY + this.scrollSize); // move slider
		}
		else {
			if (sliderX - railX + sliderWidth + this.scrollSize > railWidth) this.slider.setAttribute("x", railX + railWidth - sliderWidth);
			else this.slider.setAttribute("x", sliderX + this.scrollSize); // move slider
		}

		var viewBox = this.scrollable.viewBox();
		if (this.vertical) viewBox.y = viewBox.y + this.scrollSize;
		else viewBox.x = viewBox.x + this.scrollSize;
		this.scrollable.viewBox(viewBox);
	},
	scrollBackward: function(){
		var sliderX = parseInt(this.slider.getAttribute("x"));
		var sliderY = parseInt(this.slider.getAttribute("y"));
		var railX = parseInt(this.rail.getAttribute("x"));
		var railY = parseInt(this.rail.getAttribute("y"));

		if (this.vertical){
			if (sliderY - railY - this.scrollSize < 0) this.slider.setAttribute("y", railY);
			else this.slider.setAttribute("y", sliderY - this.scrollSize); // move slider
		}
		else {
			if (sliderX - railX - this.scrollSize < 0) this.slider.setAttribute("x", railX);
			else this.slider.setAttribute("x", sliderX - this.scrollSize); // move slider
		}

		var viewBox = this.scrollable.viewBox();
		if (this.vertical) viewBox.y = viewBox.y - this.scrollSize;
		else viewBox.x = viewBox.x - this.scrollSize;
		this.scrollable.viewBox(viewBox);
	},
	pageForward: function(){},
	pageBackward: function(){},
};

Idea.prototype.Scrollbar = Scrollbar;
})();