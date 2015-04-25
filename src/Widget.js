(function(){

    var Widget = function(parent){
        this.parent = parent;
        this.handles = [];
        this._transform = "";
        Idea.Util.observe(this, "transform", function(newValue, oldValue){this._group.setAttribute("transform", newValue);}.bind(this));
    };

    Widget.prototype = {
        constructor: Widget,
        transform: Idea.Util.getterSetter("transform", Idea.Util.transformValidator, null),
        destroy: function(){
            this.father.removeChild(this._group);
            delete this._drawing;
        },
        getterSetters: function(){
            var output = [];
            for (var key in Object.getPrototypeOf(this)){ // !!! Object.getPrototypeOf() requires IE9+
                if (Idea.Util.isGetterSetter(this.key)) output.push(this.key);
            }
        },

        /*
         * Widgets have some control points - handles - that show up when user's mouse is hovering over
         * widget or its immediate vicinity and remain shown when the widget is selected. When the widget
         * is the only widget in the selection, those points also allow user to modify widget's dimensions
         * or scale/rotate it.
         */

        vicinityMouseOver: function(obj, e){
            if (this.selection().indexOf(obj) === -1) {
                obj.handles.forEach(function(el){el.setAttribute("opacity", 1)});
            }
        },

        vicinityMouseLeave: function(obj, e){
            if (this.selection().indexOf(obj) === -1) {
                obj.handles.forEach(function(el){el.setAttribute("opacity", 0)});
            }
        },

        vicinityMouseDown: function(obj, e){
            this.selection([obj]);
            obj.handles.forEach(function(el){el.setAttribute("opacity", 1)});
        },
        /*
         * The following event listeners should be attached to widgets in edit mode.
         * They handle transformations: translation, rotation. scaling, skewX and skewY.
         */

        translateMouseDown: function(obj, e){
            e.preventDefault();
            var event = Idea.Util.normalizeMouseEvent(e);
            this._mouseDownCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.canvas._canvas);

            this.selection([obj]);
                                    // obj, eventType, listener, useCapture, thisArg, argumentsList
            Idea.Util.addEventListener(this.canvas._canvas, "mousemove", obj.translateMouseMove, false, this, [obj]);
            Idea.Util.addEventListener(window, "mouseup", obj.translateMouseUp, false, this, [obj]);
        },

        translateMouseMove: function(obj, e){
            var event = Idea.Util.normalizeMouseEvent(e);
            var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.canvas._canvas);

            var deltaX = canvasCoords.x - this._mouseDownCoords.x; // TODO: + obj.translate().x
            var deltaY = canvasCoords.y - this._mouseDownCoords.y; // TODO: + obj.translate().y
            obj.transform("translate(" + deltaX + "," + deltaY + ")");
        },

        translateMouseUp: function(obj, e){
            Idea.Util.removeEventListener(this.canvas._canvas, "mousemove", obj.translateMouseMove, false, this, [obj])
            Idea.Util.removeEventListener(window, "mouseup", obj.translateMouseUp, false, this, [obj]);
            delete this._mouseDownCoords;
        },

        rotateMouseDown: function(obj, e){

        },

        rotateMouseMove: function(obj, e){

        },

        rotateMouseUp: function(obj, e){

        }
    };

    Idea.Widget = Widget;

})();
