(function(){
    var x1GetterSetter = Idea.Util.intGetterSetter("x1");
    var y1GetterSetter = Idea.Util.intGetterSetter("y1");
    var x2GetterSetter = Idea.Util.intGetterSetter("x2");
    var y2GetterSetter = Idea.Util.intGetterSetter("y2");
    var strokeGetterSetter = Idea.Util.colorGetterSetter("stroke");
    var strokeWidthGetterSetter = Idea.Util.uintGetterSetter("strokeWidth");

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
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @param stroke
     * @param strokeWidth
     * @param baseMarker see tipMarker.
     * @param tipMarker  arbitrary markers that represent base and tip of 
     *                    line (if not specified, Triangles will be 
     *                    created and used by default).
     */

    var Line = function(owner, father, x1, y1, x2, y2, stroke, strokeWidth, baseMarker, tipMarker){
        // TODO allow to use other widgets dock points to be used 
        // as base and tip instead of just coordinates. Then line will
        // stick to widgets.
        x1GetterSetter.call(this, x1);
        y1GetterSetter.call(this, y1);
        x2GetterSetter.call(this, x2);
        y2GetterSetter.call(this, y2);

        if (stroke === undefined) strokeGetterSetter.call(this, "#AAAAAA");
        else strokeGetterSetter.call(this, stroke);        

        if (strokeWidth === undefined) strokeWidthGetterSetter.call(this, 1);
        else strokeWidthGetterSetter.call(this, strokeWidth);

        if (baseMarker === undefined) this._baseMarker = null;
        else baseMarkerGetterSetter.call(this, baseMarker);

        if (tipMarker === undefined) this._tipMarker = null;
        else tipMarkerGetterSetter.call(this, tipMarker);

        //draw primitives
        this.father = father;

        this._group = Idea.Util.createSVGElement(this.father, 'g', {});
        this._drawing = Idea.Util.createSVGElement(this._group, 'line', {
            "x1": this.x1(),
            "y1": this.y1(),
            "x2": this.x2(),
            "y2": this.y2(),
            "stroke": this.stroke(),
            "stroke-width": this.strokeWidth()
        });
        this._drawing.style.stroke = this._color;
        this._drawing.style['stroke-width'] = this.width;

        Idea.Util.observe(this, "x1", function(newValue, oldValue){this._drawing.setAttribute("x1", newValue);}.bind(this));
        Idea.Util.observe(this, "y1", function(newValue, oldValue){this._drawing.setAttribute("y1", newValue);}.bind(this));
        Idea.Util.observe(this, "x2", function(newValue, oldValue){this._drawing.setAttribute("x2", newValue);}.bind(this));
        Idea.Util.observe(this, "y2", function(newValue, oldValue){this._drawing.setAttribute("y2", newValue);}.bind(this));
        Idea.Util.observe(this, "stroke", function(newValue, oldValue){this._drawing.setAttribute("stroke", newValue);}.bind(this));
        Idea.Util.observe(this, "strokeWidth", function(newValue, oldValue){this._drawing.setAttribute("stroke-width", newValue);}.bind(this));

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
        this._new = new Line(this, this.canvas._canvas, canvasCoords.x, canvasCoords.y, canvasCoords.x, canvasCoords.y, "#000000", 1);

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
        this._new.x2(canvasCoords.x);
        this._new.y2(canvasCoords.y);
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
        x1: x1GetterSetter, 
        y1: y1GetterSetter,
        x2: x2GetterSetter,
        y2: y2GetterSetter,
        stroke: strokeGetterSetter,
        strokeWidth: strokeWidthGetterSetter,
        baseMarker: baseMarkerGetterSetter,
        tipMarker: tipMarkerGetterSetter,
        iconHandlers: iconHandlers,
        iconLabel: iconLabel,
    });

    Idea.Line = Line;
    Idea.ObjectsRegistry["Basic"].push(Line);
})();
