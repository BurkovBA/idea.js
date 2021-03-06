(function(){
    var xGetterSetter = Idea.Util.getterSetter("x", Idea.Validators.intValidator);
    var yGetterSetter = Idea.Util.getterSetter("y", Idea.Validators.intValidator);
    var contentGetterSetter = Idea.Util.getterSetter("content", Idea.Validators.stringValidator);
    var strokeGetterSetter = Idea.Util.getterSetter("stroke", Idea.Validators.colorValidator);
    var fillGetterSetter = Idea.Util.getterSetter("fill", Idea.Validators.colorValidator);

	var Text = function(owner, father, x, y, content, stroke, fill, fontSize, fontWeight, fontStyle){
        Idea.Object.call(this);

		if (x === undefined) xGetterSetter.call(this, 0);
		else xGetterSetter.call(this, 0);

		if (y === undefined) yGetterSetter.call(this, 0);
		else yGetterSetter.call(this, 0);

		if (content === undefined) contentGetterSetter.call(this, "");
		else contentGetterSetter.call(this, content);

		if (stroke === undefined) strokeGetterSetter.call(this, "#000000");
		else strokeGetterSetter.call(this, stroke);

		if (fill === undefined) fillGetterSetter.call(this, "#000000");
		else fillGetterSetter.call(this, fill);

        this.father = father;

        //draw primitives
        this._group = Idea.Util.createSVGElement(this.father, 'g', {});
        this._drawing = Idea.Util.createSVGElement(this._group, 'text', {
            "x": this.x(), 
            "y": this.y(),
            "stroke": this.stroke(),
            "fill": this.fill()
        });
        this.textNode = document.createTextNode(content);
        this._drawing.appendChild(this.textNode);

        Idea.Util.observe(this, "x", function(newValue, oldValue){this._drawing.setAttribute("x", newValue);}.bind(this));
        Idea.Util.observe(this, "y", function(newValue, oldValue){this._drawing.setAttribute("y", newValue);}.bind(this));
        Idea.Util.observe(this, "content", function(newValue, oldValue){this.textNode.nodeValue = newValue;}.bind(this));
        Idea.Util.observe(this, "stroke", function(newValue, oldValue){this._drawing.setAttribute("stroke", newValue);}.bind(this));
        Idea.Util.observe(this, "fill", function(newValue, oldValue){this._drawing.setAttribute("fill", newValue);}.bind(this));
	};

	var mouseClick = function(e){
        console.log("mouseClick");
        // create text and mousemove listener
        var event = Idea.Util.normalizeMouseEvent(e);
        var canvasCoords = Idea.Util.windowCoordsToCanvasCoords(event.clientX, event.clientY, this.canvas._canvas);
        console.log("canvasCoords = " + JSON.stringify(canvasCoords));

        // draw the base on canvas
        this._new = new Text(this, this.canvas._canvas, canvasCoords.x, canvasCoords.y, "", '#000000', '#000000');

        // remove this listener and add mouseover, mouseclick and keydown handlers
        Idea.Util.removeEventListener(this.canvas._canvas, "click", mouseClick, false, this, []);

        this._bindedKeyDown = keyDown.bind(this);
        window.addEventListener("keypress", this._bindedKeyDown)
        window.addEventListener("keydown", this._bindedKeyDown);
	};

    var returnFromTextCreation = function(){
        // remove creation listeners
        window.removeEventListener("keypress", this._bindedTipKeyDown);
        window.removeEventListener("keydown", this._bindedTipKeyDown);
        delete this._bindedKeyDown;

        // untoggle the line creation button
        this.icon.toggle();

        // switch from creation mode back to edit mode
        this.mode('edit');

        // delete this._new that contained just created object
        delete this._new;
    };

	var keyDown = function(e){
		var event = Idea.Util.normalizeKeyboardEvent(e);
        if (event == null) return; // just ignore this event, if it should be ignored
        if (event.type == "keydown" && event.keyCode == 27) { // if this is keydown event on Escape key, destroy this Object and return to edit mode
            this._new.destroy();
            returnFromTextCreation.bind(this)();
        }
        else if (event.type == "keypress") {
        	this._new.content(this._new.content() + event.charCode);
        }
	};

    var iconLabel = Idea.Util.createSVGElement(null, 'svg', {width: Idea.Conf.objectIconWidth, height: Idea.Conf.objectIconHeight});
    var line = Idea.Util.createSVGElement(iconLabel, 'text', {x: parseInt(Idea.Conf.objectIconWidth/10), y: parseInt(Idea.Conf.objectIconHeight*9/10), stroke: "#AAAAAA", fill: "#AAAAAA", "font-size": "45px", "font-style": "italic"});
    var lineText = document.createTextNode("T");
    line.appendChild(lineText);
    var iconHandlers = [["click", mouseClick, false]];

    Idea.Util.extend(Text, Idea.Object);
    Idea.Util.addAttrsToPrototype(Text, {
        x: xGetterSetter,
        y: yGetterSetter,
        content: contentGetterSetter,
        stroke: strokeGetterSetter,
        fill: fillGetterSetter,
        iconHandlers: iconHandlers,
        iconLabel: iconLabel,
    });

    Idea.Text = Text;
    Idea.ObjectsRegistry["Primitives"].push(Text);

})();