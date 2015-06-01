
function viewModel (name, extend, doNotWarn) {
	///<summary>Create a new type of view model</summary>
	///<param name="name" type="String" optional="false">The name of the view model. The name can be namespaced. The new view model class will be saved to the window object by this name</param>
	///<param name="extend" type="Function" optional="true">The parent class. Default: wo.view</param>
	///<param name="doNotWarn" type="Boolean" optional="true">If the view model is not built within a short period of time a warning will fire. This param supresses the warning.</param>
	///<returns type="Boolean"></returns>
	
	setTimeout(function () {
		if (!$constructor)
			warn("The view model \"" + name + "\" was not built. You must call \".build()\" to actually create the view model class. To supress this warning use the \"doNotWarn\" argument of the wo.viewModel method.");
	}, 1000);
		
	extend = extend || wipeout.viewModels.view;
	
	var isViewModel = orienteer.getInheritanceChain(extend).indexOf(wo.view) !== -1;
	var isDisposable = orienteer.getInheritanceChain(extend).indexOf(busybody.disposable) !== -1;
	
	var $constructor,
		viewModelLifecycle = {},
		values = {},
		tmp, args = (tmp = extend
		.toString()
		.replace(/\/\/.*$/mg, "")
		.replace(/\/\*[\s\S]*?\*\//mg, ""))
		.slice(tmp.indexOf('(') + 1, tmp.indexOf(')')).match(/([^\s,]+)/g) || [];
	
	var templateId, tid, model, mod;	// will be populated later
	function getParentConstructorArgs() {
		var output = [];
		if (templateId !== -1)
			output[templateId] = tid instanceof Function ? 
				tid.apply(this, arguments) :
				(tid !== undefined ? tid : arguments[0]);	// arguments[0] === templateId

		if (model !== -1)
			output[model] = mod instanceof Function ? 
				mod.apply(this, arguments) :
				(mod !== undefined ? mod : arguments[1]);	// arguments[1] === model

		return output;
	};

	var methods = {statics: true},	//statics is reserved
		valuesAsConstructorArgs = {},
		statics = {},
		bindingTypes = {},
		parsers = {},
		inheritanceTree;

	function check () {
		if ($constructor) throw 'You cannot add any more functionality using this DSL as this view model has already been built. You can still add methods to the view model by adding them directly to the build output, e.g.\nvar myClass = wo.viewModel("myClass").build();\nmyClass.doSomething = function () { ... };';
	}

	var output = {

		build: function () {
			///<summary>Build the view model</summary>
			///<returns type="Object">The prototype of the new view model. You can add function calls to this</returns>

			if ($constructor)
				return $constructor.prototype;

			if (wipeout.utils.obj.getObject(name))
				throw name + " already exists.";

			templateId = args.indexOf("templateId");
			if (templateId !== -1) {
				tid = values.templateId;
				delete values[templateId];
			}

			model = args.indexOf("model");
			if (templateId !== -1) {
				mod = values.model;
				delete values[model];
			}
            
			var split = name.split(".");
			$constructor = new Function("extend", "getParentConstructorArgs", "values", "viewModelLifecycle",
"return function " + split[split.length - 1] + " (templateId, model) {\n" +
"	extend.apply(this, getParentConstructorArgs.apply(this, arguments));\n" +
"\n" +
"	for (var i in values)\n" +
"		this[i] = values[i] instanceof Function ?\n" +
"			values[i].apply(this, arguments) :\n" +
"			values[i];\n" +
"\n" +
"	if (viewModelLifecycle.onInitialized)\n" +
"		(this.$onInitialized || (this.$onInitialized = [])).push(viewModelLifecycle.onInitialized);\n" +
"	if (viewModelLifecycle.onRendered)\n" +
"		(this.$onRendered || (this.$onRendered = [])).push(viewModelLifecycle.onRendered);\n" +
"	if (viewModelLifecycle.onUnrendered)\n" +
"		(this.$onUnrendered || (this.$onUnrendered = [])).push(viewModelLifecycle.onUnrendered);\n" +
"	if (viewModelLifecycle.onApplicationInitialized)\n" +
"		(this.$onApplicationInitialized || (this.$onApplicationInitialized = [])).push(viewModelLifecycle.onApplicationInitialized);\n" +
"}")(extend, getParentConstructorArgs, values, viewModelLifecycle);

			Class(name, function () {
				return orienteer.extend.call(extend, $constructor);
			});

			methods.statics = $constructor;
			for (var i in methods)
				$constructor.prototype[i] = methods[i];
			for (var i in statics)
				$constructor[i] = statics[i];

			for (var i in parsers)
				$constructor.addGlobalParser(i, parsers[i]);
			for (var i in bindingTypes)
				$constructor.addGlobalBindingType(i, bindingTypes[i]);

			methods = undefined;
			statics = undefined;
			bindingTypes = undefined;
			inheritanceTree = undefined;

			return output.build();
		},

		addFunction: function (name, method) {
			///<summary>Add a function to the view model class</summary>
			///<param name="name" type="String">The method name</param>
			///<param name="method" type="Function">The method</param>
			///<returns type="Object">The view model builder</returns>
			
			check();

			if (!(method instanceof Function))
				return output.value(name, method);

			if (methods[name])
				throw "You have already added a function: " + name;

			methods[name] = method;				
			return output;
		},

		value: function (name, value) {
			///<summary>Add a value to the view model class</summary>
			///<param name="name" type="String">The value name</param>
			///<param name="value" type="Object">The value. If value is a function, will add the value to the prototype instead</param>
			///<returns type="Object">The view model builder</returns>
			
			check();

			if (name === "constructor")
				return output.constructor(value);

			if (value instanceof Function)
				return output.addFunction(name, value);

			if (values[name])
				throw "You have already added a value: " + name;

			values[name] = value;				
			return output;
		},
		dynamicValue: function (name, value) {
			///<summary>Add a value to the view model class</summary>
			///<param name="name" type="String">The value name</param>
			///<param name="value" type="Function">A function which returns the value</param>
			///<returns type="Object">The view model builder</returns>
			
			check();

			if (name === "constructor")
				return output.constructor(value);

			if (!(value instanceof Function))
				throw "A dynamic value must be a function which returns the value.";

			if (values[name])
				throw "You have already added a value: " + name;

			values[name] = value;				
			return output;
		},

		staticFunction: function (name, method) {
			///<summary>Add a static function to the view model class</summary>
			///<param name="name" type="String">The method name</param>
			///<param name="method" type="Function">The method</param>
			///<returns type="Object">The view model builder</returns>
			
			return output.staticValue(name, method);
		},
		staticValue: function (name, value) {
			///<summary>Add a static value to the view model class</summary>
			///<param name="name" type="String">The value name</param>
			///<param name="value" type="Object">The value</param>
			///<returns type="Object">The view model builder</returns>
			
			check();

			if (statics[name])
				throw "You have already added a static value: " + name;

			statics[name] = value;
			return output;
		},

		parser: function (propertyName, parser) {
			///<summary>Add a default parser for a particular property</summary>
			///<param name="propertyName" type="String">The property name</param>
			///<param name="parser" type="String|Function">The parser of the name of a parser in wo.parsers</param>
			///<returns type="Object">The view model builder</returns>
			
			check();

			if (parsers[propertyName])
				throw "A parser has already been set for this object";

			inheritanceTree = inheritanceTree || orienteer.getInheritanceChain(extend);
			if (inheritanceTree.indexOf(wipeout.base.bindable) === -1)
				throw "You must inherit from wipeout.base.bindable to use global parsers. Alternatively you can inherit from any view model, such as wo.view, wo.content, wo.list etc...";

			parsers[propertyName] = parser;
			return output;
		},
		binding: function (propertyName, bindingType) {
			///<summary>Add a default binding type for a particular property</summary>
			///<param name="propertyName" type="String">The property name</param>
			///<param name="bindingType" type="String">The name of a binding type in wo.bindings</param>
			///<returns type="Object">The view model builder</returns>
			
			check();

			if (bindingTypes[propertyName])
				throw "A binding type has already been set for this object";

			inheritanceTree = inheritanceTree || orienteer.getInheritanceChain(extend);
			if (inheritanceTree.indexOf(wipeout.base.bindable) === -1)
				throw "You must inherit from wipeout.base.bindable to use global parsers. Alternatively you can inherit from any view model, such as wo.view, wo.content, wo.list etc...";

			bindingTypes[propertyName] = bindingType;
			return output;
		},
        
        // binding strategies
        onlyBindObservables: function () {
            return this.value("$bindingStrategy", wipeout.settings.bindingStrategies.onlyBindObservables);
        },
        bindNonObservables: function () {
            return this.value("$bindingStrategy", wipeout.settings.bindingStrategies.bindNonObservables);
        },
        createObservables: function () {
            return this.value("$bindingStrategy", wipeout.settings.bindingStrategies.createObservables);
        },

		// lifecycle functions
		templateId: function (templateId, eagerLoad) {
			///<summary>Add a default template id</summary>
			///<param name="templateId" type="String">The template id</param>
			///<param name="eagerLoad" type="Boolean" optional="true">If true, fetch and compile the template now</param>
			///<returns type="Object">The view model builder</returns>
			
			if (eagerLoad)
				wipeout.template.engine.instance.compileTemplate(templateId, function () {});
			
			return output.value("templateId", templateId);
		},
		initialize: function (onInitialized) {
			///<summary>Add a method to be called when the view model is initialized</summary>
			///<param name="onInitialized" type="Function">The method</param>
			///<returns type="Object">The view model builder</returns>
			
			if (!isViewModel) throw "The parent class must be, or inherit from wo.view to use this method.";
			
			if (viewModelLifecycle.onInitialized) throw "onInitialized has been defined already";
			viewModelLifecycle.onInitialized = onInitialized; 
			
			return output;
		},
		rendered: function (onRendered) {
			///<summary>Add a method to be called when the view model is rendered</summary>
			///<param name="onRendered" type="Function">The method</param>
			///<returns type="Object">The view model builder</returns>
			
			if (!isViewModel) throw "The parent class must be, or inherit from wo.view to use this method.";
			
			if (viewModelLifecycle.onRendered) throw "onRendered has been defined already";
			viewModelLifecycle.onRendered = onRendered; 
			
			return output;
		},
		unRendered: function (onUnrendered) {
			///<summary>Add a method to be called when the view model is un rendered</summary>
			///<param name="onUnrendered" type="Function">The method</param>
			///<returns type="Object">The view model builder</returns>
			
			if (!isViewModel) throw "The parent class must be, or inherit from wo.view to use this method.";
			
			if (viewModelLifecycle.onUnrendered) throw "onUnrendered has been defined already";
			viewModelLifecycle.onUnrendered = onUnrendered; 
			
			return output;
		},
		dispose: function (dispose) {
			///<summary>Add a method to be called when the view model is disposed</summary>
			///<param name="dispose" type="Function">The method</param>
			///<returns type="Object">The view model builder</returns>
			
			if (!isDisposable) throw "The parent class must be, or inherit from busybody.disposable to use this method.";
			
			return output.addFunction("dispose", function () {
				this._super();
				dispose.call(this);
			});
		},
		initializeApplication: function (onApplicationInitialized) {
			///<summary>Add a method to be called when the view model is initialized, if the view model is a root application</summary>
			///<param name="onApplicationInitialized" type="Function">The method</param>
			///<returns type="Object">The view model builder</returns>
			
			if (!isViewModel) throw "The parent class must be, or inherit from wo.view to use this method.";
			
			if (viewModelLifecycle.onApplicationInitialized) throw "onApplicationInitialized has been defined already";
			viewModelLifecycle.onApplicationInitialized = onApplicationInitialized; 
			
			return output;
		}
	};

	return output;
}