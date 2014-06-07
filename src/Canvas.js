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

        this.rect = Idea.Util.createSVGElement(this._canvas, 'rect', {
            "x": 10,
            "y": 10,
            "width": 50,
            "height": 50,
        });

        //this.rect = document.createElement('rect');
        //this.rect.setAttribute("x", 10);
        //this.rect.setAttribute("y", 10);
        //this.rect.setAttribute("width", 50);
        //this.rect.setAttribute("height", 30);
        this.rect.style.stroke = "black";
        this.rect.style.fill = "none";
        //this._canvas.appendChild(this.rect);

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
            if (width === undefined){return this._canvas.width;}
            else {this._canvas.width = width;}
        },

        height: function(height){
            if (height === undefined){return this._canvas.height;}
            else {this._canvas.height = height;}
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
            event = event || window.event // "|| window.event" for  cross-IEness
            this._propagateEventToWidgets(event);
        },
        dblclick: function(event){
            event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
        mousedown: function(event){
            event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
        mousemove: function(event){
            event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
        mouseout: function(event){
            event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
        mouseover: function(event){
            event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
        mouseup: function(event){
            event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },

        keydown: function(event) {
            event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
        keypress: function(event){
            event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
        keyup: function(event){
            event = event || window.event //cross-IEness
            this._propagateEventToWidgets(event);
        },
    };
})();
