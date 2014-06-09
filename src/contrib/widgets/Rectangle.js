(function(){
    var xGetterSetter = Idea.Util.uintGetterSetter("x");
    var yGetterSetter = Idea.Util.uintGetterSetter("y");
    var widthGetterSetter = Idea.Util.uintGetterSetter("width");
    var heightGetterSetter = Idea.Util.uintGetterSetter("height");
    var rxGetterSetter = Idea.Util.uintGetterSetter("rx");
    var ryGetterSetter = Idea.Util.uintGetterSetter("ry");


    /*
     * Simple rectangle with content and/or with rounded corners.
     *
     * @param father       Util.Widget, parental to Rectangle, or Util.Canvas,
     *                     if Rectangle doesn't have a parent and is drawn right
     *                     on the canvas.
     * @param x            x coordinate of top-left corner of the rectangle
     * @param y            y coordinate of top-left corner of the rectangle
     * @param width        width of the rectangle
     * @param height       height of the rectangle
     * @param rx           x-axis radius of corners
     * @param ry           y-axis radius of corners
     * @param stroke       set of stroke attributes.
     * @param fill         set of fill attributes.
     * @param content
     */
    Idea.Rectangle = function(father, width, height, rx, ry) { //, stroke, fill, content){
        if (x === undefined) {throw new Error("x not specified!");}
        if (y === undefined) {throw new Error("y not specified!");}
        if (width === undefined) {throw new Error("width not specified");}
        if (height === undefined) {throw new Error("height not specified");}
        if (rx === undefined) {rxGetterSetter.call(this, 0);}
        if (ry === undefined) {ryGetterSetter.call(this, 0);}
        //draw primitives
        this.father = father;
        if (this.father instanceof Idea.Canvas) {
            this._group = Idea.Util.createSVGElement(this.father._canvas, 'g', {});
            this._drawing = Idea.Util.createSVGElement(this._group, 'rect', {
                "x1": this._base.x,
                "y1": this._base.y,
                "x2": this._tip.x,
                "y2": this._tip.y
            });
            //this._drawing.style.stroke = this._color;
            //this._drawing.style['stroke-width'] = this.width;
        }
        else {
            //TODO!!!!
        }

    };

    Idea.Util.extend(Idea.Arrow, Idea.Widget);
    Idea.Util.addAttrsToPrototype(Idea.Arrow, {
        x: xGetterSetter,
        y: yGetterSetter,
        width: widthGetterSetter,
        height: heightGetterSetter,
        rx: rxGetterSetter,
        ry: ryGetterSetter,
    });
})();
