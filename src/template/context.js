
Class("wipeout.template.context", function () {
    
    // warning: do not make observable. This will create a LOT of un necessary subscriptions
    function context (forVm, parentContext, arrayIndex) {
		///<summary>The context for any view model or html property set in a template</summary>
        ///<param name="forVm" type="Any">The view model</param>
        ///<param name="parentContext" type="wipeout.template.context" optional="true">The parent context</param>
        ///<param name="arrayIndex" type="Number" optional="true">The array index if the view model is in an array</param>
		
		if (forVm && forVm.shareParentScope)
			throw "You cannot create a template context for a view model with a shared parent scope";
		
		///<summary type="Any">The current view model</summary>
        this.$this = forVm;
        
        if (parentContext) {
			///<summary type="Any">The parent render context</summary>
            this.$parentContext = parentContext;
			
			///<summary type="Any">The parent view model</summary>
            this.$parent = parentContext.$this;
			
			///<summary type="Array" generic0="Any">A list of all ancestor view models</summary>
            this.$parents = [parentContext.$this];
            this.$parents.push.apply(this.$parents, parentContext.$parents);
        } else {
			this.$parentContext = null;
			this.$parent = null;
			this.$parents = [];
		}
		
		if (arrayIndex != null) {
			
			///<summary type="Object">An object whcih contains a "value" property. The value is the index. This property is only available for items in a rendered Array</summary>
			this.$index = new busybody.observable();
			this.$index.value = arrayIndex;
		}
    }
    
    // each render context has access to the global scope
    function renderContextPrototype () {}    
    renderContextPrototype.prototype = window;
    context.prototype = new renderContextPrototype();
    
    context.prototype.find = function (searchTermOrFilters, filters) {
		///<summary>Find an item from the ancestor chain</summary>
        ///<param name="searchTermOrFilters" type="String|Object">The search term if a string, search filters if an object</param>
        ///<param name="filters" type="Object" optional="true">The filters if arg 1 is a search term</param>
        ///<returns type="Any">The item searched for</returns>
		
		return (this._finder || (this._finder = new wipeout.utils.find(this))).find(searchTermOrFilters, filters);
    };
    
    context.prototype.contextFor = function (forVm, arrayIndex) {
		///<summary>Create a child context</summary>
        ///<param name="forVm" type="Any">The child to context</param>
        ///<param name="arrayIndex" type="Number" optional="true">The index if this item is in an array</param>
        ///<returns type="wipeout.template.context">The child context</returns>
        
		if (forVm.shareParentScope && arrayIndex != null)
			warn("If an item in an array is to be rendered with shareParentScope set to true, this item will not have an $index value in it's renered context");
		
        return forVm && forVm.shareParentScope ? this : new context(forVm, this, arrayIndex);
    };
	
	context.prototype.asGetterArgs = function () {
		///<summary>Return a version of this to be plugged into a function creted by context.buildGetter(...)</summary>
        ///<returns type="Array">the arguments</returns>
		
		return this.getterArgs || (this.getterArgs = [this, this.$this, this.$parent, this.$parents, this.$index]);
	};
	
	context.prototype.asWatchVariables = function () {
		///<summary>Return a version of this which can be plugged into the watch varialbes for a computed who's logic was taken from a context.buildGetter(...)</summary>
        ///<returns type="Object">The watch varialbles</returns>
        
		return this.watchVariables || (this.watchVariables = {
			$context: this, 
			$this: this.$this, 
			$parent: this.$parent, 
			$parents: this.$parents, 
			$index: this.$index
		});
	};
	
	context.prototype.asEventArgs = function (e, element) {
		///<summary>Return a version of this to be plugged into a function creted by context.buildEventCallback(...)</summary>
        ///<param name="e" type="Object">The event args</param>
        ///<param name="element" type="Element">The html element</param>
        ///<returns type="Array">the arguments</returns>
		
		var args = this.asGetterArgs().slice();
		args.push(e);
		args.push(element);
		
		return args;
	};
	
	context.prototype.getComputed = function (forFunction, options) {
		///<summary>Get a computed from this and a given function</summary>
        ///<param name="forFunction" type="Function">The function</param>
        ///<param name="options" type="Object" optional="True">The computed options</param>
        ///<returns type="busybody.observeTypes.computed">The computed</returns>
		
        options = options || {};
        options.watchVariables = this.asWatchVariables();
        
		return new busybody.observeTypes.computed(forFunction, options);
	}
	
	context.buildGetter = function (logic) {
		///<summary>Build a function around a logic string</summary>
        ///<param name="logic" type="String">The logic</param>
        ///<returns type="Function">A getter</returns>
		
		try {
			//if this changes, look at propertyValue, it uses and arguments[x] argument
			return new Function("$context", "$this", "$parent", "$parents", "$index", "return " + logic + ";");
		} catch (e) {
			throw "Invalid function logic. Function logic must contain only one line of code and must not have a 'return' statement ";
		}	
	};
	
	var notFunctionCall = /^\s*[Ll]ogic\s*:/;
	context.buildEventCallback = function (logic) {
		///<summary>Build a function around a logic string, specifically for html events</summary>
        ///<param name="logic" type="String">The logic</param>
        ///<returns type="Function">A getter</returns>
		
		if (notFunctionCall.test(logic))
			logic = logic.replace(notFunctionCall, "");
		else {
            if (!/\)[\s;]*$/.test(logic)) {
			     logic += "(e, element)";
            }
            
            logic = "return " + logic;
        }
        
		try {
			return new Function("$context", "$this", "$parent", "$parents", "$index", "e", "element", logic);
		} catch (e) {
			throw "Invalid function logic. Function logic must contain only one line of code and must not have a 'return' statement ";
		}	
	};
    
    return context;
});