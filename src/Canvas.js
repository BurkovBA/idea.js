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
        this._grip.style.width = 16;
        this._grip.style.height = 16;
        this._grip.style.display = "inline-block";
        this._grip.style.background = "#AAAAAA";
        this._grip.style.float = "right";
        this._div.appendChild(this._grip);
        //see this for explaination of code below:
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
            }
        }.bind(this);
        this._grip.onmouseup = function(event){
            var event = event || window.event;
            var which = event.which ? event.which :
                event.button === 1 ? 1 :
                event.button === 2 ? 3 : 
                event.button === 4 ? 2 : 1;
            if (which == 1) {this._grip_pressed = false;}
        }.bind(this);
        this._grip.onmousemove = function(event){
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
        this._grip.onmouseover = function(event){
            var event = event || window.event;
            this.style.cursor = "nw-resize";
        };
        //create clear
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
