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

	if (scrollSize) this.scrollSize = scrollSize;
	else this.scrollSize = height/25;
	if (pageSize) this.pageSize = pageSize;
	else this.pageSize = height/5;

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
	this.backwardButton = Idea.Util.createSVGElement(this.scrollbar, 'rect', {x:0, y:0, width:width, height:20, fill:"#a0a0a0"});
	this.backwardArrow = Idea.Util.createSVGElement(this.scrollbar, 'line', {x1:parseInt(width/2), y1:17, x2:parseInt(width/2), y2:16,  "marker-end":"url(#arrowTip)", "stroke-width":"1", stroke:"#c0c0c0", "stroke-opacity": 0});
	this.forwardButton = Idea.Util.createSVGElement(this.scrollbar, 'rect', {x:0, y:height-20, width:width, height:20, fill:"#a0a0a0"});
	this.forwardArrow = Idea.Util.createSVGElement(this.scrollbar, 'line', {x1:parseInt(width/2), y1:height-17, x2:parseInt(width/2), y2: height-16, "marker-end":"url(#arrowTip)", "stroke-width":"1", stroke:"#c0c0c0", "stroke-opacity": 0});

	this.trough = Idea.Util.createSVGElement(this.scrollbar, 'g', {});
	this.padding = Idea.Util.createSVGElement(this.trough, 'rect', {x:0, y:20, width:width, height:height-40, fill:"#c0c0c0"}); // this is the clickable part of scrollbar, where the slider moves
	this.slider = Idea.Util.createSVGElement(this.trough, 'rect', {x:0, y:22, width:width, height:40, fill:"#a0a0a0", stroke:"#808080"}); // this is the draggable slider, which scrolls the element, associated with scrollbar
	// filter:"url(#innerGlow)"

	this.trough.addEventListener("mousedown", this.troughClickHandler.bind(this));
	this.slider.addEventListener("mousedown", this.sliderMouseDownHandler.bind(this));
	this.forwardButton.addEventListener("mousedown", this.forwardButtonMouseDownHandler.bind(this));
	this.backwardButton.addEventListener("mousedown", this.backwardButtonMouseDownHandler.bind(this));
}

Scrollbar.prototype = {
	troughClickHandler: function(e){
		e.preventDefault();
		e.stopPropagation();
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
			console.log("canvasCoords.x = " + canvasCoords.x, "canvasCoords.y = " + canvasCoords.y);
			if (this.vertical) {
				this.sliderClickOffset = canvasCoords.y - parseInt(this.slider.getAttribute("y")); // WARNING: we assume here that scrollbar wasn't transformed (rotated/shifted etc.)
			}
			else {
				this.sliderClickOffset = canvasCoords.x - parseInt(this.slider.getAttribute("x")); // WARNING: we assume here that scrollbar wasn't transformed (rotated/shifted etc.)
			}
		}
		else { // if edge

		} 
		console.log("sliderClickOffset = " + this.sliderClickOffset);
		
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
		var paddingX = parseInt(this.padding.getAttribute("x"));
		var paddingY = parseInt(this.padding.getAttribute("y"));
		var paddingWidth = parseInt(this.padding.getAttribute("width"));
		var paddingHeight = parseInt(this.padding.getAttribute("height"));

		//console.log("sliderX = " + sliderX, "sliderY = " + sliderY, "sliderWidth = " + sliderWidth, "sliderHeight = " + sliderHeight);
		//console.log("paddingX = " + paddingX, "paddingY = " + paddingY, "paddingWidth = " + paddingWidth, "paddingHeight = " + paddingHeight);

		// calculate delta
		if (this.vertical) {
			delta = canvasCoords.y - (sliderY + this.sliderClickOffset);
		}
		else {
			delta = canvasCoords.x - (sliderX + this.sliderClickOffset);
		}

		//console.log("delta before boundary = "+  delta);
		//console.log("delta upper boundary = " + (paddingHeight - (sliderY - paddingY) - sliderHeight), ", lower boundary = " + (paddingY - sliderY));

		// if slider reached the beginning or ending of the trough
		if (this.vertical){
			if (delta > paddingHeight - (sliderY - paddingY) - sliderHeight) {
				delta = paddingHeight - (sliderY - paddingY) - sliderHeight;
			}
			else if (delta < paddingY - sliderY) {
				delta = paddingY - sliderY;
			}

			this.slider.setAttribute("y", sliderY + delta); // move slider

			// TODO call setViewBox on scrollable
		}
		else {
			if (delta > paddingWidth - (sliderX - paddingX) - sliderWidth) {
				delta = paddingWidth - (sliderX - paddingX) - sliderWidth;
			}
			else if (delta < paddingX - sliderX){
				delta = paddingX - sliderX;
			}

			this.slider.setAttribute("x", sliderX + delta); // redraw slider
			// TODO call setViewBox on scrollable
		}
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
		this.scrollForwardInterval = setInterval(this.scrollForward.bind(this), 200);
	},
	forwardButtonMouseOutHandler: function(e){
		clearInterval(this.scrollForwardInterval);
		delete this.scrollForwardInterval;
	},
	forwardButtonMouseEnterHandler: function(e){
		this.scrollForwardInterval = setInterval(this.scrollForward.bind(this), 200);
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
		this.scrollBackwardInterval = setInterval(this.scrollBackward.bind(this), 200);

	},
	backwardButtonMouseOutHandler: function(e){
		clearInterval(this.scrollBackwardInterval);
		delete this.scrollForwardInterval;
	},
	backwardButtonMouseEnterHandler: function(e){
		this.scrollForwardInterval = setInterval(this.scrollBackward.bind(this), 200);
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
		var paddingX = parseInt(this.padding.getAttribute("x"));
		var paddingY = parseInt(this.padding.getAttribute("y"));		
		var paddingWidth = parseInt(this.padding.getAttribute("width"));
		var paddingHeight = parseInt(this.padding.getAttribute("height"));		

		if (this.vertical){
			if (sliderY - paddingY + sliderHeight + this.scrollSize > paddingHeight) this.slider.setAttribute("y", paddingY + paddingHeight - sliderHeight);
			else this.slider.setAttribute("y", sliderY + this.scrollSize); // move slider
		}
		else {
			if (sliderX - paddingX + sliderWidth + this.scrollSize > paddingWidth) this.slider.setAttribute("x", paddingX + paddingWidth - sliderWidth);
			else this.slider.setAttribute("x", sliderX + this.scrollSize); // move slider
		}
	},
	scrollBackward: function(){
		var sliderX = parseInt(this.slider.getAttribute("x"));
		var sliderY = parseInt(this.slider.getAttribute("y"));
		var paddingX = parseInt(this.padding.getAttribute("x"));
		var paddingY = parseInt(this.padding.getAttribute("y"));

		if (this.vertical){
			if (sliderY - paddingY - this.scrollSize < 0) this.slider.setAttribute("y", paddingY);
			else this.slider.setAttribute("y", sliderY - this.scrollSize); // move slider
		}
		else {
			if (sliderX - paddingX - this.scrollSize < 0) this.slider.setAttribute("x", paddingX);
			else this.slider.setAttribute("x", sliderX - this.scrollSize); // move slider
		}
	},
	pageForward: function(){},
	pageBackward: function(){},
};

Idea.prototype.Scrollbar = Scrollbar;