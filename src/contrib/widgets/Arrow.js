(function(){
    /*
     * Straight arrow
     *
     * @param width       width of arrow line, defaults to 1px.
     * @param color       color of arrow, defaults to black.
     * @param base        coordinates of arrow's base, e.g.{x:42, y:42}.
     * @param tip         coordinates of arrow's tip, e.g. {x:42, y:42}.
     * @param base_widget see tip_widget.
     * @param tip_widget  arbitrary widgets that represent base and tip of 
     *                    arrow (if not specified, Triangles will be 
     *                    created and used by default).
     */
    Idea.Arrow = function(width, color, base, tip, base_widget, tip_widget){
        if (width === undefined) {this._width = 1;}
        else {this._width = width;}
        if (color === undefined) {this._color = color;}
        else {this._color = color;}
        //TODO allow to use other widgets dock points to be used 
        // as base and tip instead of just coordinates. Then arrow will
        // stick to widgets.
        this._base = base;
        this._tip = tip;
        if (base_widget === undefined) {this._base_widget = new Triangle();}
        else {this._base = base_widget;}
        if (tip_widget === undefined) {this._tip_widget = new Triangle();}
        else {this._tip = tip_widget;}
    };

    Idea.Util.extend(Idea.Arrow, Idea.Widget);
    Idea.Util.addAttrsToPrototype(Idea.Arrow, {
        width: function(width){
            if (width === undefined) {return this._width;}
            else {
                if (Idea.INTREGEX.test(width)) {this._width = width;}
                else {throw new Error("Width should be int, got: '" + width + "'!");}
            }
        },
        color: function(color){
            if (color === undefined) {return this._color;}
            else {
                if (Idea.isHexColor(color)){ this._color = color;}
                else {
                    throw new Error("Color should be a valid color string, e.g #ACDC66, got: '" + color + "'!")};
            }
        },
        base: function(base){
            if (base === undefiend) {return this._base}
            else {
                if (base.hasattribute("x") && INTREGEX.test(base.x) && base.hasattribute("y") && INTREGEX.test(base.y)){
                    this._base = base;
                }//TODO TEST CANVAS SIZE
            }
        },
        tip: function(tip){
            if (tip === undefined) {return this._tip}
            else {
                if (tip.hasattribute("x") && INTREGEX.test(tip.x) && tip.hasattribute("y") && INTREGEX.test(tip.y)){
                    this._tip = tip;
                }//TODO TEST CANVAS SIZE
               
            }
        },
        base_widget: function(widget){
            if (widget === undefined) {return this._base_widget;}
            else {
                if (widget instanceof Idea.Widget) {this._base_widget = widget;}
                else {throw new Error("Expected widget as base_widget, got:'" +typeof widget + "'");}
            }
        },
        tip_widget: function(widget){
            if (widget === undefined) {return this._tip_widget;}
            else {
                if (widget instanceof Idea.Widget) {this._tip_widget = widget;}
                else {throw new Error("Expected widget as tip_widget, got:'" +typeof widget + "'");}
            }
        },
        accepts_event: function(evt){
            if (Idea.MOUSE_EVENTS.contains(evt.type)){
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
