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
            var output = [];
            for (var key in Object.getPrototypeOf(this)){ // !!! Object.getPrototypeOf() requires IE9+
                if (Idea.Util.isGetterSetter(this.key)) output.push(this.key);
            }
        }
    };

    Idea.Widget = Widget;

})();
