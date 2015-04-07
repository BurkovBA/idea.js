(function(){

	var Slide = function(idea){
        this.widgets = []; //list of widgets ordered from deepest to upmost
    };

    Slide.prototype = {
      constructor: Slide  
    };

    Idea.prototype.Slide = Slide;

})();
