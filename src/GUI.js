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

    /**
     *
     * icon represents an Object=Widget on the objects creation bar of toolbar (so, it actually
     * is a button). By pressing it, you activate "creation" mode of idea object and can visually
     * create the corresponding object.
     *
     * @param idea {Object}
     * @param handlers {Array} - each element is a list [object, eventType, listener, bubbles]. Upon
     * click on the icon, it calls object.addEventListener(eventType, listener, bubbles) for all elements
     * of the list.
     * @param label {dom} - label to be displayed on your icon, its width/height should equal to Idea.Conf.objectIconWidth/Height
     *
     */

    var Icon = function(idea, handlers, label){
        this.idea = idea;
        this.icon = document.createElement('button');
        this.icon.appendChild(label);
        Idea.Util.addClass(this.icon, "icon");

        this._toggle = false;
        
        this.handlers = handlers;
        this.icon.addEventListener("click", this.click.bind(this), false);
    };

    Icon.prototype = {
        constructor: Icon,
        toggle: function(){
            if (!this._toggle) { // toggle is off - start creating a new object
                this.idea.mode('creation');
                this._toggle = true;
                if (Idea.Util.hasClass(this.icon, "off")) Idea.Util.removeClass(this.icon, "off");
                Idea.Util.addClass(this.icon, "on")
            }
            else { // on - cancel creation of object
                this.idea.mode("edit");
                this._toggle = false;
                if (Idea.Util.hasClass(this.icon, "on")) Idea.Util.removeClass(this.icon, "on");
                Idea.Util.addClass(this.icon, "off");
            }
        },
        click: function(){
            this.toggle();
            for (var i=0; i<this.handlers.length; i++){
                var handler = this.handlers[i];
                Idea.Util.addEventListener(this.idea.canvas._canvas, handler[0], handler[1], handler[2], this.idea, []); //obj, eventType, listener, useCapture, thisArg, argumentsList
                this.idea.icon = this;
            }
        }
    };

    Object.defineProperty(Idea.prototype, "Icon", {
        get: function(){
            return Icon.bind(null, this);
        }
    });

    /**
    *
    * Context represents the state of edited or created widget. E.g. for a Line it contains
    * its x1, y1, x2, y2 coordinates, stroke, strokeWidth etc., i.e. properties set by getterSetters.
    *
    */

    var Context = function(idea){
        this.idea = idea;
        this._div = document.createElement('div');
    };

    Context.prototype = {
        constructor: Context,

        /*
         * Context switch happens when a new set of widgets is selected via idea.selection(newSetOfWidgets).
         * This function observes those changes and re-draws context to reflect the new selection's properties.
         */

        switch: function(newValue, oldValue){
            if (newValue.length === 1) {
                var getterSetters = this.newValue[0].getterSetters();
                var contextWidgetSetConstructors = {};
                var contextWidgetSets = {};
                getterSetters.forEach(function(el){contextWidgetSetConstructors[el] = el.widgets});
                
                for (var key in contextWidgetSetConstructors){
                    contextWidgetSetConstructors[key] = [];
                    contextWidgetSetConstructors[key].forEach(function(constructor){
                        contextWidgetSets[key].push(constructor());
                    });
                }
            }
            else {
                this.destroy(oldValue);
            }
        },

        destroy: function(selection){
            selection.forEach(function(obj, index, array){

            });
        }
    };

    Object.defineProperty(Idea.prototype, "Context", {
        get: function(){
            return Context.bind(null, this);
        }
    });

    var Toolbar = function(idea){
        //TODO: de-duplicate this code

    	this.idea = idea;
        this._div = document.createElement('div');
        this._div.className = 'toolbar';
        this._div.style.width = "" + (Idea.Conf.defaultViewportWidth + Idea.Conf.scrollbarOtherSide) +"px";
        this._div.style.height = "" + (Idea.Conf.defaultViewportHeight + Idea.Conf.scrollbarOtherSide) +"px";

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

        this.definitionsTab = document.createElement('div');
        this.definitionsTab.innerHTML = "Definitions"; //ie8+/9+
        this.tabBar.appendChild(this.definitionsTab);
        Idea.Util.addClass(this.definitionsTab, 'toolbar-tab');

        this.animationsTab = document.createElement('div');
        this.animationsTab.innerHTML = "Animations"; //ie8+/9+
        this.tabBar.appendChild(this.animationsTab);
        Idea.Util.addClass(this.animationsTab, 'toolbar-tab')

        var hr = document.createElement('hr');
        this._div.appendChild(hr);

        this.filePage = document.createElement('div');
        this._div.appendChild(this.filePage);
        Idea.Util.addClass(this.filePage, 'toolbar-page');
        Idea.Util.addClass(this.filePage, 'active');

        this.objectsPage = document.createElement('div');
        this._div.appendChild(this.objectsPage);
        Idea.Util.addClass(this.objectsPage, 'toolbar-page');

        this.definitionsPage = document.createElement('div');
        this._div.appendChild(this.definitionsPage);
        Idea.Util.addClass(this.definitionsPage, 'toolbar-page');

        this.animationsPage = document.createElement('div');
        this._div.appendChild(this.animationsPage);
        Idea.Util.addClass(this.animationsPage, 'toolbar-page');

        var toolbarTabs = [this.fileTab, this.objectsTab, this.definitionsTab, this.animationsTab];
        var toolbarPages = [this.filePage, this.objectsPage, this.definitionsPage, this.animationsPage];

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

        this.definitionsTab.addEventListener('click', function(){
            // TODO WRITE THIS!!!
            toolbarPages.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            toolbarTabs.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            if (!Idea.Util.hasClass(this.definitionsTab, 'active')) Idea.Util.addClass(this.definitionsTab, 'active');
            if (!Idea.Util.hasClass(this.definitionsPage, 'active')) Idea.Util.addClass(this.definitionsPage, 'active');
        }.bind(this));

        this.animationsTab.addEventListener('click', function(){
            toolbarPages.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            toolbarTabs.forEach(function(el, index, array){if (Idea.Util.hasClass(el, 'active')) Idea.Util.removeClass(el, 'active')});
            if (!Idea.Util.hasClass(this.animationsTab, 'active')) Idea.Util.addClass(this.animationsTab, 'active');
            if (!Idea.Util.hasClass(this.animationsPage, 'active')) Idea.Util.addClass(this.animationsPage, 'active');
        }.bind(this));


        this.objectsMenu = document.createElement('div');
        this.objectsPage.appendChild(this.objectsMenu);

        this.cathegoryObjects = document.createElement('div');
        Idea.Util.addClass(this.cathegoryObjects, "cathegory-objects");
        this.objectsPage.appendChild(this.cathegoryObjects);

        for (var i=0; i<Idea.ObjectsRegistry["Basic"].length; i++){
            var obj = Idea.ObjectsRegistry["Basic"][i];
            var icon = new idea.Icon(obj.prototype.iconHandlers, obj.prototype.iconLabel);
            this.cathegoryObjects.appendChild(icon.icon);
        }

        this.objectContext = document.createElement('div');
        this.objectsPage.appendChild(this.objectContext);


    };

    Toolbar.prototype = {};
    Toolbar.prototype.constructor = Toolbar;

    Object.defineProperty(Idea.prototype, "Toolbar", {
        get: function(){
            return Toolbar.bind(null, this);
        }
    });
})();
