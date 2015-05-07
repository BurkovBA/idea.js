/*
 * Canvas is a flat area, and user looks
 * at it through a viewport (part of browser window), while
 * the part of canvas under the viewport is called viewBox.
 * Viewport can zoom in and out. Its size is specified as an input
 * parameter to idea.Canvas. Theoretically canvas could've been infinite,
 * but it's inconvenient to work with infinite canvas, cause we don't
 * know the proportion of viewBox to the whole canvas, which should
 * be reflected by proportion of scrollbar's slider to whole scrollbar.
 * Thus, we set arbitrary values for canvas size in Conf.js.
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
        this.idea = idea;
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
        Idea.Util.createSVGElement(this.smallGridPattern, 'path', {d:"M 8 0 L 0 0 0 8", fill:"none", stroke:"#e0e0e0", "stroke-width":"0.5"});
        this.gridPattern = Idea.Util.createSVGElement(this.defs, 'pattern', {id:"gridPattern",
                                                                       width: "80",
                                                                       height: "80",
                                                                       patternUnits: "userSpaceOnUse"});
        Idea.Util.createSVGElement(this.gridPattern, 'rect', {width:"80", height:"80", fill:"url(#smallGridPattern)"});
        Idea.Util.createSVGElement(this.gridPattern, 'path', {d:"M 80 0 L 0 0 0 80", fill:"none", stroke: "#e0e0e0", "stroke-width": "1"});

        //this.grid = Idea.Util.createSVGElement(this._canvas, 'rect', {width:"100%", height: "100%", fill:"url(#gridPattern)"});
        this.grid = Idea.Util.createSVGElement(this._canvas, 'rect', {x:Idea.Conf.canvasMinX, y:Idea.Conf.canvasMinY, width:(Idea.Conf.canvasMaxX - Idea.Conf.canvasMinX), height:(Idea.Conf.canvasMaxY - Idea.Conf.canvasMinY), fill:"url(#gridPattern)"});

        // TODO REMOVE THIS IT'S A TEST
        this.rect = Idea.Util.createSVGElement(this._canvas, 'rect', {
            "x": 10,
            "y": 10,
            "width": 50,
            "height": 50,
        });
        this.rect.style.stroke = "black";
        this.rect.style.fill = "none";

        var text = Idea.Util.createSVGElement(this._canvas, 'text', {
            "x":0, "y":0, "fill": '#000'
        });
        var textNode = document.createTextNode("(0, 0)");
        text.appendChild(textNode);

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
            }
            else {
                for (var key in viewBox) Idea.Validators.intValidator(viewBox[key], "viewBox." + key);
                viewBoxAttribute = viewBox.x + " " + viewBox.y + " " + viewBox.width + " " + viewBox.height;
                this._canvas.setAttribute("viewBox", viewBoxAttribute);  //this._canvas.setAttributeNS(Idea.Util.SVGNS, "viewBox", viewBoxAttribute);
            }
            return viewBox;            
        }
    };
})();
