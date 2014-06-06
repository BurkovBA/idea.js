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
        //this._canvas.setAttributeNS(Idea.UTIL.SVGNS, "viewBox", viewbox);

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
