(function(){

	var Slide = function(idea){
        this.objects = []; // list of objects ordered from deepest to upmost
    };

    Slide.prototype = {
      constructor: Slide  
    };

    Idea.prototype.Slide = Slide;

})();
