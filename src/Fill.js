(function(){
    var colorValidator = Idea.Util.ColorValidator();
    var opacityValidator = Idea.Util.OpacityValidator();
    Idea.Util.Fill = function(color, opacity){
        this._color = color;
        this._opacity = opacity;
        
    };
    Idea.Util.Fill.prototype = {};
    Idea.Util.addAttrsToPrototype();
})();
