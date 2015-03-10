(function(){

    var Widget = function(slide){
        this.slide = slide;
        this.events = {
            click: function(){},
            dblclick: function(){},
            mousedown: function(){},
            mousemove: function(){},
            mouseout: function(){},
            mouseover: function(){},
            mouseup: function(){},

            keydown: function() {},
            keypress: function(){},
            keyup: function(){},
        };
        this.signals = {
        };
    };

    Widget.prototype = {
        constructor: Widget,
        /*
         * this accepts_event() implementation is a dummy template for heir 
         * widgets; override it in widgets, you inherit from Widget
         */
        accepts_event: function(evt){
            if (Idea.MOUSE_EVENTS.contains(evt.type)) {
                var coords = this.canvas.canvasCoordsForMouseEvent(evt);
                //do meaningful check, that event belongs to this widget
                //propagate the check to daughterly widgets!!!
            }
            return false; //here we just return dummy false
        }
    };

    Object.defineProperty(Idea.prototype.Slide.fn, "Widget", {
        get: function(){
            var binded_widget = Widget.bind(null, this);
            binded_widget.fn = Widget.prototype;
            binded_widget.cons = Widget;
            return binded_widget;
        }
    });

})();
