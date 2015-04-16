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
    };

    Widget.prototype = {
        constructor: Widget,
        destroy: function(){
            this.father.removeChild(this._group);
            delete this._drawing;
        },
        getterSetters: function(){
            // TODO this.__proto__
            for (var key in this.__proto__){
                
            }
        }
    };

    Idea.Widget = Widget;

})();
