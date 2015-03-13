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
        //create the canvas itself, set its attributes and insert it into div    
        this._canvas = document.createElementNS(Idea.Util.SVGNS, 'svg');

        //this._canvas.setAttribute("version", "1.1")
        //this._canvas.setAttribute("xmlns", Idea.Util.SVGNS);
        this.width(Idea.Conf.defaultViewportWidth);
        this.height(Idea.Conf.defaultViewportHeight);

        //check if width/height is set and define the size and location of viewBox
        var x = 0;
        var y = 0;        
        if ((width === undefined) || (height === undefined)) {
            width = Idea.Conf.defaultViewportWidth;
            height = Idea.Conf.defaultViewportHeight;
        }
        this.viewBox({x:x, y:y, width:width, height:height});

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
                viewBoxAttribute = this._canvas.getAttributeNS(null, 'viewBox');
                dimensions = viewBox.split(" ");
                dimensions.forEach(function(element, index, array){array[index] = parseInt(element);});
                viewBox = {x: dimensions[0], y: dimensions[1], width: dimensions[2], height: dimensions[3]};
                return viewBox;
            }
            else {
                for (var key in viewBox) Idea.Util.uintValidator(viewBox[key]);
                viewBoxAttribute = viewBox.x + " " + viewBox.y + " " + viewBox.width + " " + viewBox.height;
                this._canvas.setAttributeNS(Idea.Util.SVGNS, "viewBox", viewBoxAttribute);
            }
        }
    };
})();
