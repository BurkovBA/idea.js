/*
 * Idea.js is a library, meant for creating rich presentations that primarily
 * contain interactive animations and pictures right in the browser window.
 * 
 * Idea.js also comes with an in-browser GUI viewer/editor, where you can 
 * create or view your presentations.
 * 
 * GUI viewer/editor elements
 * 
 * Your GUI editor may be in one of 2 modes: edit or view. In edit mode you
 * are supplied with a canvas to draw your presentation on and with tools to 
 * aid you. You can drag presentation elements around the canvas. 
 * You'll use view mode to display your presentation to users. If your audience 
 * is viewing your presentation in a browser, they can also interact with 
 * presentation, but only in the manner, that you specified.
 * 
 * Presentaton window is split into 4 parts.
 *   - The leftmost part is slidebar. Presentation consists of slides.
 *   - The lower part is timeline. Each slide contains its own timeline, 
 *     independent of other slides.
 *   - The central part is Canvas. This is where your slides are shown, here
 *     you create your presentation elements and this is what your audience 
 *     wants to see in view mode.
 *   - The right-central part is a tabbed Tools panel. In edit mode it contains
 *     Layers bar, Widgets selection bar, Widget options panel, Transitions 
 *     selection bar, Transition options panel, Source code bar, Properties
 *     bar and Comments bar.
 *     In view mode it contains only Properties bar and Comments bar.
 *
 * Presentation elements are called Widgets. In edit mode you can add new 
 * widgets to the Canvas, choosing them from Widgets selection bar. You can 
 * customize widget, by clicking on it and using Widget options panel that 
 * appears in the Tools panel. You can also directly set its properties in
 * javascript code in Source code bar.
 * 
 * Widgets may contain daughterly widgets.
 *
 * Layers bar
 *
 * Layers bar describes the order of Widgets on your Canvas. Layers bar 
 * contains Layers and Layer Groups. A Layer is an object, on which you put
 * low-level drawing primitives that comprise your Widgets. A Layer Group 
 * (or just Group) is an ordered set of Layers and/or daughterly Layer Groups. 
 * Each Widget corresponds to a Layer Group. The most primitive Widgets consist
 * of a Layer Group, which contains a single Layer. The Widget primitives are
 * drawn on that Layer.  If the widget contains daughterly widgets, each 
 * daughterly Widget corresponds to its own Layer Group within the parent 
 * Layer's Layer Group.
 *
 * Source code bar 
 * 
 * Note that you CAN'T write absolutely arbitrary javascript code in Source 
 * code bar for security reasons - otherwise, black hat hackers would've been
 * able to introduce malicious code. All the code, entered in Source
 * code bar is sanitized via white-list-based sanitizer.
 *
 * Idea.js makes use of getterSetters (possibly overloaded, i.e. in multiple forms)
 * to access and modify attributes of objects. E.g. you can say widget.opacity()
 * to obtain opacity value of your widget and say widget.opacity(0.5) to set
 * its opacity to 50%. So the same method "opacity" acts both as getter and setter.
 * 
 */

/*
 * This is a single instance of GUI with Idea.Canvas, with GUI elements 
 * specified and with a separate set of configuration options.
 *
 */

Idea = function(){

        this.slides = [new this.Slide()]; // slides in correct order
        this._slide = this.slides[0]; // currently active slide
        this._mode = "view"; // "view" or "edit" mode

        this.gui = {};
        this._div = document.createElement('div');
        this._topdiv = document.createElement('div');
        this.gui.slidebar = new this.Slidebar();
        this._topdiv.appendChild(this.gui.slidebar._div);
        this.canvas = new this.Canvas(this);
        this._topdiv.appendChild(this.canvas._div);
        this.gui.tools = new this.Toolbar();
        this._topdiv.appendChild(this.gui.tools._div);
        this._div.appendChild(this._topdiv);
        this.gui.timeline = new this.Timeline();
        this._div.appendChild(this.gui.timeline._div);
};

/*
 * Idea.Util contains convenience functions, objects and constants for Idea.js programmers,
 * writing both library core and extensions, widgets etc.
 */

Idea.Util = {};

/*
 * Idea.Conf contains configuration defaults (e.g. Canvas size, framerate etc.)
 * and when you say var idea = new Idea();, idea.conf's content is cloned from
 * Conf's contents.
 */

Idea.Conf = {};

Idea.prototype = {

    insertSlide: function(index, slide){
        // create and insert slide preview to the slidebar
        if (index > this.slides.length){
            // raise Exception
        }
        else {
            var previous_slide_preview = this.gui.slidebar.getChildNodes()[index];
            var div = document.createElement('div');
            // TODO create preview
            this.gui.slidebar.insertBefore(div, previous_slide_preview)
        }
        this.splice(index, 0, slide);
    },
    appendSlide: function(slide){
        this.insertSlide(this.length, slide);
    }

};

Idea.prototype.constructor = Idea;
