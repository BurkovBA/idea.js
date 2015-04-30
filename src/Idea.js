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
        this.canvasAndScrollbars.style.width = Idea.Conf.defaultViewportWidth + Idea.Conf.scrollbarOtherSide;
        this.canvasAndScrollbars.style.height = Idea.Conf.defaultViewportHeight + Idea.Conf.scrollbarOtherSide;
        this.canvasAndScrollbars.id = "canvasAndScrollbars";

        this.canvasAndVScrollbar = document.createElement('div');
        this.canvasAndVScrollbar.style.display = "inline-block";
        this.canvasAndVScrollbar.style.width = Idea.Conf.defaultViewportWidth + Idea.Conf.scrollbarOtherSide;
        this.canvasAndVScrollbar.style.height = Idea.Conf.defaultViewportHeight;
        this.canvasAndVScrollbar.id = "canvasAndVScrollbar";
        this.canvasAndScrollbars.appendChild(this.canvasAndVScrollbar);

        this.canvas = new this.Canvas(this);
        this.canvasAndVScrollbar.appendChild(this.canvas._canvas);
        Idea.Util.addEventListener(this.canvas._canvas, "wheel", this.wheel, false, this, []);

        var scrollbarWindowSize = Idea.Conf.defaultViewboxHeight;
        var scrollbarScrollSize = Idea.Conf.defaultViewboxHeight / Idea.Conf.scrollbarScrollsPerPage;
        // father, sliderCoord, scrollSize, x, y, width, height, vertical
        this._vScrollbar = new this.Scrollbar(this.canvasAndVScrollbar, 0, scrollbarScrollSize, undefined, undefined, Idea.Conf.scrollbarOtherSide, Idea.Conf.defaultViewportHeight, true);

        scrollbarWindowSize = Idea.Conf.defaultViewboxWidth;
        scrollbarScrollSize = Idea.Conf.defaultViewboxWidth / Idea.Conf.scrollbarScrollsPerPage;
        // father, sliderCoord, scrollSize, x, y, width, height, vertical
        this._hScrollbar = new this.Scrollbar(this.canvasAndScrollbars, 0, scrollbarScrollSize, undefined, undefined, Idea.Conf.defaultViewportWidth, Idea.Conf.scrollbarOtherSide, false);

        Idea.Util.observe(this._vScrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, this._vScrollbar, this._hScrollbar, true));
        Idea.Util.observe(this._hScrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, this._vScrollbar, this._hScrollbar, false));

        this._div.appendChild(this.canvasAndScrollbars);

        this.gui.tools = new this.Toolbar();
        this._div.appendChild(this.gui.tools._div);

        // observe selection, respond to Esc by clearing selection
        Idea.Util.addEventListener(window, "keydown", this.keyDown, false, this, []);
        Idea.Util.addEventListener(window, "keypress", this.keyDown, false, this, []);

        // add event handler for dragging the canvas
        Idea.Util.addEventListener(this.canvas._canvas, "mousedown", this.mouseDown, false, this, []);

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

    /*
     * Event handlers, attached to idea.canvas or window and where "this" argument is Idea object.
     * Also, helper functions are here.
     */

    keyDown: function(e){
        var event = Idea.Util.normalizeKeyboardEvent(e);
        if (event == null) return; // just ignore this event, if it should be ignored

        if (this.mode() === 'edit') { // if this is edit, not creation, clear selection
            if (event.type == "keydown" && event.keyCode == 27) { // if this is keydown event on Escape key, clear selection
                this.selection([]);
            }
        }
    },

    mouseDown: function(e){
        e.preventDefault();
        e.stopPropagation();

        // TODO check it's left mouse button
        // TODO block mousewheel

        // cache mouse pointer location to calulate canvas offset
        var event = Idea.Util.normalizeMouseEvent(e);
        this.previousMouseCoords = {x: event.clientX, y: event.clientY};

        Idea.Util.addEventListener(window, "mouseup", this.mouseUp, false, this, []);
        Idea.Util.addEventListener(this.canvas._canvas, "mousemove", this.mouseMove, false, this, []);

        // unobserve scrollbar sliders until drag ends - we'll calculate their coordinates here manually
        Idea.Util.unobserve(this._hScrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, this._vScrollbar, this._hScrollbar, false));
        Idea.Util.unobserve(this._vScrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, this._vScrollbar, this._hScrollbar, true));        
    },

    mouseMove: function(e){
        var vscrollbar = this._vScrollbar;
        var hscrollbar = this._hScrollbar;
        var event = Idea.Util.normalizeMouseEvent(e);

        // calculate canvasCoordinates to window coordinates ratio and infer viewBox shift from that
        var canvasRectangle = this.canvas._canvas.getBoundingClientRect(); // this is relative to window - the browser viewport
        var canvasToUserXRatio = this.canvas.viewBox().width / canvasRectangle.width;
        var canvasToUserYRatio = this.canvas.viewBox().height / canvasRectangle.height;

        // inverse the signs of deltas - if user moves mouse up, the viewBox goes down
        var deltaX = -canvasToUserXRatio * (event.clientX - this.previousMouseCoords.x);
        var deltaY = -canvasToUserYRatio * (event.clientY - this.previousMouseCoords.y);

        // calculate the new position of viewBox
        var viewBox = this.canvas.viewBox();

        if (viewBox.x + viewBox.width + deltaX > Idea.Conf.canvasMaxX) viewBox.x = Idea.Conf.canvasMaxX - viewBox.width;
        else if (viewBox.x + deltaX < Idea.Conf.canvasMinX) viewBox.x = Idea.Conf.canvasMinX
        else viewBox.x = parseInt(viewBox.x + deltaX)

        if (viewBox.y + viewBox.height + deltaY > Idea.Conf.canvasMaxY) viewBox.y = Idea.Conf.canvasMaxY - viewBox.height;
        else if (viewBox.y + deltaY < Idea.Conf.canvasMinY) viewBox.y = Idea.Conf.canvasMinY
        else viewBox.y = parseInt(viewBox.y + deltaY)

        this.canvas.viewBox(viewBox);

        // shift sliders according to the viewBox location
        var vscrollbarRailSize = vscrollbar.railMax() - vscrollbar.railMin();
        var hscrollbarRailSize = hscrollbar.railMax() - hscrollbar.railMin();
        var canvasXSize = Idea.Conf.canvasMaxX - Idea.Conf.canvasMinY;
        var canvasYSize = Idea.Conf.canvasMaxY - Idea.Conf.canvasMinY;

        hscrollbar.slider({min: parseInt(hscrollbar.railMin() + (viewBox.x - Idea.Conf.canvasMinX) / canvasXSize * hscrollbarRailSize), 
                                 max: parseInt(hscrollbar.railMin() + (viewBox.x + viewBox.width - Idea.Conf.canvasMinX) / canvasXSize * hscrollbarRailSize)});
        vscrollbar.slider({min: parseInt(vscrollbar.railMin() + (viewBox.y - Idea.Conf.canvasMinY) / canvasYSize * vscrollbarRailSize), 
                                 max: parseInt(vscrollbar.railMin() + (viewBox.y + viewBox.height - Idea.Conf.canvasMinY) / canvasYSize * vscrollbarRailSize)});

        // update this.previousMouseCoords with current mouse location
        this.previousMouseCoords = {x: event.clientX, y: event.clientY};
    },

    mouseUp: function(e){
        e.preventDefault();
        e.stopPropagation();

        // TODO check it's left mouse button
        // TODO unblock the mousewheel
        delete this.mouseDownCoords;

        // remove event listeners
        Idea.Util.removeEventListener(window, "mouseup", this.mouseUp, false, this, []);
        Idea.Util.removeEventListener(this.canvas._canvas, "mousemove", this.mouseMove, false, this, []);

        // observe scorllbars again
        Idea.Util.observe(this._hScrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, this._vScrollbar, this._hScrollbar, false));
        Idea.Util.observe(this._vScrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, this._vScrollbar, this._hScrollbar, true));        
    },

    /*
     * This function handles wheel event on this.canvas and scrolls the viewport and scrollbars
     * appropriately. Relies on "wheel" event, works in IE9+, FF17+, Chrome31+.
     */

    wheel: function(e){
        e.preventDefault();
        e.stopPropagation();

        var hscrollbar = this._hScrollbar;
        var vscrollbar = this._vScrollbar;

        var event = Idea.Util.normalizeWheel(event);

        Idea.Util.unobserve(hscrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, vscrollbar, hscrollbar, false));
        Idea.Util.unobserve(vscrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, vscrollbar, hscrollbar, true));

        // calculate the fractions of viewport that should go forward/backward depending on the mouse pointer location
        var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.canvas._canvas);
        var leftFraction = (canvasCoords.x - this.canvas.viewBox().x) / this.canvas.viewBox().width;
        var rightFraction = 1 - leftFraction;
        var leftDelta = Math.abs(parseInt(event.deltaFactor * rightFraction)); // note that leftDelta is mul'ed by right fraction
        var rightDelta = Math.abs(parseInt(event.deltaFactor * leftFraction));
        var topFraction = (canvasCoords.y - this.canvas.viewBox().y) / this.canvas.viewBox().height;
        var bottomFraction = 1 - topFraction;
        var topDelta = Math.abs(parseInt(event.deltaFactor * bottomFraction));
        var bottomDelta = Math.abs(parseInt(event.deltaFactor * topFraction));

        if (event.deltaY < 0) { // if this is zoom out
            // if zoom out would take the whole space of canvas
            if ((hscrollbar.slider().min - leftDelta < hscrollbar.railMin()) && (hscrollbar.slider().max + rightDelta > hscrollbar.railMax())) { // the other scrollbar should be proportional
                // just enlarge the scrollbars to the full size of the rail and set the viewBox to full canvas
                hscrollbar.slider({min: hscrollbar.railMin(), max: hscrollbar.railMax()});
                vscrollbar.slider({min: vscrollbar.railMin(), max: vscrollbar.railMax()});
                this.canvas.viewBox({x: Idea.Conf.canvasMinX, y: Idea.Conf.canvasMinY, width: (Idea.Conf.canvasMaxX - Idea.Conf.canvasMinX), height: (Idea.Conf.canvasMaxY - Idea.Conf.canvasMinY)});
            }
            else {
                if ( hscrollbar.slider().min - leftDelta < hscrollbar.railMin() ){
                    rightDelta = rightDelta + ( hscrollbar.slider().min - hscrollbar.railMin());
                    if (rightDelta + hscrollbar.slider().max > hscrollbar.railMax()) rightDelta = hscrollbar.railMax() - hscrollbar.slider().max;
                    leftDelta = hscrollbar.slider().min - hscrollbar.railMin();
                }
                else if ( hscrollbar.slider().max + rightDelta > hscrollbar.railMax() ){
                    leftDelta = leftDelta + (hscrollbar.railMax() - hscrollbar.slider().max);
                    if (hscrollbar.slider().min - leftDelta < hscrollbar.slider().min) leftDelta = hscrollbar.slider().min - hscrollbar.railMin();
                    rightDelta = (hscrollbar.railMax() - hscrollbar.slider().max);
                }
                hscrollbar.slider({min: hscrollbar.slider().min - leftDelta, max: hscrollbar.slider().max + rightDelta});

                // TODO: it might happen that after decreasing one side and increasing another one, another side has grown over the edge
                if ( vscrollbar.slider().min - topDelta < vscrollbar.railMin() ){
                    bottomDelta = bottomDelta + (vscrollbar.slider().min - vscrollbar.railMin());
                    if (bottomDelta + vscrollbar.slider().max > vscrollbar.railMax()) bottomDelta = vscrollbar.railMax() - vscrollbar.slider().max;
                    topDelta = vscrollbar.slider().min - vscrollbar.railMin();
                }
                else if ( vscrollbar.slider().max + bottomDelta > vscrollbar.railMax() ){
                    topDelta = topDelta + (vscrollbar.railMax() - vscrollbar.slider().max);
                    if (vscrollbar.slider().min - topDelta < vscrollbar.railMin()) topDelta = vscrollbar.slider().min - vscrollbar.railMin();
                    bottomDelta = (vscrollbar.railMax() - vscrollbar.slider().max);
                }
                vscrollbar.slider({min: vscrollbar.slider().min - leftDelta, max: vscrollbar.slider().max + rightDelta});                
            }
        }
        else { // if this is zoom in
            var sumOfDeltas;

            // if new slider becomes too small size
            if ( (hscrollbar.slider().max - rightDelta) - (hscrollbar.slider().min - leftDelta) <  Idea.Conf.minimalSliderSize ){
                sumOfDeltas = leftDelta + rightDelta;
                leftDelta = parseInt(leftDelta / sumOfDeltas * (hscrollbar.slider().max - hscrollbar.slider().min - Idea.Conf.minimalSliderSize));
                rightDelta = parseInt(rightDelta / sumOfDeltas * (hscrollbar.slider().max - hscrollbar.slider().min - Idea.Conf.minimalSliderSize));
                // TODO: it might be necessary to resize the other slider to preserve canvas proportions
            }
            hscrollbar.slider({min: hscrollbar.slider().min + leftDelta, max: hscrollbar.slider().max - rightDelta});

            // if new slider becomes too small size
            if ( (vscrollbar.slider().max - bottomDelta) - (vscrollbar.slider().min - topDelta) <  Idea.Conf.minimalSliderSize ){
                sumOfDeltas = topDelta + bottomDelta;
                topDelta = parseInt(topDelta / sumOfDeltas * (vscrollbar.slider().max - vscrollbar.slider().min - Idea.Conf.minimalSliderSize));
                bottomDelta = parseInt(bottomDelta / sumOfDeltas * (vscrollbar.slider().max - vscrollbar.slider().min - Idea.Conf.minimalSliderSize));
                // TODO: it might be necessary to resize the other slider to preserve canvas proportions
            }
            vscrollbar.slider({min: vscrollbar.slider().min + topDelta, max: vscrollbar.slider().max - bottomDelta});            
        }

        // adjust the viewBox to slider positions
        var viewBox = this.canvas.viewBox();

        viewBox.x = parseInt(Idea.Conf.canvasMinX + (parseInt(hscrollbar.slider().min) - hscrollbar.railMin()) / (hscrollbar.railMax() - hscrollbar.railMin()) * (Idea.Conf.canvasMaxX - Idea.Conf.canvasMinX));
        viewBox.y = parseInt(Idea.Conf.canvasMinY + (parseInt(vscrollbar.slider().min) - vscrollbar.railMin()) / (vscrollbar.railMax() - vscrollbar.railMin()) * (Idea.Conf.canvasMaxY - Idea.Conf.canvasMinY));
        viewBox.width = parseInt( (parseInt(hscrollbar.slider().max) - parseInt(hscrollbar.slider().min)) / (hscrollbar.railMax() - hscrollbar.railMin()) * (Idea.Conf.canvasMaxX - Idea.Conf.canvasMinX));
        viewBox.height = parseInt( (parseInt(vscrollbar.slider().max) - parseInt(vscrollbar.slider().min)) / (vscrollbar.railMax() - vscrollbar.railMin()) * (Idea.Conf.canvasMaxY - Idea.Conf.canvasMinY));

        if ((viewBox.width < 0) || (viewBox.height < 0)) debugger;

        // write out new viewBox value
        this.canvas.viewBox(viewBox);

        Idea.Util.observe(this._hScrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, this._vScrollbar, this._hScrollbar, false));
        Idea.Util.observe(this._vScrollbar, "slider", this.adjustViewboxToScrollbars.bind(this, this._vScrollbar, this._hScrollbar, true));
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
                        vscrollbar.slider({ min: vscrollbar.railMin(), max: vscrollbar.railMin() + this.canvas.width() / this.canvas.height() * (newValue.max - newValue.min)});
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
