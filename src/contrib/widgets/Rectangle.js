(function(){
    var xGetterSetter = Idea.Util.getterSetter("x", Idea.Util.intValidator, null);
    var yGetterSetter = Idea.Util.getterSetter("y", Idea.Util.intValidator, null);
    var widthGetterSetter = Idea.Util.getterSetter("width", Idea.Util.intValidator, null);
    var heightGetterSetter = Idea.Util.getterSetter("height", Idea.Util.intValidator, null);
    var rxGetterSetter = Idea.Util.getterSetter("rx", Idea.Util.uintValidator, null);
    var ryGetterSetter = Idea.Util.getterSetter("ry", Idea.Util.uintValidator, null);
    var strokeGetterSetter = Idea.Util.getterSetter("stroke", Idea.Util.colorValidator, null);
    var fillGetterSetter = Idea.Util.getterSetter("fill", Idea.Util.colorValidator, null);

    /*
     * Simple rectangle with content and/or with rounded corners.
     *
     * @param owner        Idea.Canvas.Slide or its child that contains the rectangle
     * @param father       Util.Widget, parental to Rectangle, or Util.Canvas,
     *                     if Rectangle doesn't have a parent and is drawn right
     *                     on the canvas.
     * @param x            x coordinate of top-left corner of the rectangle
     * @param y            y coordinate of top-left corner of the rectangle
     * @param width        width of rectangle
     * @param height       height of rectangle
     * @param rx           x-axis radius of corners
     * @param ry           y-axis radius of corners
     * @param stroke       set of stroke attributes.
     * @param fill         set of fill attributes.
     * @param content
     */
    var Rectangle = function(owner, father, x, y, width, height, rx, ry, stroke, fill) {
        Idea.Widget.call(this);

        if (x === undefined) xGetterSetter.call(this, 1);
        else xGetterSetter.call(this, x);

        if (y === undefined) yGetterSetter.call(this, 1);
        else yGetterSetter.call(this, y);

        if (width === undefined) widthGetterSetter.call(this, 1);
        else widthGetterSetter.call(this, width);

        if (height === undefined) heightGetterSetter.call(this, 1);
        else heightGetterSetter.call(this, height);

        if (rx === undefined) rxGetterSetter.call(this, 0);
        else rxGetterSetter.call(this, rx);

        if (ry === undefined) ryGetterSetter.call(this, 0);
        else ryGetterSetter.call(this, ry);

        if (stroke !== undefined) strokeGetterSetter.call(this, stroke);
        else strokeGetterSetter.call(this, "#000000");

        if (fill !== undefined) fillGetterSetter.call(this, fill);
        else strokeGetterSetter.call(this, "#000000");

        this.father = father;

        //draw primitives
        this._group = Idea.Util.createSVGElement(this.father, 'g', {});
        this._drawing = Idea.Util.createSVGElement(this._group, 'rect', {
            "x": this.x(),
            "y": this.y(),
            "width": this.width(),
            "height": this.height(),
            "rx": this.rx(),
            "ry": this.ry(),
            "storke": this.stroke(),
            "fill": this.fill()
        });

        Idea.Util.observe(this, "x", function(newValue, oldValue){this._drawing.setAttribute("x", newValue);}.bind(this));
        Idea.Util.observe(this, "y", function(newValue, oldValue){this._drawing.setAttribute("y", newValue);}.bind(this));
        Idea.Util.observe(this, "width", function(newValue, oldValue){this._drawing.setAttribute("width", newValue);}.bind(this));
        Idea.Util.observe(this, "height", function(newValue, oldValue){this._drawing.setAttribute("height", newValue);}.bind(this));
        Idea.Util.observe(this, "rx", function(newValue, oldValue){this._drawing.setAttribute("rx", newValue);}.bind(this));
        Idea.Util.observe(this, "ry", function(newValue, oldValue){this._drawing.setAttribute("ry", newValue);}.bind(this));
        Idea.Util.observe(this, "stroke", function(newValue, oldValue){this._drawing.setAttribute("stroke", newValue);}.bind(this));
        Idea.Util.observe(this, "fill", function(newValue, oldValue){this._drawing.setAttribute("fill", newValue);}.bind(this));

        //this._drawing.style.stroke = this._color;
        //this._drawing.style['stroke-width'] = this.width;
    };

    /*
     * EVENT HANDLERS section. All the functions below should be bound to idea object, so that
     * "this" in them is idea object:
     *
     * Idea.Util.addEventListener(this.canvas._canvas, "click", baseMouseClick, false, this, []);
     */

    var upperLeftMouseClick = function(e){
        // create a rect and mousemove listener
        var event = Idea.Util.normalizeMouseEvent(e);
        var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.canvas._canvas);

        // draw the base on canvas
        this._new = new Rectangle(this, this.canvas._canvas, canvasCoords.x, canvasCoords.y, 0, 0, 0, 0, '#000000');

        // remove this listener and add mouseover, mouseclick and keydown handlers
        Idea.Util.removeEventListener(this.canvas._canvas, "click", upperLeftMouseClick, false, this, []);        

        Idea.Util.addEventListener(window, "keypress", keyDown, false, this, []);
        Idea.Util.addEventListener(window, "keydown", keyDown, false, this, []);

        Idea.Util.addEventListener(this.canvas._canvas, "mousemove", lowerRightMouseMove, false, this, []);
        Idea.Util.addEventListener(this.canvas._canvas, "click", lowerRightMouseClick, false, this, []);
    };

    var returnFromRectCreation = function(){
        // remove creation listeners
        Idea.Util.removeEventListener(window, "keypress", keyDown, false, this, []);
        Idea.Util.removeEventListener(window, "keydown", keyDown, false, this, []);

        Idea.Util.removeEventListener(this.canvas._canvas, "mousemove", lowerRightMouseMove, false, this, []);
        Idea.Util.removeEventListener(this.canvas._canvas, "click", lowerRightMouseClick, false, this, []);

        // untoggle the line creation button
        this.icon.toggle();

        // switch from creation mode back to edit mode
        this.mode('edit');

        // delete this._new that contained just created widget
        delete this._new;
    };

    var lowerRightMouseMove = function(e){
        var event = Idea.Util.normalizeMouseEvent(e);
        var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.canvas._canvas);
        this._new.width(canvasCoords.x - this._new.x());
        this._new.height(canvasCoords.y - this._new.y());
    };

    var lowerRightMouseClick = function(e){
        this.layers.push(this._new);
        returnFromRectCreation.bind(this)();
    };

    var keyDown = function(e){
        var event = Idea.Util.normalizeKeyboardEvent(e);
        if (event == null) return; // just ignore this event, if it should be ignored
        if (event.type == "keydown" && event.keyCode == 27) { // if this is keydown event on Escape key, destroy this Widget and return to edit mode
            this._new.destroy();
            returnFromRectCreation.bind(this)();
        }
    };

    /*
     * END OF EVENT HANDLERS
     */

    var iconLabel = Idea.Util.createSVGElement(null, 'svg', {width: Idea.Conf.objectIconWidth, height: Idea.Conf.objectIconHeight});
    var rect = Idea.Util.createSVGElement(iconLabel, 'rect', {x: parseInt(Idea.Conf.objectIconWidth/10), y: parseInt(Idea.Conf.objectIconHeight/10), width: parseInt(Idea.Conf.objectIconWidth*8/10), height: parseInt(Idea.Conf.objectIconHeight*8/10), stroke: "#AAAAAA", fill:"#CCCCCC"});
    var iconHandlers = [["click", upperLeftMouseClick, false]];

    Idea.Util.extend(Rectangle, Idea.Widget);
    Idea.Util.addAttrsToPrototype(Rectangle, {
        x: xGetterSetter,
        y: yGetterSetter,
        width: widthGetterSetter,
        height: heightGetterSetter,
        rx: rxGetterSetter,
        ry: ryGetterSetter,
        stroke: strokeGetterSetter,
        fill: fillGetterSetter,
        iconHandlers: iconHandlers,
        iconLabel: iconLabel
    });

    Idea.Rectangle = Rectangle;
    Idea.ObjectsRegistry["Basic"].push(Rectangle);


})();
