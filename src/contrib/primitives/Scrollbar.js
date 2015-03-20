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
 * @param father {DOMObject} - an <svg> dom node to put the scrollbar into
 * @param scrollable - an Idea.Scrollable object, scrolled by this scrollbar
 * @param x
 * @param y
 * @param width
 * @param height
 * @param vertical {boolean} - if the srollbar is vertical or horizontal
 */

// to add handler function from html scriptmelement in an inner svg, say
// onclick='top.handler_name(evt)'

// this is old style of events creation
var pageBackward = document.createEvent("CustomEvent");
// see https://developer.mozilla.org/en-US/docs/Web/API/document.createEvent
pageBackward.initCustomEvent('pageBackward', true, true, {}); //type, bubbles, cancelable, detail
window.dispatchEvent(pageBackward);

//TODO msie fireEvent

var Scrollbar = function(father, scrollable, x, y, width, height, vertical, sliderStart, sliderSize, scrollSize, pageSize){
	this.father = father;
	this.scrollable = scrollable; // TODO: remove this scrollable, instead completely rely on events?
	this.vertical = vertical;

	if (scrollSize) this.scrollSize = scrollSize; // TODO: validator
	else {
		if (vertical) this.scrollSize = height/100;
		else this.scrollSize = width/100;
	}
	console.log("scrollSize = " + this.scrollSize);	
	if (pageSize) this.pageSize = pageSize;
	else {
		if (vertical) this.pageSize = height/5;
		else this.pageSize = height/5;
	}

	this.scrollbar = Idea.Util.createSVGElement(father, 'svg', {x: x, y: y, width: width, height: height, viewBox: '0 0 ' + width + ' ' + height, xmlns: Idea.Util.SVGNS});

	this.defs = Idea.Util.createSVGElement(this.scrollbar, 'defs', {});
	this.arrowTip = Idea.Util.createSVGElement(this.defs, 'marker', {id: "arrowTip", 
																		  viewBox: "0 0 10 10", 
																		  refX:"0", refY:"5",
																		  markerUnits: "strokeWidth",
																		  markerWidth: "12",
																		  markerHeight: "9",
																		  orient: "auto"});
	Idea.Util.createSVGElement(this.arrowTip, 'path', {d: "M 0 0 L 10 5 L 0 10", fill: "none", stroke:"#c0c0c0", "stroke-linecap":"square", "stroke-linejoin":"round", style:"box-shadow: white;"});

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
	if (this.vertical) {
		this.backwardButton = Idea.Util.createSVGElement(this.scrollbar, 'rect', {x:0, y:0, width:width, height:20, fill:"#31353c"});
		this.backwardArrow = Idea.Util.createSVGElement(this.scrollbar, 'line', {x1:parseInt(width/2), y1:17, x2:parseInt(width/2), y2:16,  "marker-end":"url(#arrowTip)", "stroke-width":"1", stroke:"#6f788a", "stroke-opacity": 0});
		this.forwardButton = Idea.Util.createSVGElement(this.scrollbar, 'rect', {x:0, y:height-20, width:width, height:20, fill:"#31353c"});
		this.forwardArrow = Idea.Util.createSVGElement(this.scrollbar, 'line', {x1:parseInt(width/2), y1:height-17, x2:parseInt(width/2), y2: height-16, "marker-end":"url(#arrowTip)", "stroke-width":"1", stroke:"#6f788a", "stroke-opacity": 0});
		this.trough = Idea.Util.createSVGElement(this.scrollbar, 'g', {});
		this.rail = Idea.Util.createSVGElement(this.trough, 'rect', {x:0, y:20, width:width, height:height-40, fill:"#6f788a"}); // this is the clickable part of scrollbar, where the slider moves
		this.slider = Idea.Util.createSVGElement(this.trough, 'rect', {x:0, y:22, width:width, height:40, fill:"#31353c", stroke:"#808080", rx:"10", ry:"10"}); // this is the draggable slider, which scrolls the element, associated with scrollbar
		// filter:"url(#innerGlow)"		
	}
	else {
		this.backwardButton = Idea.Util.createSVGElement(this.scrollbar, 'rect', {x:0, y:0, width:20, height:height, fill:"#31353c"});
		this.backwardArrow = Idea.Util.createSVGElement(this.scrollbar, 'line', {x1:17, y1:parseInt(height/2), x2:16, y2:parseInt(height/2),  "marker-end":"url(#arrowTip)", "stroke-width":"1", stroke:"#6f788a", "stroke-opacity": 0});
		this.forwardButton = Idea.Util.createSVGElement(this.scrollbar, 'rect', {x:width-20, y:0, width:20, height:height, fill:"#31353c"});
		this.forwardArrow = Idea.Util.createSVGElement(this.scrollbar, 'line', {x1:width-17, y1:parseInt(height/2), x2:width-16, y2:parseInt(height/2), "marker-end":"url(#arrowTip)", "stroke-width":"1", stroke:"#6f788a", "stroke-opacity": 0});
		this.trough = Idea.Util.createSVGElement(this.scrollbar, 'g', {});
		this.rail = Idea.Util.createSVGElement(this.trough, 'rect', {x:20, y:0, width:width-40, height:height, fill:"#6f788a"}); // this is the clickable part of scrollbar, where the slider moves
		this.slider = Idea.Util.createSVGElement(this.trough, 'rect', {x:22, y:0, width:40, height:height, fill:"#31353c", stroke:"#808080", rx:"10", ry:"10"}); // this is the draggable slider, which scrolls the element, associated with scrollbar
		// filter:"url(#innerGlow)"

	}

	this.rail.addEventListener("mousedown", this.railClickHandler.bind(this));
	this.slider.addEventListener("mousedown", this.sliderMouseDownHandler.bind(this));
	this.forwardButton.addEventListener("mousedown", this.forwardButtonMouseDownHandler.bind(this));
	this.backwardButton.addEventListener("mousedown", this.backwardButtonMouseDownHandler.bind(this));
}

Scrollbar.prototype = {
	railClickHandler: function(e){
		e.preventDefault();
		e.stopPropagation();

		var event = Idea.Util.normalizeMouseEvent(e);
		var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.scrollbar);

		var railX = parseInt(this.rail.getAttribute("x"));
		var railY = parseInt(this.rail.getAttribute("y"));
		var railHeight = parseInt(this.rail.getAttribute("height"));		
		var railWidth = parseInt(this.rail.getAttribute("width"));		
		var sliderHeight = parseInt(this.slider.getAttribute("height"));
		var sliderWidth = parseInt(this.slider.getAttribute("width"));

		if (this.vertical){
			if (canvasCoords.y + sliderHeight > railY + railHeight) this.slider.setAttribute("y", railY + railHeight - sliderHeight);
			else this.slider.setAttribute("y", canvasCoords.y);
		}
		else {
			if (canvasCoords.x + sliderWidth > railX + railWidth) this.slider.setAttribute("x", railX + railWidth - sliderWidth);
			else this.slider.setAttribute("x", canvasCoords.x);
		}

		var sliderX = parseInt(this.slider.getAttribute("x"));
		var sliderY = parseInt(this.slider.getAttribute("y"));
		var viewBox = this.scrollable.viewBox();
		if (this.vertical) viewBox.y = parseInt((sliderY - railY) / railHeight * Idea.Conf.canvasHeight - Idea.Conf.canvasHeight/2);
		else viewBox.x = parseInt((sliderX - railX) / railWidth * Idea.Conf.canvasWidth - Idea.Conf.canvasWidth/2);
		this.scrollable.viewBox(viewBox);
	},
	sliderMouseDownHandler: function(e){
		e.preventDefault();
		e.stopPropagation();

		var event = Idea.Util.normalizeMouseEvent(e);
		if (event.which != 1) return; // check that it's left mouse button, else ignore event

		// block scaling
		// block mousewheel

		// check if it is on slider middle or edge - whether we move slider or resize it
		if (true) {// if middle

			// attach mouse handlers to window, not document.documentElement (representing <html>)
			// or mouse events beyond the browser window will be lost
			this._bindedMouseUpHandler = this.sliderDragMouseUpHandler.bind(this);
			this._bindedMouseMoveHandler = this.sliderDragMouseMoveHandler.bind(this);
			window.addEventListener('mouseup', this._bindedMouseUpHandler, false);
			window.addEventListener('mousemove', this._bindedMouseMoveHandler, false);

			// remember the offset of click on the slider so that we know, where the click occurred
			var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.scrollbar);
			if (this.vertical) {
				this.sliderClickOffset = canvasCoords.y - parseInt(this.slider.getAttribute("y")); // WARNING: we assume here that scrollbar wasn't transformed (rotated/shifted etc.)
			}
			else {
				this.sliderClickOffset = canvasCoords.x - parseInt(this.slider.getAttribute("x")); // WARNING: we assume here that scrollbar wasn't transformed (rotated/shifted etc.)
			}
		}
		else { // if edge

		} 
		
	},
	sliderDragMouseMoveHandler: function(e){
		var delta; // difference of slider location relative to click location, all in canvas coordinates

		e.preventDefault();

		var event = Idea.Util.normalizeMouseEvent(e);
		var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.scrollbar);
		//console.log("canvasCoords in MouseMove = " + JSON.stringify(canvasCoords));

		var sliderX = parseInt(this.slider.getAttribute("x"));
		var sliderY = parseInt(this.slider.getAttribute("y"));
		var sliderWidth = parseInt(this.slider.getAttribute("width"));
		var sliderHeight = parseInt(this.slider.getAttribute("height"));
		var railX = parseInt(this.rail.getAttribute("x"));
		var railY = parseInt(this.rail.getAttribute("y"));
		var railWidth = parseInt(this.rail.getAttribute("width"));
		var railHeight = parseInt(this.rail.getAttribute("height"));

		//console.log("sliderX = " + sliderX, "sliderY = " + sliderY, "sliderWidth = " + sliderWidth, "sliderHeight = " + sliderHeight);
		//console.log("railX = " + railX, "railY = " + railY, "railWidth = " + railWidth, "railHeight = " + railHeight);

		// calculate delta
		if (this.vertical) {
			delta = canvasCoords.y - (sliderY + this.sliderClickOffset);
		}
		else {
			delta = canvasCoords.x - (sliderX + this.sliderClickOffset);
		}

		//console.log("delta before boundary = "+  delta);
		//console.log("delta upper boundary = " + (railHeight - (sliderY - railY) - sliderHeight), ", lower boundary = " + (railY - sliderY));

		// if slider reached the beginning or ending of the trough
		if (this.vertical){
			if (delta > railHeight - (sliderY - railY) - sliderHeight) {
				delta = railHeight - (sliderY - railY) - sliderHeight;
			}
			else if (delta < railY - sliderY) {
				delta = railY - sliderY;
			}

			this.slider.setAttribute("y", sliderY + delta); // move slider
		}
		else {
			if (delta > railWidth - (sliderX - railX) - sliderWidth) {
				delta = railWidth - (sliderX - railX) - sliderWidth;
			}
			else if (delta < railX - sliderX){
				delta = railX - sliderX;
			}

			this.slider.setAttribute("x", sliderX + delta); // redraw slider
		}

		var viewBox = this.scrollable.viewBox();
		if (this.vertical) viewBox.y = parseInt((sliderY - railY) / railHeight * Idea.Conf.canvasHeight - Idea.Conf.canvasHeight/2);
		else viewBox.x = parseInt((sliderX - railX) / railWidth * Idea.Conf.canvasWidth - Idea.Conf.canvasWidth/2);
		this.scrollable.viewBox(viewBox);
		//console.log("delta = " + delta);
	},
	sliderDragMouseUpHandler: function(e){
		e.preventDefault();

		if (window.removeEventListener){ // modern browsers use removeEventListener
			window.removeEventListener('mouseup', this._bindedMouseUpHandler);
			window.removeEventListener('mousemove', this._bindedMouseMoveHandler);
		}
		else if (window.detachEvent){ // ie8- use detachEvent
			window.detachEvent('mouseup', this._bindedMouseUpHandler);
			window.detachEvent('mousemove', this._bindedMouseMoveHandler);
		}

		delete this._bindedMouseUpHandler;
		delete this._bindedMouseMoveHandler;
		delete this.sliderClickOffset;

		// TODO unblock scaling
		// TODO unblock mousewheel
	},
	sliderResizeHandler: function(e){},
	scrollableResizeHandler: function(e){},
	forwardButtonMouseDownHandler: function(e){
		e.preventDefault();
		var event = Idea.Util.normalizeMouseEvent(e);
		if (event.which != 1) return; // check that it's left mouse button, else ignore event
		// change appearance
		// block mousewheel

		// button should continue scrolling, while you press the mouse button and keep pointer over it
		this._bindedForwardButtonMouseUpHandler = this.forwardButtonMouseUpHandler.bind(this);
		this._bindedForwardButtonMouseEnterHandler = this.forwardButtonMouseEnterHandler.bind(this);
		this._bindedForwardButtonMouseOutHandler = this.forwardButtonMouseOutHandler.bind(this);

		window.addEventListener('mouseup', this._bindedForwardButtonMouseUpHandler, false);
		this.forwardButton.addEventListener('mouseenter', this._bindedForwardButtonMouseEnterHandler, false);
		this.forwardButton.addEventListener('mouseout', this._bindedForwardButtonMouseOutHandler, false);

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
		// unblock mousewheel
		// change appearance

		if (window.removeEventListener){ // modern browsers use removeEventListener
			window.removeEventListener('mouseup', this._bindedForwardButtonMouseUpHandler);
			this.forwardButton.removeEventListener('mouseenter', this._bindedForwardButtonMouseEnterHandler);
			this.forwardButton.removeEventListener('mouseout', this._bindedForwardButtonMouseOutHandler);
		}
		else if (window.detachEvent){ // ie8- use detachEvent
			window.detachEvent('mouseup', this._bindedForwardButtonMouseUpHandler);
			this.forwardButton.detachEvent('mouseenter', this._bindedForwardButtonMouseEnterHandler);
			this.forwardButton.detachEvent('mouseout', this._bindedForwardButtonMouseOutHandler);
		}

		delete this._bindedForwardButtonMouseUpHandler;
		delete this._bindedForwardButtonMouseOutHandler;
		delete this._bindedForwardButtonMouseEnterHandler;
	},
	backwardButtonMouseDownHandler: function(e){
		e.preventDefault();
		var event = Idea.Util.normalizeMouseEvent(e);
		if (event.which != 1) return; // check that it's left mouse button, else ignore event
		// change appearance
		// block mousewheel

		// button should continue scrolling, while you press the mouse button and keep pointer over it
		this._bindedBackwardButtonMouseUpHandler = this.backwardButtonMouseUpHandler.bind(this);
		this._bindedBackwardButtonMouseEnterHandler = this.backwardButtonMouseEnterHandler.bind(this);
		this._bindedBackwardButtonMouseOutHandler = this.backwardButtonMouseOutHandler.bind(this);

		window.addEventListener('mouseup', this._bindedBackwardButtonMouseUpHandler, false);
		this.backwardButton.addEventListener('mouseenter', this._bindedBackwardButtonMouseEnterHandler, false);
		this.backwardButton.addEventListener('mouseout', this._bindedBackwardButtonMouseOutHandler, false);

		this.scrollBackward();
		this.scrollBackwardInterval = setInterval(this.scrollBackward.bind(this), 50);

	},
	backwardButtonMouseOutHandler: function(e){
		clearInterval(this.scrollBackwardInterval);
		delete this.scrollForwardInterval;
	},
	backwardButtonMouseEnterHandler: function(e){
		this.scrollForwardInterval = setInterval(this.scrollBackward.bind(this), 50);
	},
	backwardButtonMouseUpHandler: function(e){
		clearInterval(this.scrollBackwardInterval);
		delete this.scrollBackwardInterval;
		// unblock mousewheel
		// change appearance

		if (window.removeEventListener){ // modern browsers use removeEventListener
			window.removeEventListener('mouseup', this._bindedBackwardButtonMouseUpHandler);
			this.backwardButton.removeEventListener('mouseenter', this._bindedBackwardButtonMouseEnterHandler);
			this.backwardButton.removeEventListener('mouseout', this._bindedBackwardButtonMouseOutHandler);
		}
		else if (window.detachEvent){ // ie8- use detachEvent
			window.detachEvent('mouseup', this._bindedBackwardButtonMouseUpHandler);
			this.backwardButton.detachEvent('mouseenter', this._bindedBackwardButtonMouseEnterHandler);
			this.backwardButton.detachEvent('mouseout', this._bindedBackwardButtonMouseOutHandler);
		}

		delete this._bindedBackwardButtonMouseUpHandler;
		delete this._bindedBackwardButtonMouseOutHandler;
		delete this._bindedBackwardButtonMouseEnterHandler;
	},
	pageBackwardEvent: new CustomEvent("pageBackward", {detail: {}, bubbles: true, cancelable: true}),
	pageForwardEvent: new CustomEvent("pageForward", {detail: {}, bubbles: true, cancelable: true}),
	scrollForwardEvent: new CustomEvent("scrollForward", {detail: {}, bubbles: true, cancelable: true}),
	scrollBackwardEvent: new CustomEvent("scrollBackward", {detail: {}, bubbles: true, cancelable: true}),
	scrollToEvent: new CustomEvent("scrollTo", {detail: {to:0.0-1.0}, bubbles: true, cancelable: true}),
	extendSliderEvent: new CustomEvent("extendSlide", {detail: {}, bubbles: true, cancelable: true}),
	contractSliderEvent: new CustomEvent("contractSlider", {detail: {}, bubbles: true, cancelable: true}),
	// we should also listen to zoom-in/zoom-out events of the scrollable area
	scrollForward: function(){
		var sliderX = parseInt(this.slider.getAttribute("x"));
		var sliderY = parseInt(this.slider.getAttribute("y"));
		var sliderWidth = parseInt(this.slider.getAttribute("width"));
		var sliderHeight = parseInt(this.slider.getAttribute("height"));
		var railX = parseInt(this.rail.getAttribute("x"));
		var railY = parseInt(this.rail.getAttribute("y"));		
		var railWidth = parseInt(this.rail.getAttribute("width"));
		var railHeight = parseInt(this.rail.getAttribute("height"));		

		if (this.vertical){
			if (sliderY - railY + sliderHeight + this.scrollSize > railHeight) this.slider.setAttribute("y", railY + railHeight - sliderHeight);
			else this.slider.setAttribute("y", sliderY + this.scrollSize); // move slider
		}
		else {
			if (sliderX - railX + sliderWidth + this.scrollSize > railWidth) this.slider.setAttribute("x", railX + railWidth - sliderWidth);
			else this.slider.setAttribute("x", sliderX + this.scrollSize); // move slider
		}

		var viewBox = this.scrollable.viewBox();
		if (this.vertical) viewBox.y = viewBox.y + this.scrollSize;
		else viewBox.x = viewBox.x + this.scrollSize;
		this.scrollable.viewBox(viewBox);
	},
	scrollBackward: function(){
		var sliderX = parseInt(this.slider.getAttribute("x"));
		var sliderY = parseInt(this.slider.getAttribute("y"));
		var railX = parseInt(this.rail.getAttribute("x"));
		var railY = parseInt(this.rail.getAttribute("y"));

		if (this.vertical){
			if (sliderY - railY - this.scrollSize < 0) this.slider.setAttribute("y", railY);
			else this.slider.setAttribute("y", sliderY - this.scrollSize); // move slider
		}
		else {
			if (sliderX - railX - this.scrollSize < 0) this.slider.setAttribute("x", railX);
			else this.slider.setAttribute("x", sliderX - this.scrollSize); // move slider
		}

		var viewBox = this.scrollable.viewBox();
		if (this.vertical) viewBox.y = viewBox.y - this.scrollSize;
		else viewBox.x = viewBox.x - this.scrollSize;
		this.scrollable.viewBox(viewBox);
	},
	pageForward: function(){},
	pageBackward: function(){},
};

Idea.prototype.Scrollbar = Scrollbar;
})();