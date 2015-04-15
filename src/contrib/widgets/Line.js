(function(){

    var widthGetterSetter = Idea.Util.uintGetterSetter("width");
    var colorGetterSetter = Idea.Util.colorGetterSetter("color");
    var baseGetterSetter = function(base){
        if (base === undefined) {return this._base}
        else {
            if (base.hasOwnProperty("x") && Idea.Util.INTREGEX.test(base.x) && base.hasOwnProperty("y") && Idea.Util.INTREGEX.test(base.y)){
                this._base = base;

                // draw changes
                if (this._drawing){
                    this._drawing.setAttribute("x1", base.x);
                    this._drawing.setAttribute("y1", base.y);
                }
            }//TODO TEST CANVAS SIZE
            else {
                throw Error("Wrong line base =" + JSON.stringify(base));
            }            
        }
    };
    var tipGetterSetter = function(tip){
        if (tip === undefined) {return this._tip}
        else {
            if (tip.hasOwnProperty("x") && Idea.Util.INTREGEX.test(tip.x) && tip.hasOwnProperty("y") && Idea.Util.INTREGEX.test(tip.y)){
                this._tip = tip;

                // draw changes
                if (this._drawing){
                    this._drawing.setAttribute("x2", tip.x);
                    this._drawing.setAttribute("y2", tip.y);
                }
            }//TODO TEST CANVAS SIZE
            else {
                throw Error("Wrong line tip = " + JSON.stringify(tip));
            }
        }
    };
    var baseMarkerGetterSetter = Idea.Util.widgetGetterSetter("baseMarker");
    var tipMarkerGetterSetter = Idea.Util.widgetGetterSetter("tipMarker");

    /*
     * Straight line
     *
     * @memberof Idea
     * @constructor
     * @param owner       Idea.Canvas.Slide or its child widget that contains
                          the line.
     * @param father      Util.Widget, parental to Line, or Canvas,
     *                    if Line doesn't have a parent and is drawn right
                          on the canvas.
     * @param width       width of line, defaults to 1px.
     * @param color       color of line, defaults to black.
     * @param base        coordinates of line's base, e.g.{x:42, y:42}.
     * @param tip         coordinates of line's tip, e.g. {x:42, y:42}.
     * @param baseMarker see tipMarker.
     * @param tipMarker  arbitrary markers that represent base and tip of 
     *                    line (if not specified, Triangles will be 
     *                    created and used by default).
     */

    var Line = function(owner, father, width, color, base, tip, baseMarker, tipMarker){
        if (width === undefined) widthGetterSetter.call(this, 1);
        else widthGetterSetter.call(this, width);

        if (color === undefined) colorGetterSetter.call(this, "#AAAAAA");
        else colorGetterSetter.call(this, color);

        // TODO allow to use other widgets dock points to be used 
        // as base and tip instead of just coordinates. Then line will
        // stick to widgets.

        if (base === undefined) throw new Error("Line's base coordinates undefined!");
        else baseGetterSetter.call(this, base);

        if (tip === undefined) throw new Error("Line's tip coordinates undefined!");
        else tipGetterSetter.call(this, tip);

        if (baseMarker === undefined) this._baseMarker = null;
        else baseMarkerGetterSetter.call(this, baseMarker);

        if (tipMarker === undefined) this._tipMarker = null;
        else tipMarkerGetterSetter.call(this, tipMarker);

        //draw primitives
        this.father = father;

        this._group = Idea.Util.createSVGElement(this.father, 'g', {});
        this._drawing = Idea.Util.createSVGElement(this._group, 'line', {
            "x1": this._base.x,
            "y1": this._base.y,
            "x2": this._tip.x,
            "y2": this._tip.y
        });
        this._drawing.style.stroke = this._color;
        this._drawing.style['stroke-width'] = this.width;
    };

    /*
     * EVENT HANDLERS section. All the functions below should be bound to idea object, so that
     * "this" in them is idea object:
     *
     * idea.canvas.addEventListener("click", baseMouseClick.bind(idea), false)
     */

    var baseMouseClick = function(e){
        console.log("baseMouseClick called");

        // create a point and mousemove listener
        var event = Idea.Util.normalizeMouseEvent(e);
        var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.canvas._canvas);

        // draw the base on canvas
        this._new = new Line(this, this.canvas._canvas, 1, "#000000", canvasCoords, canvasCoords);

        // remove this listener and add mouseover, mouseclick and keydown handlers
        this.canvas.removeEventListener("click", baseMouseClick, false, true);

        this._bindedTipKeyDown = tipKeyDown.bind(this);
        window.addEventListener("keypress", this._bindedTipKeyDown)
        window.addEventListener("keydown", this._bindedTipKeyDown);

        this.canvas.addEventListener("mousemove", tipMouseMove, false, true);
        this.canvas.addEventListener("click", tipMouseClick, false, true);
    };

    var returnFromLineCreation = function(){
        // remove creation listeners
        window.removeEventListener("keypress", this._bindedTipKeyDown);
        window.removeEventListener("keydown", this._bindedTipKeyDown);
        delete this._bindedTipKeyDown;

        this.canvas.removeEventListener("mousemove", tipMouseMove, false, true);
        this.canvas.removeEventListener("click", tipMouseClick, false, true);

        // untoggle the line creation button
        this.icon.toggle();

        // switch from creation mode back to edit mode
        this.mode('edit');

        // delete this._new that contained just created widget
        delete this._new;
    };

    var tipMouseMove = function(e){
        var event = Idea.Util.normalizeMouseEvent(e);
        var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.canvas._canvas);
        //console.log("event.clientX = ", event.clientX, "event.clientY = ", event.clientY);        
        //console.log("canvas coords relative to this.canvas._canvas = ", canvasCoords);
        this._new.tip(canvasCoords);
    };

    var tipKeyDown = function(e){
        var event = Idea.Util.normalizeKeyboardEvent(e);
        if (event == null) return; // just ignore this event, if it should be ignored
        if (event.type == "keydown" && event.keyCode == 27) { // if this is keydown event on Escape key, destroy this Line and return to edit mode
            this._new.destroy();
            returnFromLineCreation.bind(this)();
        }
    };

    var tipMouseClick = function(e){
        this.layers.push(this._new);
        returnFromLineCreation.bind(this)();
    };

    /*
     * END OF EVENT HANDLERS
     */

    var iconLabel = Idea.Util.createSVGElement(null, 'svg', {width: Idea.Conf.objectIconWidth, height: Idea.Conf.objectIconHeight});
    var line = Idea.Util.createSVGElement(iconLabel, 'line', {x1: parseInt(Idea.Conf.objectIconWidth/10), y1: parseInt(Idea.Conf.objectIconHeight/10), x2: parseInt(Idea.Conf.objectIconWidth*9/10), y2: parseInt(Idea.Conf.objectIconHeight*9/10), stroke: "#AAAAAA"});
    var iconHandlers = [["click", baseMouseClick, false]];

    Idea.Util.extend(Line, Idea.Widget);
    Idea.Util.addAttrsToPrototype(Line, {
        width: widthGetterSetter, 
        color: colorGetterSetter,
        base: baseGetterSetter,
        tip: tipGetterSetter,
        baseMarker: baseMarkerGetterSetter,
        tipMarker: tipMarkerGetterSetter,
        iconHandlers: iconHandlers,
        iconLabel: iconLabel,
    });

    Idea.Line = Line;
    Idea.ObjectsRegistry["Basic"].push(Line);
})();
