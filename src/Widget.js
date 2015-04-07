(function(){

    var Widget = function(parent){
        this.parent = parent;
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
    };

    Idea.Widget = Widget;

})();
