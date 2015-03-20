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
        this._div.className = 'toolbar';
        this._div.style.width = "" + (Idea.Conf.defaultViewportWidth + 40) +"px";
        this._div.style.height = "" + (Idea.Conf.defaultViewportHeight + 40) +"px";

        this.tabBar = document.createElement('div');
        this._div.appendChild(this.tabBar);
        Idea.Util.addClass(this.tabBar, 'toolbar-tabbar');

        this.fileTab = document.createElement('div');
        this.fileTab.innerHTML = "File"; //ie8+/9+
        this.tabBar.appendChild(this.fileTab);
        Idea.Util.addClass(this.fileTab, 'toolbar-tab');
        Idea.Util.addClass(this.fileTab, 'active');

        this.objectsTab = document.createElement('div');
        this.objectsTab.innerHTML = "Objects"; //ie8+/9+
        this.tabBar.appendChild(this.objectsTab);
        Idea.Util.addClass(this.objectsTab, 'toolbar-tab');

        this.animationsTab = document.createElement('div');
        this.animationsTab.innerHTML = "Animations"; //ie8+/9+
        this.tabBar.appendChild(this.animationsTab);
        Idea.Util.addClass(this.animationsTab, 'toolbar-tab')

        this.filePage = document.createElement('div');
        this._div.appendChild(this.filePage);
        Idea.Util.addClass(this.filePage, 'toolbar-page');
        Idea.Util.addClass(this.filePage, 'active');

        this.objectsPage = document.createElement('div');
        this._div.appendChild(this.objectsPage);
        Idea.Util.addClass(this.objectsPage, 'toolbar-page');

        this.animationsPage = document.createElement('div');
        this._div.appendChild(this.animationsPage);
        Idea.Util.addClass(this.animationsPage, 'toolbar-page');

        var toolbarTabs = [this.fileTab, this.objectsTab, this.animationsTab];
        var toolbarPages = [this.filePage, this.objectsPage, this.animationsPage];

        this.fileTab.addEventListener('click', function(){
            toolbarPages.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            toolbarTabs.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            if (!Idea.Util.hasClass(this.fileTab, 'active')) Idea.Util.addClass(this.fileTab, 'active');
            if (!Idea.Util.hasClass(this.filePage, 'active')) Idea.Util.addClass(this.filePage, 'active');
        }.bind(this));

        this.objectsTab.addEventListener('click', function(){
            toolbarPages.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            toolbarTabs.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            if (!Idea.Util.hasClass(this.objectsTab, 'active')) Idea.Util.addClass(this.objectsTab, 'active');
            if (!Idea.Util.hasClass(this.objectsPage, 'active')) Idea.Util.addClass(this.objectsPage, 'active');
        }.bind(this));

        this.animationsTab.addEventListener('click', function(){
            toolbarPages.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            toolbarTabs.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            if (!Idea.Util.hasClass(this.animationsTab, 'active')) Idea.Util.addClass(this.animationsTab, 'active');
            if (!Idea.Util.hasClass(this.animationsPage, 'active')) Idea.Util.addClass(this.animationsPage, 'active');
        }.bind(this));


        this.objectsMenu = document.createElement('div');
        this.objectsTab.appendChild(this.objectsMenu);

        this.objectContext = document.createElement('div');
        this.objectsTab.appendChild(this.objectContext);


    };

    Toolbar.prototype = {};
    Toolbar.prototype.constructor = Toolbar;

    Object.defineProperty(Idea.prototype, "Toolbar", {
        get: function(){
            return Toolbar.bind(null, this);
        }
    });

})();
