
Class("wipeout.template.initialization.viewModelPropertyValue", function () {
	
    var viewModelPropertyValue = wipeout.template.propertyValue.extend(function viewModelPropertyValue (name, value, parser) {
        ///<summary>A setter for a view model property</summary>
        ///<param name="name" type="String">The name of the property</param>
        ///<param name="value" type="wipeout.wml.wmlElement|wipeout.wml.wmlAttribute">The setter value</param>
        ///<param name="parser" type="String|Function" optional="true">the parser or a pointer to it</param>
		
		this._super(name, value, parser);
	});
	
	viewModelPropertyValue.prototype.onPropertyChanged = function (callback, evaluateImmediately) {
        ///<summary>A setter for a view model property</summary>
        ///<param name="viewModel" type="Any">The view model which has the property</param>
        ///<param name="callback" type="Function">A callback to execute when the value changes</param>
        ///<param name="evaluateImmediately" type="Boolean">Execute the callback now</param>
        ///<returns type="Boolean">Whether the property could be subscribed to or not</returns>
		
		this.primed();
		
		var op = busybody.tryObserve(this.propertyOwner, this.name, callback);
		if (op) this._caching.push(op);
		if (evaluateImmediately)
			callback(undefined, wipeout.utils.obj.getObject(this.name, this.propertyOwner));
		
		return !!op;
	};
	
	viewModelPropertyValue.prototype.useAnotherProperty = function (property, value, callback) {
        ///<summary>Create and prime a viewModelPropertyValue for another property</summary>
        ///<param name="property" type="String">The other property name</param>
        ///<param name="value" type="String">The other property setter</param>
        ///<param name="callback" type="Function">A callback to execute. The first argument will be the new property</param>
		
		this.primed();
        
        var prop = new wipeout.template.initialization.viewModelPropertyValue(property, new wipeout.wml.wmlAttribute(value));
        this._caching.push.apply(this._caching, prop.prime(this.propertyOwner, this.renderContext, function () {
            callback(prop);
        }));
	};
	
	return viewModelPropertyValue;
});