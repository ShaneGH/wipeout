
Class("wipeout.template.rendering.htmlPropertyValue", function () {
	
	var htmlPropertyValue = wipeout.template.propertyValue.extend(function htmlPropertyValue (name, value, parser, action) {
		///<summary>Set html attributes</summary>
        ///<param name="name" type="String">The name of the attribute</param>
        ///<param name="value" type="String">The value of the attribute</param>
        ///<param name="parser" type="String|Function" optional="true">The parser or a pointer to it</param>
        ///<param name="action" type="String" optional="true">The wipoeut html attribute to use. If null, use "name"</param>
		
		this._super(name, typeof value === "string" ? new wipeout.wml.wmlAttribute(value) : value, parser);
		
		///<summary type="String">The wipoeut html attribute to use. If null, use "name"</summary>
		this.action = action;
	});
	
	htmlPropertyValue.prototype.eventBuild = function () {
		///<summary>Build an event invoker for this._value</summary>
        ///<returns type="Function">A function to get the value from render context parts</returns>
		
		return this._eventBuilt || (this._eventBuilt = wipeout.template.context.buildEventCallback(this.value()));
	};
	
	 //TODE
	htmlPropertyValue.prototype.onElementEvent = function (event, callback, capture) {
		///<summary>When called within a wipeout binding function, will watch for a an element event. Also handles all disposal in this case</summary>
        ///<param name="event" type="String">The event</param>
        ///<param name="callback" type="Function" optional="true">A callback for the event. To use the render context, generate the callback using wipeout.template.context.buildEventCallback. If null, will use the callback set in the property</param>
        ///<param name="capture" type="Boolean">Capture the event within this element</param>
        ///<returns type="Function">A dispose function to dispose prematurely</returns>
		
		this.primed();
		
		var element = this.propertyOwner, rc = this.renderContext;
		callback = callback || (function (e) {
			if (!this.eventBuild().apply(null, rc.asEventArgs(e, element))) {
                e.preventDefault();
            }
		}).bind(this);
						
        element.addEventListener(event, callback, capture || false);
        
        var output = new busybody.disposable(function() {
			element.removeEventListener(event, callback, capture || false);
			callback = null;
        });
		
		this._caching.push(output);
		
		return output.dispose.bind(output);
    };
	
	htmlPropertyValue.prototype.setData = function (element, name, data) {
		///<summary>When used by a wipeout html attribute (wo.htmlAttributes), set data against the html element. This is useful to pass data between html attributes</summary>
        ///<param name="element" type="Element">The html element</param>
        ///<param name="name" type="String">The data key</param>
        ///<param name="data" type="Any">the data</param>
        ///<returns type="Any">The data</returns>
        
		this.primed();
		
		this._caching.push({
			dispose: function () {
				wipeout.utils.domData.clear(element, name);
			}
		});
		
		return wipeout.utils.domData.set(element, name, data);
	};
	
	htmlPropertyValue.prototype.getData = function (element, name) {
		///<summary>Get data saved against a html element</summary>
        ///<param name="element" type="Element">the element</param>
        ///<param name="name" type="String">The data key</param>
        ///<returns type="Any">The data</returns>
		
		return wipeout.utils.domData.get(element, name);
	};
	
	htmlPropertyValue.prototype.dataExists = function (element, name) {
		///<summary>Determine whether an element has a data key</summary>
        ///<param name="element" type="Element">The element</param>
        ///<param name="name" type="String">The data key</param>
        ///<returns type="Boolean">The result</returns>
		
		return wipeout.utils.domData.exists(element, name);
	};

	htmlPropertyValue.prototype.prime = function (propertyOwner, renderContext, logic, allPropertyValues) {
		///<summary>Set up the setter to cache dispose functions and invoke logic which might create dispose functions</summary>
        ///<param name="propertyOwner" type="Any">The object which the propertyValue will be applied to</param>
        ///<param name="renderContext" type="wipeout.template.context">The current render context</param>
        ///<param name="logic" type="Function">The logic to invoke</param>
        ///<param name="allSetters" type="Function">A list of all other setters on the element</param>
        ///<returns type="Array" generic0="busybody.disposable">Dispose functions</returns>
        
        try {
            this.otherAttributes = allPropertyValues;
            return this._super(propertyOwner, renderContext, logic);
        } finally {        
            this.otherAttributes = null;
        }
    };

	htmlPropertyValue.prototype.otherAttribute = function (name, logic) {
		///<summary>Use another html attribute from this node. If the other attribute does not exist, the logic will not be executed.</summary>
        ///<param name="name" type="String">The attribute. Do not include the "wo-" or "data-wo-" parts</param>
        ///<param name="logic" type="Function" optional="True">The logic to invoke. The first argument passed into the logic is the other attribute.</param>
        ///<returns type="Boolean">Whether the attribute exists or not</returns>
        
        if (!logic) {
            for (var i = 0, ii = this.otherAttributes.length; i < ii; i++)
                // remove wo- and data-wo-
                if (this.otherAttributes[i].name.replace(/^(data\-)?wo\-/, "") === name)
                    return true;
            
            return false;
        }
        
        this.primed();
        
        for (var i = 0, ii = this.otherAttributes.length; i < ii; i++) {
            // remove wo- and data-wo-
            if (this.otherAttributes[i].name.replace(/^(data\-)?wo\-/, "") === name) {
                Array.prototype.push.apply(this._caching, 
                    this.otherAttributes[i].prime(this.propertyOwner, this.renderContext, (function () {
                        var op;
                        if (op = logic(this.otherAttributes[i]))
                            this._caching.push(op);
                    }).bind(this), this.otherAttributes));
                
                return true;
            }
        }
        
        return false;
    };
	
	return htmlPropertyValue;
});