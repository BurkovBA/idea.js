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
