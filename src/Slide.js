(function(){

	var Slide = function(idea){
        this.widgets = []; //list of widgets ordered from deepest to upmost
    };

    Slide.prototype = {
      constructor: Slide  
    };

	Object.defineProperty(Idea.prototype, "Slide", {
		get: function(){
            var binded_slide = Slide.bind(null, this);
            binded_slide.fn = Slide.prototype;
            binded_slide.cons = Slide;
            return binded_slide;
		}
	});

})();
