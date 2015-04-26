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
        // create a div container for our canvas
        this._div = document.createElement('div');
        this._div.style.border = "1px solid rgb(200,200,200)";
        this._div.style.padding = "3px";
        this._div.style.display = "inline-block";

        this.layers = [];
        this._selection = [];

        this.slides = [new this.Slide()]; // slides in correct order
        this._slide = this.slides[0]; // currently active slide
        this._mode = "view"; // "view" or "edit" mode

        this.gui = {};

        this.canvasAndScrollbars = document.createElement('div');
        this.canvasAndScrollbars.style.display = "inline-block";
        this.canvasAndScrollbars.style.border = "1px solid black";
        this.canvasAndScrollbars.style.width = Idea.Conf.defaultViewportWidth+2*20;
        this.canvasAndScrollbars.style.height = Idea.Conf.defaultViewportHeight+2*20;
        this.canvasAndScrollbars.id = "canvasAndScrollbars";

        this.canvasAndVScrollbar = document.createElement('div');
        this.canvasAndVScrollbar.style.display = "inline-block";
        this.canvasAndVScrollbar.style.width = Idea.Conf.defaultViewportWidth+2*20;
        this.canvasAndVScrollbar.style.height = Idea.Conf.defaultViewportHeight;
        this.canvasAndVScrollbar.id = "canvasAndVScrollbar";
        this.canvasAndScrollbars.appendChild(this.canvasAndVScrollbar);

        this.canvas = new this.Canvas(this);
        this.canvasAndVScrollbar.appendChild(this.canvas._canvas);

        var scrollbarWindowSize = Idea.Conf.defaultViewboxHeight;
        var scrollbarScrollSize = Idea.Conf.defaultViewboxHeight / Idea.Conf.scrollbarScrollsPerPage;
        // father, sliderCoord, scrollSize, x, y, width, height, vertical
        this._vScrollbar = new this.Scrollbar(this.canvasAndVScrollbar, 0, scrollbarScrollSize, undefined, undefined, 40, Idea.Conf.defaultViewportHeight, true);

        scrollbarWindowSize = Idea.Conf.defaultViewboxWidth;
        scrollbarScrollSize = Idea.Conf.defaultViewboxWidth / Idea.Conf.scrollbarScrollsPerPage;
        // father, sliderCoord, scrollSize, x, y, width, height, vertical
        this._hScrollbar = new this.Scrollbar(this.canvasAndScrollbars, 0, scrollbarScrollSize, undefined, undefined, Idea.Conf.defaultViewportWidth, 40, false);

        Idea.Util.observe(this._vScrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, this._vScrollbar, this._hScrollbar, true));
        Idea.Util.observe(this._hScrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, this._vScrollbar, this._hScrollbar, false));

        this._div.appendChild(this.canvasAndScrollbars);

        this.gui.tools = new this.Toolbar();
        this._div.appendChild(this.gui.tools._div);

        // observe selection, respond to Esc by clearing selection
        Idea.Util.addEventListener(window, "keydown", this.keyDown, false, this, []);
        Idea.Util.addEventListener(window, "keypress", this.keyDown, false, this, []);

        // create resize grip
        this._grip = document.createElement('div');
        this._grip.style.width = 10;
        this._grip.style.height = 10;
        this._grip.style.display = "inline-block";
        this._grip.style.background = "#AAAAAA";
        this._grip.style.float = "right";
        this._div.appendChild(this._grip);

        this._grip.onmousedown = function(event){
            event = Idea.Util.normalizeMouseEvent(event);
            if (event.which == 1) {
                this._grip_pressed = true;
                this._grip_x = event.clientX;
                this._grip_y = event.clientY;
                // add event listeners to <html> (i.e. document.documentElement)
                // to respond to mousemove and mouseup if they're outside _grip.
                // idea taken from here:
                // http://stackoverflow.com/questions/8960193/how-to-make-html-element-resizable-using-pure-javascript
                var Up = function(event){
                    event = Idea.Util.normalizeMouseEvent(event)
                    if (event.which == 1) {
                        this._grip_pressed = false;
                        document.documentElement.removeEventListener('mousemove', Move, false);
                        document.documentElement.removeEventListener('mouseup', Up, false);
                    }
                }.bind(this);
                
                var Move = function(event) {
                    event = Idea.Util.normalizeMouseEvent(event)
                    if (this._grip_pressed === true){
                        this.width(parseInt(this.width()) + event.clientX - this._grip_x);
                        this.height(parseInt(this.height()) + event.clientY - this._grip_y);
                        this._grip_x = event.clientX;
                        this._grip_y = event.clientY;
                    }
                }.bind(this);

                document.documentElement.addEventListener('mouseup', Up, false);
                document.documentElement.addEventListener('mousemove', Move, false);
            }
        }.bind(this);
        this._grip.onmouseover = function(event){
            event = Idea.Util.normalizeMouseEvent(event);
            this.style.cursor = "nw-resize";
        };

        /*
        //create clear element to clear floats
        this._clear = document.createElement('div');
        this._grip.style.clear = "both";
        this._div.appendChild(this._clear);        
        */
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

/*
 * Idea.ObjectsRegistry is a mapping {Cathegory: Object}, where
 * cathegories are Strings (e.g. "Basic", "Electrical Engineering", "Linear Algebra" etc.) and
 * Objects are clickable objects, that user can create on the canvas, e.g. "Line", "Rectangle", 
 * "Vertex" (in graph-theoretical sense), "Oxygen" (as a graphical representation of atom in 
 * chemical formula).
 *
 */

Idea.ObjectsRegistry = {"Basic": []};

Idea.prototype = {
    mode: function(mode){
        if (mode === undefined) {return this._mode;}
        else {
            if (mode == "view" || mode == "edit" || mode == "creation") {this._mode = mode;}
            else {throw new Error("Wrong mode value: '" + mode + "', should be in ['view', 'edit', 'creation']!");}
        }
    },

    slide: function(slide){
        if (slide === undefined) {return this._slide;}
        else {
            if (this.slides.contains(slide)) {this._slide = slide;}
            else {throw new Error("Slide not in slides!");}
        }
    },

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
    },

    keyDown: function(e){
        var event = Idea.Util.normalizeKeyboardEvent(e);
        if (event == null) return; // just ignore this event, if it should be ignored

        if (this.mode() === 'edit') { // if this is edit, not creation, clear selection
            if (event.type == "keydown" && event.keyCode == 27) { // if this is keydown event on Escape key, clear selection
                this.selection([]);
            }
        }
    },

    selection: function(widgets){
        if (widgets === undefined) {
            return this._selection;
        }
        else {
            Idea.Util.callObservers(this, "selection", widgets);
            // just in case: don't replace the old array object with a new one - modify it
            this._selection.splice(0, this._selection.length);
            this._selection.push.apply(this._selection, widgets);
        }
    },

    adjustViewboxToScrollbars: function(vscrollbar, hscrollbar, vertical, newValue, oldValue){
        var viewBox = this.canvas.viewBox();


        if (parseInt(newValue.max) - parseInt(newValue.min) === parseInt(oldValue.max) - parseInt(oldValue.min)){ // if one of the sliders was dragged
            if (vertical){
                viewBox.y = parseInt(Idea.Conf.canvasMinY + (parseInt(newValue.min) - vscrollbar.railMin()) / (vscrollbar.railMax() - vscrollbar.railMin()) * (Idea.Conf.canvasMaxY - Idea.Conf.canvasMinY));
            }
            else {
                viewBox.x = parseInt(Idea.Conf.canvasMinX + (parseInt(newValue.min) - hscrollbar.railMin()) / (hscrollbar.railMax() - hscrollbar.railMin()) * (Idea.Conf.canvasMaxX - Idea.Conf.canvasMinX));
            }
        }
        else { // if one of the sliders was resized, resize the other one proportionally, so that viewBox proportions are preserved
            if (vertical){
                // in order to avoid infinite loop, temporarily unobserve the other slider before resizing it
                Idea.Util.unobserve(hscrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, vscrollbar, hscrollbar, false));
                // check, which side of the slider is resized and resize the corresponing size of the other slider proportionally
                if (newValue.max !== oldValue.max){
                    // if the other slider bumps into rail's end
                    if (hscrollbar.slider().max + this.canvas.width() / this.canvas.height() * (newValue.max - oldValue.max) > hscrollbar.railMax()){
                        hscrollbar.slider({ min: hscrollbar.railMax() - this.canvas.width() / this.canvas.height() * (newValue.max - newValue.min), max: hscrollbar.railMax() })
                    }
                    else {
                        hscrollbar.slider({ min: hscrollbar.slider().min,  max: hscrollbar.slider().max + this.canvas.width() / this.canvas.height() * (newValue.max - oldValue.max) });
                    }
                }
                else if (newValue.min !== oldValue.min){
                    // if the other slider bumps into the rail's beginning
                    if (hscrollbar.slider().min + this.canvas.width() / this.canvas.height() * (newValue.min - oldValue.min) < hscrollbar.railMin()){
                        hscrollbar.slider({ min: hscrollbar.slider().min, max: hscrollbar.railMin() + this.canvas.width() / this.canvas.height() * (newValue.max - newValue.min)});
                    }
                    else {
                        hscrollbar.slider({ min: hscrollbar.slider().min + this.canvas.width() / this.canvas.height() * (newValue.min - oldValue.min),  max: hscrollbar.slider().max});
                    }
                    
                }
                Idea.Util.observe(hscrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, vscrollbar, hscrollbar, false));
            }
            else {
                // in order to avoid infinite loop, temporarily unobserve the other slider before resizing it
                Idea.Util.unobserve(vscrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, vscrollbar, hscrollbar, true));
                // check, which side of the slider is resized and resize the corresponing size of the other slider proportionally                
                if (newValue.max !== oldValue.max){
                    // if the other slider bumps into rail's end
                    if (vscrollbar.slider().max + this.canvas.height() / this.canvas.width() * (newValue.max - oldValue.max) > vscrollbar.railMax()){
                        vscrollbar.slider({ min: vscrollbar.railMax() - this.canvas.height() / this.canvas.width() * (newValue.max - newValue.min), max: vscrollbar.railMax() });
                    }
                    else {
                        vscrollbar.slider({ min: vscrollbar.slider().min,  max: vscrollbar.slider().max + this.canvas.height() / this.canvas.width() * (newValue.max - oldValue.max) });                        
                    }
                }
                else if (newValue.min !== oldValue.min){
                    // if the other slider bumps into the rail's beginning
                    if (vscrollbar.slider().min + this.canvas.height() / this.canvas.width() * (newValue.min - oldValue.min) < vscrollbar.railMin()){
                        vscrollbar.slider({ min: vscrollbar.railMin(), max: vscrollbar.railMin() + this.canvas.width() / tihs.canvas.height() * (newValue.max - newValue.min)});
                    }
                    else {
                        vscrollbar.slider({ min: vscrollbar.slider().min + this.canvas.height() / this.canvas.width() * (newValue.min - oldValue.min), max: vscrollbar.slider().max});
                    }
                }
                Idea.Util.observe(vscrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, vscrollbar, hscrollbar, true));
            }

            // adjust the viewBox to slider positions
            viewBox.x = parseInt(Idea.Conf.canvasMinX + (parseInt(hscrollbar.slider().min) - hscrollbar.railMin()) / (hscrollbar.railMax() - hscrollbar.railMin()) * (Idea.Conf.canvasMaxX - Idea.Conf.canvasMinX));
            viewBox.y = parseInt(Idea.Conf.canvasMinY + (parseInt(vscrollbar.slider().min) - vscrollbar.railMin()) / (vscrollbar.railMax() - vscrollbar.railMin()) * (Idea.Conf.canvasMaxY - Idea.Conf.canvasMinY));
            viewBox.width = parseInt( (parseInt(hscrollbar.slider().max) - parseInt(hscrollbar.slider().min)) / (hscrollbar.railMax() - hscrollbar.railMin()) * (Idea.Conf.canvasMaxX - Idea.Conf.canvasMinX));
            viewBox.height = parseInt( (parseInt(vscrollbar.slider().max) - parseInt(vscrollbar.slider().min)) / (vscrollbar.railMax() - vscrollbar.railMin()) * (Idea.Conf.canvasMaxY - Idea.Conf.canvasMinY));
        }

        // write out new viewBox value
        this.canvas.viewBox(viewBox);
    }

};

Idea.prototype.constructor = Idea;
