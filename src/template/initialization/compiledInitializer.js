
Class("wipeout.template.initialization.compiledInitializer", function () {
	    
    compiledInitializer.getPropertyFlags = function(name) {
		///<summary>Seperate name from flags by "--"</summary>
        ///<param name="name" type="String">The combined name and flags</param>
        ///<returns type="Object">The name and flags</returns>
        
        var op = wipeout.template.rendering.compiledTemplate.getPropertyFlags(name);
		op.name = wipeout.utils.obj.camelCase(op.name);
		return op;
    };
    
	function compiledInitializer(template) {
		///<summary>Given a piece of template xml, compile all of the setters for a view model</summary>
        ///<param name="template" type="wipeout.wml.wmlElement">The xml</param>
        
		///<summary type="Object">Cached setters from the template</summary>
        this.setters = {};
		
        // add attribute properties
        enumerateObj(template.attributes, this.addAttribute, this);
        
        // add element properties
        enumerateArr(template, this.addElement, this);
        
        if(!this.setters.model) {
            this.setters.model = compiledInitializer.modelSetter ||
				(compiledInitializer.modelSetter = compiledInitializer.createPropertyValue("model", new wipeout.wml.wmlAttribute("$this.model")));
        }
    };
    
    compiledInitializer.prototype.addElement = function (element) {
		///<summary>Create and cache all of the setters from an element and its children if applicable</summary>
        ///<param name="element" type="wipeout.wml.wmlElement">The element</param>
		
        if (element.nodeType !== 1) return;
        
        var name = wipeout.utils.viewModels.getElementName(element);
		name = compiledInitializer.getPropertyFlags(name).name;
        if (this.setters.hasOwnProperty(name)) throw "The property \"" + name + "\" has been set more than once.";
        
        for (var val in element.attributes) {
            if (val === "value" || val.indexOf("value--") === 0) {
                enumerateArr(element, function(child) {
                    if (child.nodeType !== 3 || !child.serialize().match(/^\s*$/))
                        throw "You cannot set the value both in attributes and with elements." //TODE
                });
				
                this.setters[name] = compiledInitializer.createPropertyValue(name, element.attributes[val], compiledInitializer.getPropertyFlags(val).flags);
                return;
            }
        }
        
        var p = element.attributes.parser || element.attributes.parsers;
        if (!p && element._parentElement && element._parentElement.name) {
            var parent = wipeout.utils.obj.getObject(wipeout.utils.obj.camelCase(element._parentElement.name))
            if (parent && parent.getGlobalParser)
                p = parent.getGlobalParser(name);
        }
            
        if (!p) {                
            for (var i = 0, ii = element.length; i < ii; i++) {
                if (element[i].nodeType === 1) {
					var vm = wipeout.utils.viewModels.getViewModelConstructor(element[i]);
					if (!vm)
						throw "Cannot create an instance of element: \"" + element[i].name + "\"";
					
                    element[i].$cachedVmContructor = vm.constructor;
                    this.setters[name] = compiledInitializer.createPropertyValue(name, element[i], ["templateElementSetter"]);

                    return;
                }
            }
        }

        if (p && p.constructor === Function) {
            this.setters[name] = compiledInitializer.createPropertyValue(name, element);
            this.setters[name].parser = p;
        } else if (p) {
            this.setters[name] = compiledInitializer.createPropertyValue(name, element, compiledInitializer.getPropertyFlags("--" + p.value).flags);
        } else {
            this.setters[name] = compiledInitializer.createPropertyValue(name, element);
        }
    };
    
	var wipeoutBindingType = "$wipeout_binding_type";
    compiledInitializer.createPropertyValue = function (name, wml, flags) {
		///<summary>Create a property setter with a parser and binding type</summary>
        ///<param name="name" type="String">The name</param>
        ///<param name="wml" type="wipeout.wml.wmlElement">The content</param>
        ///<param name="flags" type="[String]">Parsers and binding types</param>
		///<returns type="wipeout.template.initialization.viewModelPropertyValue">The setter</returns>
		
		var parser, bindingType;
		if (flags) {
			for (var i = 0, ii = flags.length; i < ii; i++) {
				if (wipeout.htmlBindingTypes[flags[i]]) {
					if (bindingType)
						throw "The binding type has already been set for this element"; //TODE
						
					bindingType = flags[i];
				} else if (wipeout.template.initialization.parsers[flags[i]]) {
					if (parser)
						throw "The parser has already been set for this element"; //TODE
						
					parser = flags[i];
				}
			}
		}
		
		var output = new wipeout.template.initialization.viewModelPropertyValue(name, wml, parser);
		output[wipeoutBindingType] = bindingType;
		
		return output;
	};
    
    compiledInitializer.prototype.addAttribute = function (attribute, name) {
		///<summary>Add a setter from a wml attribute</summary>
        ///<param name="attribute" type="wipeout.wml.wmlAttribute">The element</param>
        ///<param name="name" type="String">The element name</param>
        
        // spit name and flags
        name = compiledInitializer.getPropertyFlags(name);
        if (this.setters[name.name]) throw "The property \"" + name.name + "\" has been set more than once.";

        this.setters[name.name] = compiledInitializer.createPropertyValue(name.name, attribute, name.flags);
    };
    
    compiledInitializer.prototype.initialize = function (viewModel, renderContext, property) {
		///<summary>Initialize a view model with the cached setter in this compiledInitializer</summary>
        ///<param name="viewModel" type="Any">The view model</param>
        ///<param name="renderContext" type="wipeout.template.context">The current context</param>
        ///<param name="property" type="String" optional="true">Initialize one property only (if possible)</param>
        ///<returns type="Function">Dispose of initialization</returns>
		
		var disposal;
		if (property) {
			disposal = this.applyToViewModel(property, viewModel, renderContext);
		} else {
			// set bindingStrategy as it affects other properties
			disposal = this.setters.bindingStrategy ?
				this.applyToViewModel("bindingStrategy", viewModel, renderContext) :
                [];
            
			// only auto set model if model wasn't already set
            if (this.setters.model !== compiledInitializer.modelSetter || viewModel.model == null)
				disposal.push.apply(disposal, this.applyToViewModel("model", viewModel, renderContext));

			for (var name in this.setters)
				if (name !== "bindingStrategy" && name !== "model")
					disposal.push.apply(disposal, this.applyToViewModel(name, viewModel, renderContext));
            
            if (viewModel instanceof wo.view)
                viewModel.onInitialized();
		}
		
		return function () {
			enumerateArr(disposal.splice(0, disposal.length), function (d) {
				if (d)
					d.dispose();
			});
		}
    };
    
    compiledInitializer.prototype.applyToViewModel = function (name, viewModel, renderContext) {
        ///<summary>Apply this setter to a view model</summary>
        ///<param name="name" type="String">The name of the property to apply</param>
        ///<param name="viewModel" type="Any">The current view model</param>
        ///<param name="renderContext" type="wipeout.template.context">The current context</param>
        ///<returns type="Array">An array of disposables</returns>
		
		if (!this.setters[name])
			return [];
		
		var bindingType = compiledInitializer.getBindingType(this.setters[name], viewModel);
		
		if (!wipeout.htmlBindingTypes[bindingType]) throw "Invalid binding type :\"" + bindingType + "\" for property: \"" + name + "\".";
		
		var op = [];
		op.push.apply(op, this.setters[name].prime(viewModel, renderContext, (function () {
			var o = wipeout.htmlBindingTypes[bindingType](viewModel, this.setters[name], renderContext)
			if (o && o.dispose instanceof Function)
				op.push(o);
			else if (o instanceof Function)
				op.push({ dispose: o });
		}).bind(this)));
		
		return op;
	};
		
	compiledInitializer.getBindingType = function (setter, viewModel) {
        ///<summary>Get the binding type or global binding type</summary>
        ///<param name="setter" type="wipeout.template.initialization.viewModelPropertyValue">The current view model</param>
        ///<param name="viewModel" type="Object">The current view model</param>
        ///<returns type="String">the binding type</returns>
		
		return setter[wipeoutBindingType] || 
				(viewModel instanceof wipeout.base.bindable && viewModel.getGlobalBindingType(setter.name)) || 
				"ow";
	};
        
    return compiledInitializer;
});