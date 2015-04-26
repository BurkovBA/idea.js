(function(){

// http://www.dotuscomus.com/svg/lib/iwsb/innerwinscroll.svg
// http://www.carto.net/papers/svg/gui/scrollbar/
// http://www.dotuscomus.com/svg/lib/library.html
// http://www.codedread.com/blog/archives/2005/12/21/how-to-enable-dragging-in-svg/

/**
 *
 * Creates a scrollbar inside an <svg> element with given upper-left
 * coordinates and specified width/height. Either vertical or horizontal.
 *
 * @param father {DOMObject} - an <svg> dom node to put the scrollbar into;
 * @param scrollable - a scrollable object that corresponds to this scrollbar; it is supposed
 *  to have a certain range and a window covering part of that range; the scrollbar's
 *  rail corresponds to that range and the scrollbar's slider - to that window;
 * @param scrollableMin {number} - e.g. if scrollable has range [-200, 400], then it's -200;
 * @param scrollableMax {number} - e.g. if scrollable has range [-200, 400], then it's 400; 
 * @param windowSize {positive number} - size of the scrollable's window, corresponding 
 *  to the scrollbar's slider, e.g. could be 200 for scrollable with range [-200, 400];
 * @param windowCoord {number} - starting coordinate of scrollable's window, 
 *  e.g. for the range[-200, 400] it could be -100;
 * @param scrollSize {positive number} - scrollable's window will be moved
 *  forward/backward by this amount upon a click on scrollbar forward/backward buttons;
 * @param x {number} - x coordinate of scrollbar within father;
 * @param y {number} - y coordinate of scrollbar within father;
 * @param width {positive number} - width of the scrollbar in father coordinates;
 * @param height {positive number} - width of the scrollbar in father coordinates;
 * @param vertical {boolean} - if the srollbar is vertical or horizontal;
 */

// to add handler function from html script element in an inner svg, say
// onclick='top.handler_name(evt)'

// this is old style of events creation
var pageBackward = document.createEvent("CustomEvent");
// see https://developer.mozilla.org/en-US/docs/Web/API/document.createEvent
pageBackward.initCustomEvent('pageBackward', true, true, {}); //type, bubbles, cancelable, detail
window.dispatchEvent(pageBackward);

//TODO msie fireEvent

var Scrollbar = function(father, scrollable, scrollableMin, scrollableMax, windowSize, windowCoord, scrollSize, x, y, width, height, vertical){
	this.father = father;
	this.scrollable = scrollable; // TODO: remove this scrollable, instead completely rely on events?
	this.vertical = vertical;

	if (scrollSize == null){ // TODO: validator
		if (vertical) this.scrollSize = height/100;
		else this.scrollSize = width/100;
	}
	else this.scrollSize = scrollSize;

	if (windowSize == null){
		if (vertical) this.windowSize = height/5;
		else this.windowSize = height/5;
	}
	else this.windowSize = windowSize;

	if (x === undefined) x = 0;
	if (y === undefined) y = 0;

	this.scrollbar = Idea.Util.createSVGElement(father, 'svg', {x: x, y: y, width: width, height: height, viewBox: '0 0 ' + width + ' ' + height, xmlns: Idea.Util.SVGNS});
	this.scrollbar.style["vertical-align"] = 'top';

	this.defs = Idea.Util.createSVGElement(this.scrollbar, 'defs', {});
	this.arrowTip = Idea.Util.createSVGElement(this.defs, 'marker', {id: "arrowTip", 
																		  viewBox: "0 0 10 10", 
																		  refX:"0", refY:"5",
																		  markerUnits: "strokeWidth",
																		  markerWidth: "12",
																		  markerHeight: "9",
																		  orient: "auto"});
	Idea.Util.createSVGElement(this.arrowTip, 'path', {d: "M 0 0 L 10 5 L 0 10", fill: "none", stroke:"#c0c0c0", "stroke-linecap":"square", "stroke-linejoin":"round", style:"box-shadow: 0 0 5px white;"});

	/*
	// innerShadow/innerGlow filter implementation takes helluva lot of code. Stolen from:
	// https://gist.github.com/archana-s/8947217, which seems to be creatively stolen from:
	// http://www.xanthir.com/b4Yv0
	this.innerGlow = Idea.Util.createSVGElement(this.defs, 'filter', {id: "innerGlow"});
	Idea.Util.createSVGElement(this.innerGlow, 'feGaussianBlur', {stdDeviation:"2", result:"blur"});
	Idea.Util.createSVGElement(this.innerGlow, 'feComposite', {'in2':"SourceAlpha", operator:"arithmetic", k2:"-1", k3:"1", result:"shadow"})
	Idea.Util.createSVGElement(this.innerGlow, 'feFlood', {"flood-color":"rgb(255, 255, 255)", "flood-opacity":"0.75", result:"color"});
	Idea.Util.createSVGElement(this.innerGlow, 'feComposite', {'in2':"shadow", operator:"in"});
	Idea.Util.createSVGElement(this.innerGlow, 'feComposite', {'in2':"SourceGraphic", operator:"over"});
	*/

	// scrollbar's buttons with arrow labels: the arrow's line is invisible, but the marker at the tip is auto-oriented with lines help
	var sliderCoord;
	if (this.vertical) sliderCoord = parseInt(y + 20 + (windowCoord - scrollableMin) / (scrollableMax - scrollableMin) * (height-2*20));
	else sliderCoord = parseInt(x + 20 + (windowCoord - scrollableMin) / (scrollableMax - scrollableMin) * (width-2*20));

	if (this.vertical) {
		this.backwardButton = Idea.Util.createSVGElement(this.scrollbar, 'rect', {x:0, y:0, width:width, height:20, fill:"#31353c"});
		this.backwardButton.id = "backwardButton";
		this.backwardArrow = Idea.Util.createSVGElement(this.scrollbar, 'line', {x1:parseInt(width/2), y1:17, x2:parseInt(width/2), y2:16,  "marker-end":"url(#arrowTip)", "stroke-width":"1", stroke:"#6f788a", "stroke-opacity": 0});
		this.forwardButton = Idea.Util.createSVGElement(this.scrollbar, 'rect', {x:0, y:height-20, width:width, height:20, fill:"#31353c"});
		this.forwardButton.id = "forwardButton";		
		this.forwardArrow = Idea.Util.createSVGElement(this.scrollbar, 'line', {x1:parseInt(width/2), y1:height-17, x2:parseInt(width/2), y2: height-16, "marker-end":"url(#arrowTip)", "stroke-width":"1", stroke:"#6f788a", "stroke-opacity": 0});
		this.trough = Idea.Util.createSVGElement(this.scrollbar, 'g', {});
		this.rail = Idea.Util.createSVGElement(this.trough, 'rect', {x:0, y:20, width:width, height:height-40, fill:"#6f788a"}); // this is the clickable part of scrollbar, where the slider moves

		var sliderHeight = parseInt( this.windowSize / (scrollableMax - scrollableMin) * (height - 2*20) );
		this._slider = Idea.Util.createSVGElement(this.trough, 'rect', {x:0, y:sliderCoord, width:width, height: sliderHeight, fill:"#31353c", stroke:"#808080", rx:"10", ry:"10"}); // this is the draggable slider, which scrolls the element, associated with scrollbar
		this._slider.id = "slider";

		this._sliderMin = sliderCoord;
		this._sliderMax = sliderCoord + sliderHeight;
		// filter:"url(#innerGlow)"		
	}
	else {
		this.backwardButton = Idea.Util.createSVGElement(this.scrollbar, 'rect', {x:0, y:0, width:20, height:height, fill:"#31353c"});
		this.backwardButton.id = "backwardButton";		
		this.backwardArrow = Idea.Util.createSVGElement(this.scrollbar, 'line', {x1:17, y1:parseInt(height/2), x2:16, y2:parseInt(height/2),  "marker-end":"url(#arrowTip)", "stroke-width":"1", stroke:"#6f788a", "stroke-opacity": 0});
		this.forwardButton = Idea.Util.createSVGElement(this.scrollbar, 'rect', {x:width-20, y:0, width:20, height:height, fill:"#31353c"});
		this.forwardButton.id = "forwardButton";
		this.forwardArrow = Idea.Util.createSVGElement(this.scrollbar, 'line', {x1:width-17, y1:parseInt(height/2), x2:width-16, y2:parseInt(height/2), "marker-end":"url(#arrowTip)", "stroke-width":"1", stroke:"#6f788a", "stroke-opacity": 0});
		this.trough = Idea.Util.createSVGElement(this.scrollbar, 'g', {});
		this.rail = Idea.Util.createSVGElement(this.trough, 'rect', {x:20, y:0, width:width-40, height:height, fill:"#6f788a"}); // this is the clickable part of scrollbar, where the slider moves

		var sliderWidth = parseInt( this.windowSize / (scrollableMax - scrollableMin) * (width - 2*20) );
		this._slider = Idea.Util.createSVGElement(this.trough, 'rect', {x:sliderCoord, y:0, width: sliderWidth, height:height, fill:"#31353c", stroke:"#808080", rx:"10", ry:"10"}); // this is the draggable slider, which scrolls the element, associated with scrollbar
		this._slider.id = "slider";

		this._sliderMin = sliderCoord;
		this._sliderMax = sliderCoord + sliderWidth;
		// filter:"url(#innerGlow)"
	}

	this.rail.addEventListener("mousedown", this.railClickHandler.bind(this));
	this._slider.addEventListener("mousedown", this.sliderMouseDownHandler.bind(this));
	this.forwardButton.addEventListener("mousedown", this.forwardButtonMouseDownHandler.bind(this));
	this.backwardButton.addEventListener("mousedown", this.backwardButtonMouseDownHandler.bind(this));
}

Scrollbar.prototype = {
	/**
	 *
	 * This gets or sets scrollbar's slider coordinates (in father coordinates).
	 * @method
	 * @memberof Scrollbar
	 * @param value {Object} slider coordinates e.g. {min: {float}, max: {float}}
	 * @returns {Object} slider coordinates e.g. {min: -10, max: 50}
	 *
	 */
	slider: function(value){
		if (value !== undefined){ // if setter
			this.sliderValidator(value);
			value.min = parseFloat(value.min); // convert to float
			value.max = parseFloat(value.max); // convert to float

			Idea.Util.callObservers(this, "slider", value); // notify the observers of change

			// modify view according to model
			if (this.vertical) {
				this._slider.setAttribute("y", value.min);
				this._slider.setAttribute("height", value.max - value.min);
			}
			else {
				this._slider.setAttribute("x", value.min);
				this._slider.setAttribute("width", value.max - value.min);
			}

			this._sliderMin = value.min;
			this._sliderMax = value.max;
		}

		else value = {min: this._sliderMin, max: this._sliderMax}; // if getter
		return value
	},

	sliderValidator: function(value){
		if (typeof value !== 'object') throw TypeError("value is expected to be a float, got: " + typeof value + "!");

		if (value.min === undefined) throw TypeError("slider min is undefined!");
		else {
			if (isNaN(parseFloat(value.min))) throw TypeError();
		}

		if (value.max === undefined) throw TypeError("slider max is undefined!");
		else {
			if (isNaN(parseFloat(value.min))) throw TypeError("slider max is expected to be a number, got: " + value + "!");
		}

	},

	/**
     * This is getter for scrollbar's rail minimal coordinate in scrollbar.father's canvas coordinates. 
     * If scrollbar is vertical, this is y coordinate, if horizontal - x coordinate.	 
	 *
     * @method
     * @memberof Scrollbar
     * @returns {int} coordinates of beginning of the scrollbar's rail in father's canvas coordinates.
	 *
	 */
	railMin: function(){
		if (this.vertical) return parseInt(this.rail.getAttribute("y"));
		else return parseInt(this.rail.getAttribute("x"));
	},

	/**
     * This is getter for scrollbar's rail maximal coordinate in scrollbar.father's canvas coordinates. 
     * If scrollbar is vertical, this is y coordinate, if horizontal - x coordinate.
     *	
     * @method
     * @memberof Scrollbar
     * @returns {int} coordinates of ending of the scrollbar's rail in father's canvas coordinates.
	 *
	 */
	railMax: function(){
		var size;
		if (this.vertical) size = parseInt(this.rail.getAttribute("height"));
		else size = parseInt(this.rail.getAttribute("width"));
		return this.railMin() + size;
	},

	/**
	 * This event handler moves scrollbar's slider start to the position on the rail, where click occured.
	 * Slider is not resized. If click is too close to the end of the rail for the whole slider to fit in,
	 * it just docks slider to the end of the rail without resizing it.
	 *
	 * @method
	 * @member of Scollbar
	 */

	railClickHandler: function(e){
		e.preventDefault();
		e.stopPropagation();

		var event = Idea.Util.normalizeMouseEvent(e);
		if (event.which != 1) return; // check that it's left mouse button, else ignore event		
		var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.scrollbar);

		var sliderSize = this.slider().max - this.slider().min;

		var newSliderMin; // get coordinates of new slider position from the event
		if (this.vertical) newSliderMin = canvasCoords.y;
		else newSliderMin = canvasCoords.x;

		// If click is too close to the end of rail to fit the whole slider size,
		// just dock the slider to the end of the rail without changing its size.
		if (newSliderMin + sliderSize > this.railMax()) this.slider( {min: this.railMax() - sliderSize, max: this.railMax()} );
		else this.slider( {min: newSliderMin, max: newSliderMin + sliderSize} );
	},

	sliderMouseDownHandler: function(e){
		e.preventDefault();
		e.stopPropagation();

		var event = Idea.Util.normalizeMouseEvent(e);
		if (event.which != 1) return; // check that it's left mouse button, else ignore event

		var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.scrollbar);
		var coord;
		if (this.vertical) {coord = canvasCoords.y;}
		else {coord = canvasCoords.x;}

		var slider = this.slider();

		// TODO block scaling
		// TODO block mousewheel

		// check if it is on slider middle or edge - whether we move slider or resize it
		if ( Math.abs(coord - slider.min) / (slider.max - slider.min) <= 0.2){ // this is near minimum edge - resize slider
			// obj, eventType, listener, useCapture, thisArg, argumentsList
			Idea.Util.addEventListener(window, 'mouseup', this.sliderMinResizeMouseUpHandler, false, this, []);
			Idea.Util.addEventListener(window, 'mousemove', this.sliderMinResizeMouseMoveHandler, false, this, [])
		}
		else if ( Math.abs(coord - slider.max) / (slider.max - slider.min) <= 0.2 ) { // this is near maximum edge - resize slider
			Idea.Util.addEventListener(window, 'mouseup', this.sliderMaxResizeMouseUpHandler, false, this, []);
			Idea.Util.addEventListener(window, 'mousemove', this.sliderMaxResizeMouseMoveHandler, false, this, []);
		}
		else { // if middle
			// attach mouse handlers to window, not document.documentElement (representing <html>)
			// or mouse events beyond the browser window will be lost
			Idea.Util.addEventListener(window, 'mouseup', this.sliderDragMouseUpHandler, false, this, []);
			Idea.Util.addEventListener(window, 'mousemove', this.sliderDragMouseMoveHandler, false, this, []);

			// remember the offset of click on the slider so that we know, where the click occurred
			this.sliderClickOffset = coord - slider.min; // WARNING: we assume here that scrollbar wasn't transformed (rotated/shifted etc.)						
		}

	},
	sliderDragMouseMoveHandler: function(e){
		e.preventDefault();
		e.stopPropagation();

		var event = Idea.Util.normalizeMouseEvent(e);

		var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.scrollbar);
		var coord;
		if (this.vertical) {coord = canvasCoords.y;}
		else {coord = canvasCoords.x;}

		var railSize = this.railMax() - this.railMin();
		var slider = this.slider();
		var sliderSize = slider.max - slider.min;

		// delta is difference of slider location relative to click location, all in canvas coordinates
		var delta = coord - (slider.min + this.sliderClickOffset);

		// if slider reached the beginning or ending of the trough
		if (delta > railSize - (slider.min - this.railMin()) - sliderSize) {
			delta = railSize - (slider.min - this.railMin()) - sliderSize;
		}
		else if (delta < this.railMin() - slider.min) {
			delta = this.railMin() - slider.min;
		}

		this.slider({min: slider.min + delta, max: slider.min + delta + sliderSize});
	},

	sliderDragMouseUpHandler: function(e){
		var event = Idea.Util.normalizeMouseEvent(e);
		if (event.which != 1) return; // check that it's left mouse button, else ignore event

		e.preventDefault();
		e.stopPropagation();

		Idea.Util.removeEventListener(window, 'mouseup', this.sliderDragMouseUpHandler, false, this, []);
		Idea.Util.removeEventListener(window, 'mousemove', this.sliderDragMouseMoveHandler, false, this, []);

		delete this.sliderClickOffset;

		// TODO unblock scaling
		// TODO unblock mousewheel
	},

	sliderMinResizeMouseUpHandler: function(e){
		e.preventDefault();

		Idea.Util.removeEventListener(window, 'mouseup', this.sliderMinResizeMouseUpHandler, false, this, []);
		Idea.Util.removeEventListener(window, 'mousemove', this.sliderMinResizeMouseMoveHandler, false, this, []);

		// TODO unblock scaling, mousewheel
	},

	sliderMinResizeMouseMoveHandler: function(e){
		e.preventDefault();

		var event = Idea.Util.normalizeMouseEvent(e);
		var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.scrollbar);
		var coord;
		if (this.vertical) {coord = canvasCoords.y;}
		else {coord = canvasCoords.x;}
		var slider = this.slider();

		if (coord < this.railMin()) { // sliderMin shouldn't be less than railMin
			coord = this.railMin();
		} 
		else if (coord >= slider.max - Idea.Conf.minimalSliderSize) { // sliderMin shouldn't be too close to sliderMax
			coord = slider.max - Idea.Conf.minimalSliderSize;
		}
		
		this.slider({min:coord, max:slider.max});
	},

	sliderMaxResizeMouseUpHandler: function(e){
		e.preventDefault();

		Idea.Util.removeEventListener(window, 'mouseup', this.sliderMaxResizeMouseUpHandler, false, this, []);
		Idea.Util.removeEventListener(window, 'mousemove', this.sliderMaxResizeMouseMoveHandler, false, this, []);

		// TODO unblock scaling, mousewheel
	},

	sliderMaxResizeMouseMoveHandler: function(e){
		e.preventDefault();

		var event = Idea.Util.normalizeMouseEvent(e);
		var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.scrollbar);
		var coord;
		if (this.vertical) {coord = canvasCoords.y;}
		else {coord = canvasCoords.x;}
		var slider = this.slider();

		if (coord > this.railMax()) { // sliderMax shouldn't be greater than railMax
			coord = this.railMax();
		} 
		else if (coord <= slider.min + Idea.Conf.minimalSliderSize) { // sliderMin shouldn't be too close to sliderMax
			coord = slider.min + Idea.Conf.minimalSliderSize;
		}
		
		this.slider({min: slider.min, max: coord});
	},

	scrollableResizeHandler: function(e){

	},

	forwardButtonMouseDownHandler: function(e){
		e.preventDefault();
		var event = Idea.Util.normalizeMouseEvent(e);
		if (event.which != 1) return; // check that it's left mouse button, else ignore event
		// change appearance
		// block mousewheel

		// button should continue scrolling, while you press the mouse button and keep pointer over it
		Idea.Util.addEventListener(window, 'mouseup', this.forwardButtonMouseUpHandler, false, this, []);
		Idea.Util.addEventListener(this.forwardButton, 'mouseenter', this.forwardButtonMouseEnterHandler, false, this, []);
		Idea.Util.addEventListener(this.forwardButton, 'mouseout', this.forwardButtonMouseOutHandler, false, this, []);

		this.scrollForward();
		this.scrollForwardInterval = setInterval(this.scrollForward.bind(this), 50);
	},

	forwardButtonMouseOutHandler: function(e){
		clearInterval(this.scrollForwardInterval);
		delete this.scrollForwardInterval;
	},

	forwardButtonMouseEnterHandler: function(e){
		this.scrollForwardInterval = setInterval(this.scrollForward.bind(this), 50);
	},	

	forwardButtonMouseUpHandler: function(e){
		clearInterval(this.scrollForwardInterval);
		delete this.scrollForwardInterval;

		// TODO unblock mousewheel
		// TODO change appearance

		Idea.Util.removeEventListener(window, 'mouseup', this.forwardButtonMouseUpHandler, false, this, []);
		Idea.Util.removeEventListener(this.forwardButton, 'mouseenter', this.forwardButtonMouseEnterHandler, false, this, []);
		Idea.Util.removeEventListener(this.forwardButton, 'mouseout', this.forwardButtonMouseOutHandler, false, this, []);
	},

	backwardButtonMouseDownHandler: function(e){
		e.preventDefault();
		var event = Idea.Util.normalizeMouseEvent(e);
		if (event.which != 1) return; // check that it's left mouse button, else ignore event

		// TODO change appearance
		// TODO block mousewheel

		// button should continue scrolling, while you press the mouse button and keep pointer over it
		Idea.Util.addEventListener(window, 'mouseup', this.backwardButtonMouseUpHandler, false, this, []);
		Idea.Util.addEventListener(this.backwardButton, 'mouseenter', this.backwardButtonMouseEnterHandler, false, this, []);
		Idea.Util.addEventListener(this.backwardButton, 'mouseout', this.backwardButtonMouseOutHandler, false, this, []);

		this.scrollBackward();
		this.scrollBackwardInterval = setInterval(this.scrollBackward.bind(this), 50);

	},

	backwardButtonMouseOutHandler: function(e){
		clearInterval(this.scrollBackwardInterval);
		delete this.scrollBackwardInterval;
	},

	backwardButtonMouseEnterHandler: function(e){
		this.scrollBackwardInterval = setInterval(this.scrollBackward.bind(this), 50);
	},

	backwardButtonMouseUpHandler: function(e){
		clearInterval(this.scrollBackwardInterval);
		delete this.scrollBackwardInterval;

		// TODO unblock mousewheel
		// TODO change appearance

		Idea.Util.removeEventListener(window, 'mouseup', this.backwardButtonMouseUpHandler, false, this, []);
		Idea.Util.removeEventListener(this.backwardButton, 'mouseenter', this.backwardButtonMouseEnterHandler, false, this, []);
		Idea.Util.removeEventListener(this.backwardButton, 'mouseout', this.backwardButtonMouseOutHandler, false, this, []);		

	},

	// we should also listen to zoom-in/zoom-out events of the scrollable area
	scrollForward: function(){
		var railSize = this.railMax() - this.railMin();
		var sliderSize = this.slider().max - this.slider().min;

		if (this.slider().min - this.railMin() + sliderSize + this.scrollSize > railSize) this.slider({min: this.railMin() + railSize - sliderSize, max: this.railMin() + railSize});
		else this.slider({min: this.slider().min + this.scrollSize, max: this.slider().max + this.scrollSize});
	},

	scrollBackward: function(){
		var sliderSize = this.slider().max - this.slider().min;

		if (this.slider().min - this.railMin() - this.scrollSize < 0) this.slider({min: this.railMin(), max: this.railMin() + sliderSize});
		else this.slider({min: this.slider().min - this.scrollSize, max: this.slider().max - this.scrollSize});
	},

	pageForward: function(){},

	pageBackward: function(){},

};

Idea.prototype.Scrollbar = Scrollbar;
})();