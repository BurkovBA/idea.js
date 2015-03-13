(function(){
    var Slidebar = function(idea){
        this.idea = idea;
        this._div = document.createElement('div');
        this._div.style.border = "1px solid rgb(200,200,200)";        
        this._div.style.display = "inline-block";
        this._div.style.overflow = "scrollbar";
        this._div.style.width = "200px";
    };

    Slidebar.prototype = {constructor: Slidebar};

    Object.defineProperty(Idea.prototype, "Slidebar", {
        get: function(){
            return Slidebar.bind(null, this);
        }
    });

    var Timeline = function(idea){
        this.idea = idea;
        this._div = document.createElement('div');
        this._div.style.border = "1px solid rgb(200,200,200)";        
        this._div.style.display = "inline-block";
        this._div.style.overflow = "scrollbar";
        this._div.style.width = "200px";
    };

    Timeline.prototype = {};
    Timeline.prototype.constructor = Timeline;

    Object.defineProperty(Idea.prototype, "Timeline", {
        get: function(){
            return Timeline.bind(null, this);
        }
    });

    var Toolbar = function(idea){
    	this.idea = idea;
        this._div = document.createElement('div');
        this._div.style.display = "inline-block";
        this._div.style.overflow = "scrollbar";
        this._div.style.background = "rgb(200, 200, 200) no-repeat";
        this._div.style.width = "" + (Idea.Conf.defaultViewportWidth + 40) +"px";
        this._div.style.height = "" + (Idea.Conf.defaultViewportHeight + 40) +"px";
    };

    Toolbar.prototype = {};
    Toolbar.prototype.constructor = Toolbar;

    Object.defineProperty(Idea.prototype, "Toolbar", {
        get: function(){
            return Toolbar.bind(null, this);
        }
    });

})();
