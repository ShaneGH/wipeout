(function () {

window.wipeoutDocs = {};
wipeoutDocs.compiler = (function () {
    
    var innerCompiler = function(classes, baseClasses) {        
        this.classes = [];
        for(var i = 0, ii = classes.length; i < ii; i++)
            this.classes.push(classes[i]);
        
        this.compiled = [];
        for(var i = 0, ii = baseClasses.length; i < ii; i++) {
            this.compiled.push({
                name: baseClasses[i],
                value: get(baseClasses[i])
            });
        }
    };
    
    function get(namespacedObject) {
        var current = window;
        namespacedObject = namespacedObject.split(".");
        for(var i = 0, ii = namespacedObject.length; i < ii; i++) {
            current = current[namespacedObject[i]];
        }
        
        return current;
    }
    
    innerCompiler.prototype.checkDependency = function(dependency) {
        for(var i = 0, ii = this.compiled.length; i < ii; i++) {
            if(this.compiled[i].name === dependency)
                return true;
        }
        
        return false;        
    };
    
    innerCompiler.prototype.getClass = function(className) {
        for(var i = 0, ii = this.compiled.length; i < ii; i++) {
            if(this.compiled[i].name === className)
                return this.compiled[i].value;
        }
        
        return null;
    };
    
    innerCompiler.prototype.checkDependencies = function(dependencies) {
        for(var i = 0, ii = dependencies.length; i < ii; i++) {
            if(!this.checkDependency(dependencies[i]))
                return false;
        }
        
        return true;
    };
        
    innerCompiler.prototype.compile = function() {        
        while (this.classes.length) {
            var length = this.classes.length;
            
            for(var i = 0; i < this.classes.length; i++) {
                if(this.checkDependencies(this.classes[i].dependencies)) {
                    var className = this.classes[i].className;
                    if(className.indexOf(".") !== -1)
                        className = className.substr(className.lastIndexOf(".") + 1);
                    
                    var newClass = this.classes[i].constructor();
                    var statics = {};
                    for (var j in newClass)
                        statics[j] = newClass[j];
                    
                    var proto = newClass.prototype;
                    newClass = this.getClass(this.classes[i].parentClass).extend(newClass, className);
                    for(j in proto)
                        newClass.prototype[j] = proto[j];
                    for(j in statics)
                        newClass[j] = statics[j];
                    
                    this.compiled.push({
                        name: this.classes[i].className,
                        value: newClass
                    });
                    this.classes.splice(i, 1);
                    i--;
                }
            }    
            
            if(length === this.classes.length) {
                throw {
                    message: "Cannot compile remainig classes. They all have dependencies not registered with this constructor",
                    classes: this.classes
                };
            }
        }
    }
        
    function compiler(rootNamespace, baseClass, dependencies) {
        this.rootNamespace = rootNamespace;
        this.baseClass = baseClass;
        this.dependencies = dependencies || [];
        this.classes = [];
    };
    
    compiler.prototype.namespaceCorrectly = function(itemFullName) {
        if(this.rootNamespace && itemFullName && itemFullName.indexOf(this.rootNamespace + ".") === 0) {
            itemFullName = itemFullName.substr(this.rootNamespace.length + 1);        
        }
        
        return itemFullName;
    };
    
    compiler.prototype.registerClass = function(className, parentClass, buildConstructorFunction /* any extra arguments are counted as dependencies */) {      
        
        var parentClass = !parentClass || parentClass === this.baseClass ? this.baseClass : this.namespaceCorrectly(parentClass);
        
        var theClass = {
            className: this.namespaceCorrectly(className),
            constructor: buildConstructorFunction,
            parentClass: parentClass,
            dependencies: [parentClass]
        };
        
        for(var i = 0, ii = this.classes.length; i < ii; i++)
            if(this.classes[i].className === theClass.className)
                throw "There is already a class named " + className;
        
        for(i = 3, ii = arguments.length; i < ii; i++)
            theClass.dependencies.push(this.namespaceCorrectly(arguments[i]));
        
        this.classes.push(theClass);
    };
    
    compiler.append = function(append, to) {
        var name = append.name.split(".");
        for(var i = 0, ii = name.length - 1; i < ii; i++)
            to = to[name[i]] = to[name[i]] || {};
        
        to[name[i]] = append.value;
    }
       
    compiler.prototype.compile = function(root /* optional */) {
        root = root || {};
        
        var baseClasses = [this.baseClass];
        for(var i = 0, ii = this.dependencies.length; i < ii; i++) {
            baseClasses.push(this.dependencies[i]);
        }
        
        var ic = new innerCompiler(this.classes, baseClasses);
        ic.compile();
        
        // skip base classes
        for(i = 1 + this.dependencies.length, ii = ic.compiled.length; i < ii; i++)
            compiler.append(ic.compiled[i], root);
        
        return root;
    };        
    
    return compiler;
    
})();

var compiler = new wipeoutDocs.compiler("wipeoutDocs", "orienteer", [
    "busybody.disposable", "busybody.observable", "wipeout.base.bindable", "wo.view", "wo.content", "wo.list", "wo.if"
]);


var enumerate = function(enumerate, callback, context) {
    context = context || window;

    if(enumerate)
        for(var i = 0, ii = enumerate.length; i < ii; i++)
            callback.call(context, enumerate[i], i);
};

var get = function(item, root) {

    var current = root || window;
    enumerate(item.split("."), function(item) {
        current = current[item];
    });

    return current;
};

compiler.registerClass("wipeoutDocs.models.apiApplication", "busybody.observable", function() {
    
    var staticContructor = function() {
        if(window.wipeoutApi) return;
		
		var parents = [
			{key: "Array", value: Array},
			{key: "orienteer", value: orienteer},
			{key: "busybody.disposable", value: busybody.disposable},
			{key: "busybody.observableBase", value: busybody.observableBase},
			{key: "busybody.observable", value: busybody.observable},
			{key: "busybody.arrayBase", value: busybody.arrayBase},
			{key: "busybody.array", value: busybody.array},
			{key: "wipeout.base.bindable", value: wipeout.base.bindable}
		];
		
        wipeoutApi = new wipeoutDocs.models.components.apiBuilder(wipeout, "wipeout")
            .build({
                knownParents: parents, 
                filter: function(i) {
                    return i.key.indexOf("wipeout.debug") !== 0 && i.key.indexOf("wipeout.profile") !== 0;
                }
            });
		
        woApi = new wipeoutDocs.models.components.apiBuilder(wo, "wo").build({knownParents: parents});
		
		orienteerApi = new wipeoutDocs.models.components.apiBuilder(orienteer, "orienteer").build();
		
		busybodyApi = new wipeoutDocs.models.components.apiBuilder(busybody, "busybody").build({knownParents: parents});
    };
    
    ApiApplication.routableUrl = function(item) {
        staticContructor();
        
        if(item instanceof wipeoutDocs.models.descriptions.class)
            output = "type=api&className=" + item.classFullName;
        else if(item instanceof wipeoutDocs.models.descriptions.event)
            output = "type=api&className=" + item.classFullName + "&eventName=" + item.eventName + "&isStatic=" + item.isStatic;
        else if(item instanceof wipeoutDocs.models.descriptions.property)
            output = "type=api&className=" + item.classFullName + "&propertyName=" + item.propertyName + "&isStatic=" + item.isStatic;
        else if(item instanceof wipeoutDocs.models.descriptions.function)
            output = "type=api&className=" + item.classFullName + "&functionName=" + item.functionName + "&isStatic=" + item.isStatic;
        else if(item instanceof wipeoutDocs.models.descriptions.class)
            output = "type=Home";
        else
            throw "Unknown page type";
        
        return location.origin + location.pathname + "?" + output;
    };
    
    ApiApplication.getModel = function(modelPointer) {
        staticContructor();
        
        if(!modelPointer) return null;
                
        switch (modelPointer.type) {
            case "api":
                return ApiApplication.getApiModel(modelPointer);             
        }
        
        return null;
    };
    
    parseBool = function(item) {
        return item && item.toLowerCase() !== "false";
    }
    
    ApiApplication.getApiModel = function(modelPointer) {
        staticContructor();
                
        var api = null;
		if (modelPointer.className.indexOf("wipeout") === 0)
			api = wipeoutApi;
		else if (modelPointer.className.indexOf("wo") === 0)
			api = woApi;
		else if (modelPointer.className.indexOf("orienteer") === 0)
			api = orienteerApi;
		else if (modelPointer.className.indexOf("busybody") === 0)
			api = busybodyApi;
        
        if(!api) return null;
        
        var _class = api.forClass(modelPointer.className);
        if(_class) {
            if(modelPointer.eventName)
                return _class.getEvent(modelPointer.eventName, parseBool(modelPointer.isStatic));
            if(modelPointer.propertyName)
                return _class.getProperty(modelPointer.propertyName, parseBool(modelPointer.isStatic));
            if(modelPointer.functionName)
                return _class.getFunction(modelPointer.functionName, parseBool(modelPointer.isStatic));
        }
        
        return _class;        
    };
    
    ApiApplication.getSubBranches = function(classDescription) {   
        staticContructor();
        
        var output = [];
        
        enumerate(classDescription.staticEvents, function(event) {
            output.push(new wipeoutDocs.models.components.treeViewBranch(event.eventName, ApiApplication.routableUrl(event)));            
        });
        
        enumerate(classDescription.staticProperties, function(property) {
            output.push(new wipeoutDocs.models.components.treeViewBranch(property.propertyName, ApiApplication.routableUrl(property)));
        });
        
        enumerate(classDescription.staticFunctions, function(_function) {
            output.push(new wipeoutDocs.models.components.treeViewBranch(_function.functionName, ApiApplication.routableUrl(_function)));
        });
        
        enumerate(classDescription.events, function(event) {
            output.push(new wipeoutDocs.models.components.treeViewBranch(event.eventName, ApiApplication.routableUrl(event)));            
        });
        
        enumerate(classDescription.properties, function(property) {
            output.push(new wipeoutDocs.models.components.treeViewBranch(property.propertyName, ApiApplication.routableUrl(property)));            
        });
        
        enumerate(classDescription.functions, function(_function) {
            output.push(new wipeoutDocs.models.components.treeViewBranch(_function.functionName, ApiApplication.routableUrl(_function)));            
        });
        
        output.sort(function() { return arguments[0].name.localeCompare(arguments[1].name); });
        return output;
    };
    
    ApiApplication.treeViewBranchFor = function(api, classFullName) {
        staticContructor();
        
        var friendlyName = classFullName.split(".");
        friendlyName = friendlyName[friendlyName.length - 1];
        
        var definition = api.forClass(classFullName);
        for (var i = definition.staticProperties.length - 1; i >= 0; i--)
            if(definition.staticProperties[i].name === "__woName")
                definition.staticProperties.splice(i, 1);
        
        return new wipeoutDocs.models.components.treeViewBranch(
            friendlyName, 
            ApiApplication.routableUrl(definition), 
            ApiApplication.getSubBranches(definition));
    };
    
    function ApiApplication() {
        staticContructor();
        
        this._super();
        
        this.content = new wipeoutDocs.models.pages.landingPage();
        var _busybody = new wipeoutDocs.models.components.treeViewBranch("busybody", null, [
            new wipeoutDocs.models.components.treeViewBranch("callbacks", null, [
				ApiApplication.treeViewBranchFor(busybodyApi, "busybody.callbacks.arrayCallback"),
				ApiApplication.treeViewBranchFor(busybodyApi, "busybody.callbacks.changeCallback"),
				ApiApplication.treeViewBranchFor(busybodyApi, "busybody.callbacks.propertyCallback"),
			]),
            new wipeoutDocs.models.components.treeViewBranch("observeTypes", null, [
				ApiApplication.treeViewBranchFor(busybodyApi, "busybody.observeTypes.computed"),
				ApiApplication.treeViewBranchFor(busybodyApi, "busybody.observeTypes.observeTypesBase"),
				ApiApplication.treeViewBranchFor(busybodyApi, "busybody.observeTypes.pathObserver"),
			]),
            new wipeoutDocs.models.components.treeViewBranch("utils", null, [
				ApiApplication.treeViewBranchFor(busybodyApi, "busybody.utils.compiledArrayChange"),
				ApiApplication.treeViewBranchFor(busybodyApi, "busybody.utils.executeCallbacks"),
				ApiApplication.treeViewBranchFor(busybodyApi, "busybody.utils.obj"),
				ApiApplication.treeViewBranchFor(busybodyApi, "busybody.utils.observeCycleHandler"),
			]),
			ApiApplication.treeViewBranchFor(busybodyApi, "busybody.array"),
			ApiApplication.treeViewBranchFor(busybodyApi, "busybody.arrayBase"),
			ApiApplication.treeViewBranchFor(busybodyApi, "busybody.disposable"),
			ApiApplication.treeViewBranchFor(busybodyApi, "busybody.observable"),
			ApiApplication.treeViewBranchFor(busybodyApi, "busybody.observableBase")
		]);
				
        var _wipeout = new wipeoutDocs.models.components.treeViewBranch("wipeout", null, [
            new wipeoutDocs.models.components.treeViewBranch("base", null, [
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.base.bindable")
            ]),
            new wipeoutDocs.models.components.treeViewBranch("events", null, [
				ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.events.event"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.events.routedEventArgs"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.events.routedEventModel")
			]),
            new wipeoutDocs.models.components.treeViewBranch("htmlBindingTypes", null, [
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.htmlBindingTypes.ifTemplateProperty"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.htmlBindingTypes.nb"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.htmlBindingTypes.ow"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.htmlBindingTypes.owts"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.htmlBindingTypes.setTemplateToTemplateId"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.htmlBindingTypes.shareParentScope"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.htmlBindingTypes.templateElementSetter"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.htmlBindingTypes.templateProperty"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.htmlBindingTypes.tw"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.htmlBindingTypes.viewModelId")
			]),
            new wipeoutDocs.models.components.treeViewBranch("polyfills", null, [
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.polyfills.Array"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.polyfills.Function")
			]),
            /*new wipeoutDocs.models.components.treeViewBranch("profile", null, [
			]),*/
            new wipeoutDocs.models.components.treeViewBranch("template", null, [
            	new wipeoutDocs.models.components.treeViewBranch("initialization", null, [
                	ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.initialization.compiledInitializer"),
                	ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.initialization.parsers"),
                	ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.initialization.viewModelPropertyValue"),
				]),
            	new wipeoutDocs.models.components.treeViewBranch("rendering", null, [
					new wipeoutDocs.models.components.treeViewBranch("htmlAttributes", null, [
                		ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.htmlAttributes.wo-attr"),
                		ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.htmlAttributes.wo-class"),
                		ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.htmlAttributes.wo-content"),
                		ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.htmlAttributes.wo-data"),
                		ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.htmlAttributes.wo-event"),
                		ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.htmlAttributes.id"),
                		ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.htmlAttributes.wo-render"),
                		ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.htmlAttributes.wo-style"),
                		ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.htmlAttributes.wo-value"),
                		ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.htmlAttributes.wo-visible"),
                		ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.htmlAttributes.wipeoutCreateViewModel")
					]),
                	ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.builder"),
                	ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.compiledTemplate"),
                	ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.htmlPropertyValue"),
                	ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.renderedArray"),
                	ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.renderedContent"),
                	ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.rendering.viewModelElement")
				]),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.context"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.engine"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.filters"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.loader"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.propertyValue"),
			]),
            new wipeoutDocs.models.components.treeViewBranch("utils", null, [
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.dictionary"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.domData"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.find"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.html"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.jsParse"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.obj"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.viewModels")
			]),
            new wipeoutDocs.models.components.treeViewBranch("viewModels", null, [
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.viewModels.content"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.viewModels.if"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.viewModels.list"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.viewModels.view")
			]),
            new wipeoutDocs.models.components.treeViewBranch("wml", null, [
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.wml.wmlAttribute"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.wml.wmlComment"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.wml.wmlElement"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.wml.wmlElementBase"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.wml.wmlParser"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.wml.wmlString")
			]),
			ApiApplication.treeViewBranchFor(wipeoutApi, "wo.viewModel")
        ]);
		
        var _wo = new wipeoutDocs.models.components.treeViewBranch("wo", null, [
            ApiApplication.treeViewBranchFor(woApi, "wo.addHtmlAttribute"),
			ApiApplication.treeViewBranchFor(woApi, "wo.content"),
            ApiApplication.treeViewBranchFor(woApi, "wo.filters"),
            ApiApplication.treeViewBranchFor(woApi, "wo.findFilters"),
            ApiApplication.treeViewBranchFor(woApi, "wo.if"),
            ApiApplication.treeViewBranchFor(woApi, "wo.bindings"),
            ApiApplication.treeViewBranchFor(woApi, "wo.list"),
            ApiApplication.treeViewBranchFor(woApi, "wo.parsers"),
            ApiApplication.treeViewBranchFor(woApi, "wo.triggerEvent"),
            ApiApplication.treeViewBranchFor(woApi, "wo.view")
        ]);
        
        this.menu = new wipeoutDocs.models.components.treeViewBranch("API", null, [
            _wo,
			ApiApplication.treeViewBranchFor(orienteerApi, "orienteer"),
            _busybody,
            _wipeout
        ]);
    };
    
    return ApiApplication;
});

compiler.registerClass("wipeoutDocs.models.components.api", "orienteer", function() {    
    
    var api = function() {
        this._super();
        
        this.classes = [];
    };
    
    api.prototype.getClassDescription = function(classConstructor) {
        for(var i = 0, ii = this.classes.length; i < ii; i++)            
            if(this.classes[i].classConstructor === classConstructor)
                return this.classes[i].classDescription;
    };
    
    api.prototype.forClass = function(className) {
        
        var classConstructor = get(className);
        var result = this.getClassDescription(classConstructor);
        if(result)
            return result;
        
        var desc = new wipeoutDocs.models.descriptions.class(className, this);
        this.classes.push(new wipeoutDocs.models.components.apiClass(desc, classConstructor));
        
        return desc;
    };
    
    function ns(namespace, root) {
        namespace = namespace.split(".");
        root = root || window;
        
        // skip last part
        for(var i = 0, ii = namespace.length - 1; i < ii; i++) {
            root = root[namespace[i]] = (root[namespace[i]] || {});
        }
        
        return root;
    }
    
    api.prototype.codeHelper = function(codeHelperGenerator) {
        if(!(codeHelperGenerator instanceof wipeoutDocs.models.components.generators.codeHelperGenerator))
            throw "Invalid input";
        
        return codeHelperGenerator.generate(this);
    };
    
    api.prototype.namespaced = function() {
        var output = {};
        
        for(var i = 0, ii = this.classes.length; i < ii; i++) {
            ns(this.classes[i].classDescription.classFullName, output)[this.classes[i].classDescription.className] = this.classes[i];
        }        
        
        return output;
    };
    
    return api;
});

compiler.registerClass("wipeoutDocs.models.components.apiBuilder", "orienteer", function() {    
    
    function apiBuilder(root, rootNamespace) {
        this._super();
        
        this.classes = apiBuilder.flatten(root, rootNamespace);
    };
    
    apiBuilder.prototype.build = function(settings) {
        settings = settings ||{};
        
        var api = new wipeoutDocs.models.components.api();
        
        var classes = apiBuilder.toArray(this.classes);
        if(settings.knownParents)
            for(var i = 0, ii = settings.knownParents.length; i < ii; i++)
                classes.push(settings.knownParents[i]);
        
        
        var done = (settings.knownParents || []).slice();
        done.push(Object);
        
        if(settings.filter)
            for(var i = classes.length - 1; i >= 0; i--)
                if(!settings.filter(classes[i]))
                   classes.splice(i, 1);
        
        while (classes.length) {
            var length = classes.length;
            
            for (var i = classes.length - 1; i >= 0; i--) {
                if(done.indexOf(apiBuilder.getParentClass(classes[i].value)) !== -1) {
                    api.forClass(classes[i].key);
                    done.push(classes[i].value);
                    classes.splice(i, 1);
                }
            }
        
            for(var i = classes.length - 1; i >= 0; i--) {
                if (apiBuilder.getParentClass(classes[i].value) === Window) {
                    api.forClass(classes[i].key);
                    done.push(classes[i].value);
                    classes.splice(i, 1);
                }
            }
            
            if(length === classes.length)
                throw "Could not find parent classes for the remaining classes";
        }
        
        return api;
    }
    
    apiBuilder.getParentClass = function(childClass) {
        return Object.getPrototypeOf(childClass.prototype).constructor;
    };
    
    apiBuilder.toArray = function(obj) {
        var array = [];
        for(var i in obj)
            array.push({key: i, value: obj[i]});
        
        return array;
    };
            
    apiBuilder.flatten = function(root, rootNamespace) {
        
        var output = {};
        
        for(var i in root) {
            if(root[i] instanceof Function) {
                output[rootNamespace + "." + i] = root[i];
            } else if (root[i] instanceof Object) {
                var flattened = apiBuilder.flatten(root[i], rootNamespace + "." + i);
                for(var j in flattened)
                    output[j] = flattened[j];
            }
        }
        
        return output;
    }
    
    return apiBuilder;
});

compiler.registerClass("wipeoutDocs.models.components.apiClass", "orienteer", function() {    
    return function(classDescription, classConstructor) {
        this.classDescription= classDescription;
        this.classConstructor = classConstructor;
    }
});

compiler.registerClass("wipeoutDocs.models.components.generators.codeHelperGenerator", "orienteer", function() {
    
    function select(input, converter, context) {
        var output = [];
        context = context || window;
        for(var i = 0, ii = input.length; i < ii; i++)
            output.push(converter.call(context, input[i]));
        
        return output;
    }
    
    function codeHelperGenerator() {
        this.truncateNamespaces = true;
        
        this.resultStream = [];
        this.indentation = 0;
        this.indentationType = "\t";
    }
    
    codeHelperGenerator.prototype.write = function(input) {
        if(this.resultStream.length === 0)
            this.resultStream.push(input);
        else
            this.resultStream[this.resultStream.length -1] += input;
            
    };
    
    codeHelperGenerator.prototype.writeLine = function(input) {
        var tab = [];
        for(var i = 0; i < this.indentation; i++)
            tab.push(this.indentationType);
        
        this.resultStream.push(tab.join("") + input);            
    };
    
    codeHelperGenerator.prototype.addNamespaceBeginning = function(name) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addNamespaceEnd = function(name) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addClassBeginning = function(className) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addClassEnd = function(className) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addConstructorBeginning = function(className) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addConstructorEnd = function(className) {
        throw "Abstract functions must be implemented";
    };    
    
    codeHelperGenerator.prototype.addArgument = function(name, type, totalArguments) {
        throw "Abstract functions must be implemented";
    };   
    
    codeHelperGenerator.prototype.addArgumentSeparator = function(totalArguments) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addFunctionBeginning = function(name, returnType, returnTypeGenerics, _protected, _private, _static) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addFunctionEnd = function(name, returnType, returnTypeGenerics, _protected, _private, _static) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addProperty = function(name, type, _protected, _private, _static) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addHeader = function() {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.convertNamespace = function(name, namespaceObject) {
        
        var result= [];
        
        this.addNamespaceBeginning(name);
        
        this.indentation++;
        
        for(var item in namespaceObject) {
            if(namespaceObject[item] instanceof wipeoutDocs.models.components.apiClass) {
                this.convertClass(namespaceObject[item].classDescription);
            } else {
                this.convertNamespace(item, namespaceObject[item]);
            }            
        }
        
        this.indentation--;
        
        this.addNamespaceEnd(name);
    };
    
    codeHelperGenerator.prototype.convertClass = function(classDescription) {
        
        if(classDescription.className === "if") return;
        
        var parentClass = classDescription.parentClass ? classDescription.parentClass.classFullName : "";
        
        this.addClassBeginning(classDescription.className, parentClass);                
        this.indentation++;
        
        this.convertConstructor(classDescription.className, classDescription.classConstructor);
        select(classDescription.events, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertProperty(arguments[0], false);
        }, this);
        select(classDescription.properties, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertProperty(arguments[0], false); 
        }, this);
        select(classDescription.functions, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertFunction(arguments[0], false); 
        }, this);
        select(classDescription.staticEvents, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertProperty(arguments[0], true); 
        }, this);
        select(classDescription.staticProperties, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertProperty(arguments[0], true); 
        }, this);
        select(classDescription.staticFunctions, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertFunction(arguments[0], true); 
        }, this);
        
        this.indentation--;        
        this.addClassEnd(classDescription.className, parentClass);        
    };
    
    codeHelperGenerator.prototype.convertConstructor = function(className, functionDescription) {        
        this.addConstructorBeginning(className);
        this.indentation++;
        this.convertArguments(functionDescription.arguments);
        this.indentation--;
        this.addConstructorEnd(className);
    };  
    
    codeHelperGenerator.prototype.convertArgument = function(argument, totalArguments) {
        this.addArgument(argument.name, argument.type, totalArguments);
    }; 
    
    codeHelperGenerator.prototype.convertFunction = function(functionDescription, _static) {
        var _private = functionDescription.name && functionDescription.name.indexOf("__") === 0;
        var _protected = !_private && functionDescription.name && functionDescription.name.indexOf("_") === 0;
        
        this.addFunctionBeginning(functionDescription.name, functionDescription.returns.type, functionDescription.returns.genericTypes, _protected, _private, _static);
        this.indentation++;
        this.convertArguments(functionDescription.arguments);
        this.indentation--;
        this.addFunctionEnd(functionDescription.name, functionDescription.returns.type, functionDescription.returns.genericTypes, _protected, _private, _static);
    };
    
    codeHelperGenerator.prototype.convertArguments = function(args) {
        for (var i = 0, ii = args.length; i < ii; i++) {
            if(i !== 0) this.addArgumentSeparator(ii);
            this.convertArgument(args[i], ii);
        }
    };
    
    codeHelperGenerator.prototype.convertProperty = function(propertyDescription, _static) {
        if(propertyDescription.overrides) return;
        
        var _private = propertyDescription.name && propertyDescription.name.indexOf("__") === 0;
        var _protected = !_private && propertyDescription.name && propertyDescription.name.indexOf("_") === 0;        
        
        this.addProperty(propertyDescription.name, "Any", _protected, _private, _static);
    };
    
    codeHelperGenerator.prototype.generate = function(api) {
        api = api.namespaced();
        var result = [];
        
        this.addHeader();
        
        for(var namespace in api) {
            // until it is fixed
            if (namespace !== "wo") continue;
            this.convertNamespace(namespace, api[namespace], 0);
        }
        
        return this.resultStream.join("\n");
    };
    
    return codeHelperGenerator;
});

compiler.registerClass("wipeoutDocs.models.components.generators.typescript", "wipeoutDocs.models.components.generators.codeHelperGenerator", function() {
    
    var defaultIndentation = "\t";
    
    function typescript() {
        this._super();
    }    
    
    typescript.convertType = function(type, generics) {
        type = (type === "Any" ? "any" :
            (type === "HTMLNode" ? "Node" :
            (type === "Array" && (!generics || !generics.length) ? "Array<any>" :
            (type))));
        
        if(generics && generics.length) {
            var gen = [];
            for(var i = 0, ii = generics.length; i <ii; i++)
                gen.push(typescript.convertType(generics[i]));
            
            type += "<" + gen.join(", ") + ">";
        }
        
        return type;
    };
    
    typescript.prototype.addNamespaceBeginning = function(name) {
        if(this.indentation === 0)
            this.writeLine("declare module " + name + " {");
        else
            this.writeLine("export module " + name + " {");
    };
    
    typescript.prototype.addNamespaceEnd = function(name) {
        this.writeLine("}");
    };
    
    typescript.prototype.addClassBeginning = function(name, parentClass) {
        this.writeLine((this.indentation === 0 ? "declare" : "export") + " class " + name + (parentClass ? " extends " + parentClass : "") + " {");
    };
    
    typescript.prototype.addClassEnd = function(className, parentClass) {
        this.writeLine("}");
    };
    
    typescript.prototype.addConstructorBeginning = function(className) {
        this.writeLine("constructor(");
    };
    
    typescript.prototype.addConstructorEnd = function(className) {
        this.write(");");
    };    
    
    typescript.prototype.addArgument = function(name, type, totalArguments) {
        this.write(name + ": " + typescript.convertType(type));
    };
    
    typescript.prototype.addArgumentSeparator = function(totalArguments) {
        this.write(", ");
    };
    
    typescript.prototype.addFunctionBeginning = function(name, returnType, returnTypeGenerics, _protected, _private, _static) {
        this.writeLine(
            (_private ? "private " : (_protected ? "" : "")) + 
            (_static ? "static " : "")  +
            name + "(");
    };
    
    typescript.prototype.addFunctionEnd = function(name, returnType, returnTypeGenerics, _protected, _private, _static) {
        this.write("): " + typescript.convertType(returnType, returnTypeGenerics) + ";");
    };
    
    typescript.prototype.addProperty = function(name, type, _protected, _private, _static) {
        this.writeLine(
            (_private ? "private " : (_protected ? "" : "")) + 
            (_static ? "static " : "")  +
            name + ": " +
            typescript.convertType(type) + ";");
    };
    
    typescript.prototype.addHeader = function() {
        this.writeLine("// wipeout.d.ts");
        this.writeLine("");
    };
    
    return typescript;
});

compiler.registerClass("wipeoutDocs.models.components.treeViewBranch", "orienteer", function() {
    var treeViewBranch = function(name, href, branches) {
        this._super();
            
        this.name = name;
        this.href = href;
        this.branches = branches;
    };
    
    return treeViewBranch;
});

compiler.registerClass("wipeoutDocs.models.descriptions.argument", "orienteer", function() {
    function argument(itemDetails) {
        this._super();
        
        this.name = itemDetails.name;
        this.type = itemDetails.type;
        this.optional = !!itemDetails.optional;
        this.description = itemDetails.description;
        
        this.generics = itemDetails.description || [];
    }
    
    return argument;
});

compiler.registerClass("wipeoutDocs.models.descriptions.class", "busybody.observable", function() {
    var classDescription = function(classFullName, api) {
        this._super();
        
        this.className = classDescription.getClassName(classFullName);
        this.constructorFunction = get(classFullName);
        this.classFullName = classFullName;
        this.api = api;
        
        this.parentClass = null;
        
        this.classConstructor = null;
        this.events = [];
        this.staticEvents = [];
        this.properties = [];
        this.staticProperties = [];
        this.functions = [];
        this.staticFunctions = [];
        
        this.title = this.classFullName;
        
        this.rebuild();
    };
    
    classDescription.getClassName = function(classFullName) {
        classFullName = classFullName.split(".");
        return classFullName[classFullName.length - 1];
    };
    
    classDescription.prototype.getFunction = function (name, isStatic) {
        var functions = isStatic ? this.staticFunctions : this.functions;
        
        for(var i = 0, ii = functions.length; i < ii; i++) {
            if(functions[i].functionName === name)
                return functions[i];
        }
        
        return null;
    };
    
    classDescription.prototype.getEvent = function (name, isStatic) {
        var events = isStatic ? this.staticEvents : this.events;
        
        for(var i = 0, ii = events.length; i < ii; i++) {
            if(events[i].eventName === name)
                return events[i];
        }
        
        return null;
    };
    
    classDescription.prototype.getProperty = function (name, isStatic) {
        var properties = isStatic ? this.staticProperties : this.properties;
        
        for(var i = 0, ii = properties.length; i < ii; i++) {
            if(properties[i].propertyName === name)
                return properties[i];
        }
        
        return null;
    };
    
    classDescription.prototype.rebuild = function() {
        this.classConstructor = null;
        this.events.length = 0;
        this.staticEvents.length = 0;
        this.properties.length = 0;
        this.staticProperties.length = 0;
        this.functions.length = 0;
        this.staticFunctions.length = 0;
        this.parentClass = null;
                
        for(var i in this.constructorFunction) {
            if(this.constructorFunction.hasOwnProperty(i)) {
                if(this.constructorFunction[i] instanceof wipeout.events.event) {
                    this.staticEvents.push(new wipeoutDocs.models.descriptions.event(this.constructorFunction, i, this.classFullName, true));
                } else if(this.constructorFunction[i] instanceof Function) {
                    this.staticFunctions.push(new wipeoutDocs.models.descriptions.function(this.constructorFunction[i], i, this.classFullName, true));
                } else {
                    this.staticProperties.push(new wipeoutDocs.models.descriptions.property(this.constructorFunction, i, this.classFullName, true));
                }
            }
        }
        
        for(var i in this.constructorFunction.prototype) {
            if(this.constructorFunction.prototype.hasOwnProperty(i)) {                    
                if(this.constructorFunction.prototype[i] instanceof wipeout.events.event) { 
                    this.events.push(new wipeoutDocs.models.descriptions.event(this.constructorFunction, i, this.classFullName, false));
                } else if(this.constructorFunction.prototype[i] instanceof Function) {
                    this.functions.push(new wipeoutDocs.models.descriptions.function(this.constructorFunction.prototype[i], i, this.classFullName, false));
                } else {
                    this.properties.push(new wipeoutDocs.models.descriptions.property(this.constructorFunction, i, this.classFullName, false));
                }
            }
        }
        
        if(this.constructorFunction.constructor === Function) {
            
            var anInstance;
            try {
                anInstance = new this.constructorFunction();
            } catch (e) {
            }
            
            if (anInstance) {
                for(var i in anInstance) {
                    if(anInstance.hasOwnProperty(i)) {                    
                        if(anInstance[i] instanceof wipeout.events.event) { 
                            this.events.push(new wipeoutDocs.models.descriptions.event(this.constructorFunction, i, this.classFullName, false));
                        } else if(anInstance[i] instanceof Function) { 
                            this.functions.push(new wipeoutDocs.models.descriptions.function(anInstance[i], i, this.classFullName, false));
                        } else {
                            this.properties.push(new wipeoutDocs.models.descriptions.property(this.constructorFunction, i, this.classFullName, false));
                        }
                    }
                }
            }
        }
        
        if(this.constructorFunction.constructor === Function) {
            var current = this.constructorFunction;
            while((current = Object.getPrototypeOf(current.prototype).constructor) !== Object && current !== Window /*hack for wipeout.template.context*/) {  
                var parentClass = this.api.getClassDescription(current);
                if(!parentClass)
                    throw "Class has not been defined yet";
                
                var copy = function(fromTo, nameProperty) {
                    enumerate(parentClass[fromTo], function(fn) { 
                        if(this[fromTo].indexOf(fn) !== -1) return;
                        
                        for(var i = 0, ii = this[fromTo].length; i < ii; i++) {                    
                            if(this[fromTo][i][nameProperty] === fn[nameProperty]) {
                                if(!this[fromTo][i].overrides)
                                    this[fromTo][i].overrides = fn;
                                
                                return;
                            }
                        }
                        
                        this[fromTo].push(fn);
                    }, this);
                };
                
                // instance items only (no statics)
                copy.call(this, "events", "eventName");
                copy.call(this, "properties", "propertyName");
                copy.call(this, "functions", "functionName");
            }
        }
        
        var pullSummaryFromOverride = function(fromTo) {
            enumerate(this[fromTo], function(item) {
                var current = item;
                while (current && current.overrides && !current.summary) {
                    if(current.overrides.summary) {
                        current.summary = current.overrides.summary + 
                            (current.overrides.summaryInherited ? "" : " (from " + current.overrides.classFullName + ")");
                        current.summaryInherited = true;
                    }
                    
                    current = current.overrides;
                }
            });
        };
        
        pullSummaryFromOverride.call(this, "staticProperties");
        pullSummaryFromOverride.call(this, "staticFunctions");
        pullSummaryFromOverride.call(this, "staticEvents");
        pullSummaryFromOverride.call(this, "events");
        pullSummaryFromOverride.call(this, "properties");
        pullSummaryFromOverride.call(this, "functions");
		        
        for(var i = 0, ii = this.functions.length; i < ii; i++) {
            if(this.functions[i].functionName === "constructor") {
                this.classConstructor = this.functions.splice(i, 1)[0];
                break;
            }
        }
        
        if(i === this.functions.length)
            this.classConstructor = new wipeoutDocs.models.descriptions.function(this.constructorFunction, this.className, this.classFullName, false);
        
        var sort = function() { return arguments[0].name.localeCompare(arguments[1].name); };
        
        if(this.constructorFunction.prototype)
            this.parentClass = this.api.getClassDescription(Object.getPrototypeOf(this.constructorFunction.prototype).constructor);
        
        this.events.sort(sort);
        this.staticEvents.sort(sort);
        this.properties.sort(sort);
        this.staticProperties.sort(sort);
        this.functions.sort(sort);
        this.staticFunctions.sort(sort);
    };
    
    return classDescription;
});

compiler.registerClass("wipeoutDocs.models.descriptions.classItem", "busybody.observable", function() {
    return function(itemName, itemSummary, isStatic) {
        this._super();
        
        this.name = itemName;
        this.summary = itemSummary;
        this.isStatic = isStatic;
    }
});

compiler.registerClass("wipeoutDocs.models.descriptions.event", "wipeoutDocs.models.descriptions.classItem", function() {
    var eventDescription = function(constructorFunction, eventName, classFullName, isStatic) {
        this._super(eventName, wipeoutDocs.models.descriptions.property.getPropertySummary(constructorFunction, eventName), isStatic);
                        
        this.eventName = eventName;
        this.classFullName = classFullName;
        
        this.title = this.eventName;
    };
    
    return eventDescription;
});

compiler.registerClass("wipeoutDocs.models.descriptions.function", "wipeoutDocs.models.descriptions.classItem", function() {
    
    var functionDescription = function(theFunction, functionName, classFullName, isStatic) {
        this._super(functionName, functionDescription.getFunctionSummary(theFunction), isStatic);
        
        this["function"] = theFunction;
        this.functionName = functionName;
        this.classFullName = classFullName;
        
        this.title = this.functionName;
        
        var xmlSummary = this.getXmlSummary();
        
        this.arguments = this.getArguments(xmlSummary);
        
        this.returns = functionDescription.getReturnSummary(xmlSummary);
        
        this.overrides = null;
        
        this.computed("fullyQualifiedName", function() {
            return this.classFullName + "." + this.functionName;
		});
    };
            
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var COMMA = /([^\s,]+)/g;
    functionDescription.prototype.getArguments = function(xmlSummary) {
        if(!this["function"] || !(this["function"] instanceof Function)) return [];
        
        var fnStr = this["function"].toString().replace(STRIP_COMMENTS, '')
        var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(COMMA);
        
        if(!result)
            return [];
        
        for(var i = 0, ii = result.length; i < ii; i++) {
            result[i] = new wipeoutDocs.models.descriptions.argument(functionDescription.getArgumentSummary(result[i], xmlSummary));
        }
        
        return result;
    }; 
        
    functionDescription.removeFunctionDefinition = function(functionString) {
        var firstInline = functionString.indexOf("//");
        var firstBlock = functionString.indexOf("/*");
        var openFunction = functionString.indexOf("{");

        if(firstInline === -1) firstInline = Number.MAX_VALUE;
        if(firstBlock === -1) firstBlock = Number.MAX_VALUE;

        if(openFunction < firstInline && openFunction < firstBlock) {
            functionString = functionString.substr(openFunction + 1).replace(/^\s+|\s+$/g, '');
        } else { 
            if(firstInline < firstBlock) {
                functionString = functionString.substr(functionString.indexOf("\n")).replace(/^\s+|\s+$/g, '');
            } else {
                functionString = functionString.substr(functionString.indexOf("*/")).replace(/^\s+|\s+$/g, '');
            }

            functionString = functionDescription.removeFunctionDefinition(functionString);
        }

        return functionString;
    };
    
    var functionMeta = /^\s*\/\/\//g;
    functionDescription.getXmlSummary = function(theFunction) {
        var functionString = functionDescription.removeFunctionDefinition(theFunction.toString()).split("\n");
        for(var i = 0, ii = functionString.length; i < ii; i++) {
            if(functionString[i].search(functionMeta) !== 0)
                break;
            
            functionString[i] = functionString[i].replace(functionMeta, "");
        }
                
        return new DOMParser().parseFromString("<meta>" + functionString.splice(0, i).join("") + "</meta>", "application/xml").documentElement;
    };
    
    functionDescription.prototype.getXmlSummary = function() {
        return functionDescription.getXmlSummary(this["function"]);
    };
            
    functionDescription.getArgumentSummary = function(argument, xmlSummary) {
        var comment = null;
        for(var i = 0, ii = xmlSummary.childNodes.length; i < ii; i++) {
            if(xmlSummary.childNodes[i].nodeName === "param" && xmlSummary.childNodes[i].getAttribute("name") === argument) {
                comment = xmlSummary.childNodes[i];
                break;
            }
        }
        
        if(comment) {  
            var generics = [];
            
            var tmp;
            var g = "generic";
            var i = 0;
            for(var i = 0; tmp = comment.getAttribute(g + i); i++) {
                generics.push(tmp);
            }
            
            return {
                name: argument,
                type: comment.getAttribute("type"),
                optional: wo.parsers.bool(comment.getAttribute("optional")),
                description: comment.textContent || comment.innerHTML,
                genericTypes: generics
            };  
        }
        
        return {
            name: argument
        };   
    };   
            
    functionDescription.getFunctionSummary = function(theFunction) {
        var xmlSummary = functionDescription.getXmlSummary(theFunction);
        
        var comment = null;
        for(var i = 0, ii = xmlSummary.childNodes.length; i < ii; i++) {
            if(xmlSummary.childNodes[i].nodeName === "summary") {
                comment = xmlSummary.childNodes[i];
                break;
            }
        }
        
        if(comment) {  
            return comment.textContent || comment.innerHTML;
        }
        
        return "";   
    };   
            
    functionDescription.getReturnSummary = function(xmlSummary) { 
        for(var i = 0, ii = xmlSummary.childNodes.length; i < ii; i++) {
            if(xmlSummary.childNodes[i].nodeName === "returns") {
                var generics = [];

                var tmp;
                var g = "generic";
                for(var j = 0; tmp = xmlSummary.childNodes[i].getAttribute(g + j); j++) {
                    generics.push(tmp);
                }
                
                return {
                    summary: xmlSummary.childNodes[i].textContent || xmlSummary.childNodes[i].innerHTML,
                    type: xmlSummary.childNodes[i].getAttribute("type"),
                    genericTypes: generics
                };
            }
        }
        
        return {
            type: "void"
        };
    };  
    
    return functionDescription;
});

compiler.registerClass("wipeoutDocs.models.descriptions.property", "wipeoutDocs.models.descriptions.classItem", function() {
    var property = function(constructorFunction, propertyName, classFullName, isStatic) {
		
        this._super(propertyName, property.getPropertySummary(constructorFunction, propertyName, classFullName), isStatic);
        
        this.propertyName = propertyName;
        this.classFullName = classFullName;
        
        this.title = this.propertyName;
        
        var xml = property.getPropertySummaryXml(constructorFunction, propertyName, classFullName);
        this.propertyType = xml ? property.getPropertyType(xml) : null;
                
        this.computed("fullyQualifiedName", function() {
            return this.classFullName + "." + this.propertyName;
        });
    };
    
    var summary = /^\/\/\/<[sS]ummary\s*type=".+".*>.*<\/[sS]ummary>/;
    property.getPropertySummary = function(constructorFunction, propertyName, classFullName) {
        var summary = (property.getPropertySummaryXml(constructorFunction, propertyName, classFullName) || {});
        return summary.textContent || summary.innerHTML;
    };
    
    property.getPropertySummaryXml = function(constructorFunction, propertyName, classFullName) {
        var result;
        if(result = property.getPropertyDescriptionOverride(classFullName + "." + propertyName))
            return new DOMParser().parseFromString(typeof result === "string" ? result : result.description, "application/xml").documentElement;
        
        constructorFunction = constructorFunction.toString();
                
        var search = function(regex) {
            var i = constructorFunction.search(regex);
            if(i !== -1) {
                var func = constructorFunction.substring(0, i);
                var lastLine = func.lastIndexOf("\n");
                if(lastLine > 0) {
                    func = func.substring(lastLine);
                } 
                
                func = func.replace(/^\s+|\s+$/g, '');
                if(summary.test(func)) {
                    return new DOMParser().parseFromString(func.substring(3), "application/xml").documentElement;
                } else {
                    return null;
                }
            }
        }
         
        result = search(new RegExp("\\s*this\\s*\\.\\s*" + propertyName.replace("$", "\\$") + "\\s*="));
        if(result)
            return result;
                
        return search(new RegExp("\\s*this\\s*\\[\\s*\"" + propertyName.replace("$", "\\$") + "\"\\s*\\]\\s*="));
    };
            
    property.getPropertyType = function(xmlDefinition) {
        
        var generics = [];

        var tmp;
        var g = "generic";
        for(var i = 0; tmp = xmlDefinition.getAttribute(g + i); i++) {
            generics.push(tmp);
        }

        return {
            type: xmlDefinition.getAttribute("type"),
            genericTypes: generics
        };  
    };   
    
    property.getPropertyDescriptionOverride = function(classDelimitedPropertyName) {
        
        var current = property.descriptionOverrides;
        enumerate(classDelimitedPropertyName.split("."), function(item) {
            if(!current) return;
            current = current[item];
        });
        
        return current;
    };
	
	property.descriptionOverrides = {
		orienteer: {
			useVirtualCache: {
				description: "<summary type=\"Boolean\">If set to true, pointers to methods called using \"_super\" are cached for faster lookup in the future. Default: true</summary>"
			}
		},
		busybody: {
			callbacks: {
				changeCallback: {
					dispose: "<summary type=\"Object\">A flag to indicate that this flag should be disposed of</summary>"
				}
			},
			utils: {
				observeCycleHandler: {
					instance: "<summary type=\"busybody.utils.observeCycleHandler\">The working observe cycle handler</summary>"
				}
			}
		},
		wipeout: {
			wml: {
				wmlParser: {
					specialTags: "<summary type=\"Object\">Dictionary of tags which cannot be placed within a div, along with the tags they can be placed within</summary>",
					cannotCreateTags: "<summary type=\"Object\">Dictionary of tags which cannot be created by the wipeout template engine</summary>",
					ieReadonlyElements: "<summary type=\"Object\">Dictionary of tags which are readonly once created in IE</summary>"
				}
			},
			template: {
				engine: {
					instance: "<summary type=\"wipeout.template.engine\">The current template engine</summary>"
				}
			},
			settings: {
				asynchronousTemplates: "<summary type=\"Boolean\">Try to load templates from a URL if the template id cannot be found within the DOM</summary>",
				displayWarnings: "<summary type=\"Boolean\">Display wipeout warnings</summary>",
				useElementClassName: "<summary type=\"Object\">Setting this will revert to old HTML class attribute functionality. Exposed for testing purposes only.</summary>"
			},
			utils: {
				find: {
					regex: "<summary type=\"Object\">Collection of regexes used by find.</summary>"
				}
			},
			viewModels: {
				list: {
					removeItem: "<summary type=\"wo.routedEvent\">If caught by an list, remove the item in the args from the list items</summary>"
				}
			}
		},
		wo: {
			bindings:  "<summary type=\"Object\">Collection of wipeout bindings.</summary>"
		}
	};
        
    /*property.descriptionOverrides = {
        wo: {},
        wipeout: {
            base: {
                list: {
                    removeItem: {
                        description: "<summary type=\"wo.routedEvent\">Routed event. Signals that the model in the routed event args is to be removed from the catching list</summary>"
                    }
                },
                "if": {
                    blankTemplateId: {
                        description: "<summary type=\"Object\">An id for a blank template.</summary>"
                    }
                },
                visual: {
                    reservedTags: {
                        description: "<summary type=\"Object\">A dictionary of html tags which wipeout will ignore. For example div and span.</summary>"
                    }
                },
                object: {
                    useVirtualCache: {
                        description: "<summary type=\"Boolean\">If set to true, pointers to methods called using \"_super\" are cached for faster lookup in the future. Default: true</summary>"
                    }
                },
                view: {
                    objectParser: {
                        description: "<summary type=\"Object\">A collection of objects to parse from string. These correspond to a the \"constructor\" property used in setting property types. Custom parsers can be added to this list</summary>"
                    },
                    reservedPropertyNames: {
                        description: "<summary type=\"Array\">A list of property names which are not bound or are bound in a different way, e.g. \"constructor\" and \"id\"</summary>"
                    }
                }
            },
            bindings: {
                bindingBase: {
                    dataKey: {
                        description: "<summary type=\"String\">A key for dom data related to wipeout bindings</summary>"
                    },
                    registered: {
                        description: "<summary type=\"Object\">A cache of all bindings created</summary>"
                    }
                },
                list: {
                    utils: {
                        description: "<summary type=\"Object\">Utils used by the list binding</summary>"                            
                    }
                },
                wipeout: {
                    utils: {
                        description: "<summary type=\"Object\">Utils used by the wipeout binding</summary>"                            
                    }
                },
                'wipeout-type': {
                    utils: {
                        description: "<summary type=\"Object\">Utils used by the wipeout-type binding</summary>"
                    }
                }
            },
            template: {
                asyncLoader: {                    
                    instance: {
                        description: "<summary type=\"wipeout.template.asyncLoader\">A static instance of the async loader</summary>"
                    }
                },
                engine: {
                    closeCodeTag: { 
                        description: "<summary type=\"String\">Signifies the end of a wipeout code block: \"" + wipeout.template.engine.closeCodeTag.replace("<", "&lt;").replace(">", "&gt;") + "\".</summary>"
                    },
                    instance: { 
                        description: "<summary type=\"wipeout.template.engin\">An instance of a wipeout.template.engine which is used by the render binding.</summary>"
                    },
                    openCodeTag: { 
                        description: "<summary type=\"String\">Signifies the beginning of a wipeout code block: \"" + wipeout.template.engine.openCodeTag.replace("<", "&lt;").replace(">", "&gt;") + "\".</summary>"
                    },
                    scriptCache: { 
                        description: "<summary type=\"Object\">A placeholder for precompiled scripts.</summary>"
                    },
                    scriptHasBeenReWritten: { 
                        description: "<summary type=\"Regexp\">Regex to determine whether knockout has rewritten a template.</summary>"
                    },
                    xmlCache: { 
                        description: "<summary type=\"Object\">A repository for processed templates.</summary>"
                    },
                    prototype: {
                        isTemplateRewritten: {
                            description: "<summary type=\"\">A knockout native function</summary>"
                        },
                        makeTemplateSource: {
                            description: "<summary type=\"\">A knockout native function</summary>"
                        },
                        renderTemplate: {
                            description: "<summary type=\"\">A knockout native function</summary>"
                        }
                    }
                }
            },
            utils: {
                find: {
                    regex: {
                        description: "<summary type=\"Object\">Regular expressions used by $find</summary>"
                    }
                },
                html: {
                    cannotCreateTags: {
                        description: "<summary type=\"Object\">A list of html tags which wipeout refuses to create, for example \"html\".</summary>"
                    },
                    specialTags: {
                        description: "<summary type=\"Object\">A list of html tags which cannot be placed inside a div element.</summary>"
                    }
                },
                ko: {
                    array: {
                        description: "<summary type=\"Object\">Items needed to deal with knockout arrays.</summary>"
                    }
                }
            }
        }
    };
    
    for(var i in property.descriptionOverrides.wipeout.base)
        property.descriptionOverrides.wo[i] = property.descriptionOverrides.wipeout.base[i];
    
    for(var i in property.descriptionOverrides.wipeout.utils)
        property.descriptionOverrides.wo[i] = property.descriptionOverrides.wipeout.utils[i];
    */
    return property;  
}); 

compiler.registerClass("wipeoutDocs.models.howDoIApplication", "orienteer", function() {
    
    var articleLink = busybody.observable.extend(function articleLink(title, article) {
        
        this._super();
        
        this.text = title;
        this.article = article;
        this.href = buildHref({article: article});
        this.visible = true;
    });
    
    var buildHref = function(parameters) {
        if(parameters.article && !wo.content.templateExists("Articles." + parameters.article))
            throw "No template for " + parameters.article;
        
        var output = []
        for(var i in parameters)
            output.push(i + "=" + parameters[i]);
        
        return location.protocol + "//" + location.host + location.pathname + "?" + output.join("&");
    };
    
    function HowDoIApplication() {
        this._super();
        
        this.leftHandNav = [{
            header: new articleLink("Get started", "get-started"),
            items: [
                new articleLink("With orienteer", "get-started-with-orienteer"),
                new articleLink("With busybody", "get-started-with-busybody"),
                new articleLink("With Hello World", "get-started-with-hello-world"),
                new articleLink("With MVVM basics", "get-started-with-mvvm-basics"),   
                new articleLink("With MVVM interactions", "get-started-with-mvvm-interactions"),
                new articleLink("With Pluggable MVVM components", "get-started-with-pluggable-mvvm-components"),
                new articleLink("With viewModels", "get-started-with-view-models"),           
                new articleLink("Using viewModels and templates", "get-started-using-view-models")
            ]
        }, {
            header: new articleLink("Using templates", "using-templates"),
            items: [
                new articleLink("Camel casing", "camel-casing"),
                new articleLink("Where do templates go?", "where-to-put-a-template"),
                new articleLink("Rendering Simple Content", "rendering-simple-content"),
                new articleLink("View Models and Html Elements", "view-models-and-html-elements"),
                new articleLink("Accessing html elements and view models", "template-items"),
                new articleLink("Binding Setters", "binding-setters"),
                new articleLink("Setting the template within a template", "content"),
                new articleLink("Complex template properties", "complex-template-properties"),
                new articleLink("Illegal html tags", "illegal-html-tags"),
                new articleLink("Html element/ViewModel name clashes", "definitely-not-a-view-model"),
                new articleLink("Share parent scope", "share-parent-scope")
            ]
        }, {
            header: new articleLink("Define viewModels", "define-view-models"),
            items: [
                new articleLink("Add a default template", "add-a-default-template"),
                new articleLink("Add a default value", "add-a-default-value"),
                new articleLink("Add a function", "add-a-function"),
                new articleLink("Add a static value", "add-a-static-value"),
                new articleLink("Add a static function", "add-a-static-function"),
                new articleLink("Alter the viewModel lifecycle", "view-model-lifecycle"),
                new articleLink("Add Computed Values", "add-compued-values"),
                new articleLink("Add a property binding", "add-a-property-binding"),
                new articleLink("Add a property parser", "add-a-parser"),
                new articleLink("Inherit from another viewModel", "inherit-from-another-view-model")
            ]
        }, {        
            header: new articleLink("Use the model layer", "models"),
            items: [
                new articleLink("Observing array changes", "observable-arrays")
            ]
        }, {        
            header: new articleLink("Bind or set properties", "bind-or-set-propertes"),
            items: [
                new articleLink("Bind to a static value", "bind-to-static-value"),
                new articleLink("Bind to a property on the model", "bind-to-model"),
                new articleLink("Bind to a property on the parent's viewModel", "bind-to-parents-view-model"),
                new articleLink("Set the model from the parent's model", "bind-to-parents-model"),
                new articleLink("Cascading models", "cascading-models"),
                new articleLink("Bind to a global value", "bind-to-global"),
                new articleLink("Set properties using HTML elements", "bind-with-elements"),
                new articleLink("Find an ancestor to bind to", "bind-to-ancestor"),
                new articleLink("Custom $context.find filters", "custom-find-filters")
        ]}, {        
            header: new articleLink("Binding to non observables", "binding-to-non-observables"),
            items: [
                new articleLink("Setting the global binding strategy", "global-binding-strategy"),
                new articleLink("Setting the binding strategy for a view model type", "typed-binding-strategy"),
                new articleLink("Setting the binding strategy for a view model", "instance-binding-strategy")
        ]}, {        
            header: new articleLink("Work with lists", "working-with-lists"),
            items: [
                new articleLink("wo.list control", "wo-list-control"),
                new articleLink("Setting the list template", "list-template"),
                new articleLink("List item lifecycle", "list-item-lifecycle"),
                new articleLink("Creating custom list items", "list-custom-items"),
                new articleLink("Self removing items", "list-self-removing-items")
        ]}, {
            header: new articleLink("The if component", "if-control"),
            items: []
        }, {        
            header: new articleLink("Html Attributes", "html-attributes"),
            items: [
                new articleLink("Value attributes", "value-attributes"),
                new articleLink("Event attributes", "event-attributes"),
                new articleLink("Attribute", "wo-attr"),
                new articleLink("Blur", "wo-blur"),
                new articleLink("Change", "wo-change"),
                new articleLink("Checked Value", "wo-checked-value"),
                new articleLink("Class", "wo-class"),
                new articleLink("Click", "wo-click"),
                new articleLink("Content", "wo-content"),
                new articleLink("Event", "wo-event"),
                new articleLink("Focus", "wo-focus"),
                new articleLink("For each", "wo-foreach"),
                new articleLink("If", "wo-if"),
                new articleLink("Keydown", "wo-keydown"),
                new articleLink("Keypress", "wo-keypress"),
                new articleLink("Keyup", "wo-keyup"),
                new articleLink("Mousedown", "wo-mousedown"),
                new articleLink("Mouseout", "wo-mouseout"),
                new articleLink("Mouseover", "wo-mouseover"),
                new articleLink("Mouseup", "wo-mouseup"),
                new articleLink("On Event", "wo-on-event"),
                new articleLink("Render", "wo-render"),
                new articleLink("Style", "wo-style"),
                new articleLink("Submit", "wo-submit"),
                new articleLink("Value", "wo-value"),
                new articleLink("Visible", "wo-visible")
        ]}, {        
            header: new articleLink("Custom html attributes", "custom-html-attributes"),
            items: [
                new articleLink("Subscribe to an element event", "html-attr-on-element-event"),
                new articleLink("Get the setter string", "html-attr-get-the-setter-string"),
                new articleLink("Get the value of the setter", "html-attr-get-the-value-of-the-setter"),
                new articleLink("Observe the value of the setter", "html-attr-observe-the-value-of-the-setter"),
                new articleLink("Set the value of the setter", "html-attr-set-the-value-of-the-setter"),
                new articleLink("Access another wipeout attribute", "html-attr-get-other-attr"),
                new articleLink("Dispose of the attribute", "html-attr-dispose-of-the-attribute"),
		]}, {        
            header: new articleLink("Property flags", "property-flags"),
            items: [
		]}, {        
            header: new articleLink("Binding Types", "binding-types"),
            items: [
                new articleLink("One way bindings", "bind-one-way"),
                new articleLink("Two way bindings", "bind-two-way"),
                new articleLink("One way to source bindings", "bind-one-way-to-source"),
                new articleLink("Setter binding", "bind-no-way"),
                new articleLink("Change default binding", "change-default-binding")
		]}, {        
            header: new articleLink("Custom binding", "custom-binding"),
            items: [
                new articleLink("Get the name of the property", "get-the-name-of-the-property"),
                new articleLink("Get the setter string", "get-the-setter-string"),
                new articleLink("Get the value of the property", "get-the-value-of-the-property"),
                new articleLink("Get the value of the setter", "get-the-value-of-the-setter"),
                new articleLink("Observe the value of the property", "observe-the-value-of-the-property"),
                new articleLink("Observe the value of the setter", "observe-the-value-of-the-setter"),
                new articleLink("Set the value of the property", "set-the-value-of-the-property"),
                new articleLink("Set the value of the setter", "set-the-value-of-the-setter"),
                new articleLink("Dispose of the binding", "dispose-of-the-binding"),
		]}, {        
            header: new articleLink("Parsers", "parsers"),
            items: [
                new articleLink("Using a parser", "using-a-parser"),
                new articleLink("Boolean Parser", "boolean-parser"),
                new articleLink("Date Parser", "date-parser"),
                new articleLink("Float Parser", "float-parser"),
                new articleLink("Int Parser", "int-parser"),
                new articleLink("Json Parser", "json-parser"),
                new articleLink("Regexp Parser", "regexp-parser"),
                new articleLink("String Parser", "string-parser"),
                new articleLink("Create a custom parser", "custom-parser")
		]}, {
            header: new articleLink("Binding Filters", "filters"),
            items: [
                new articleLink("A List Filter", "list-filter"),
                new articleLink("A Two Way Date Formatter", "date-parser-filter")
		]}, {
            header: new articleLink("Events", "events"),
            items: [
                new articleLink("Routed Events", "routed-events")
		]}, {
            header: new articleLink("Manually create a wipeout application", "manually-create-an-application"),
            items: []
        }/*        
            header: new articleLink("Profiling", "profiling"),
            items: []
        }*/];
        
        this.flatList = [];
        this.index();
    };
    
    HowDoIApplication.prototype.search = function(searchTerm) {
        if(!searchTerm || searchTerm.length < 2)
            searchTerm = "";
        
        var _this = this;        
        var token = this.token = {};        
        setTimeout(function() {
            if(token === _this.token)
                _this._search(searchTerm);
        }, 100);
    };
    
    HowDoIApplication.prototype._search = function(searchTerm) {
        if(!searchTerm) {
            wipeout.utils.obj.enumerateArr(this.flatList, function(item) {
                if(!item.visible)item.visible = true;
            }, this);
            
            return;
        }
        
        searchTerm = searchTerm.toLowerCase().split(/\s+/);        
        
        wipeout.utils.obj.enumerateArr(this.flatList, function(item) {
            
            var visible = true;
            var title = item.text.toLowerCase();
            for(var i = 0, ii = searchTerm.length; i < ii; i++)
                visible &= (title.indexOf(searchTerm[i]) !== -1 || item.body.indexOf(searchTerm[i]) !== -1);
            
            item.visible = visible;
        }, this);
    };
    
    HowDoIApplication.prototype.index = function() {
        this.flatList.length = 0;
        wipeout.utils.obj.enumerateArr(this.leftHandNav, function(group) {
            if(group.header)
                this.flatList.push(group.header);
            
            wipeout.utils.obj.enumerateArr(group.items, function(item) {
                this.flatList.push(item);
            }, this);
        }, this);
        
        wipeout.utils.obj.enumerateArr(this.flatList, function(item) {
            item.body = document.getElementById("Articles." + item.href.substr(item.href.indexOf("article=") + 8)).text.toLowerCase();
        }, this);        
    };
    
    return HowDoIApplication;
});

compiler.registerClass("wipeoutDocs.models.pages.displayItem", "orienteer", function() {
    return function(name) {
        this._super();
        
        this.title = name;
    };
});

compiler.registerClass("wipeoutDocs.models.pages.landingPage", "wipeoutDocs.models.pages.displayItem", function() {
    return function(title) {
       this._super(title); 
    }
});


compiler.registerClass("wipeoutDocs.viewModels.apiApplication", "wipeoutDocs.viewModels.application", function() {
    
    function ApiApplication() {
        this._super("wipeoutDocs.viewModels.apiApplication");
		
		this.observe("model.content.title", function (oldVal, newVal) {
			$("#headerText").html(newVal);
		});
    };
    
    ApiApplication.prototype.onApplicationInitialized = function() { 
        this._super();
    };
    
    ApiApplication.prototype.route = function(query) { 
        var temp = wipeoutDocs.models.apiApplication.getModel(query);        
        if (temp)
            this.model.content = temp;
    };
    
    ApiApplication.prototype.routeTo = function(item) {
        history.pushState(null, '', wipeoutDocs.models.apiApplication.routableUrl(item));
        crossroads.parse(location.pathname + location.search);
    };
    
    return ApiApplication;
});


compiler.registerClass("wipeoutDocs.viewModels.application", "wo.view", function() {
    
    function Application(templateId) {
        if(this.constructor === Application) throw "Cannot create an instance of an abstract class";
        
        this._super(templateId);
                
        var _this = this;
        crossroads.addRoute('/{site}/{version}/{page}{?query}', function(site, version, page, query){
            _this.route(query);
        });
    };
    
    Application.prototype.onApplicationInitialized = function() {
        this.appInit = true;
    };
    
    Application.prototype.route = function(query) {
        throw "Abstract method must be overridden";
    };
    
    Application.prototype.onRendered = function() {
        this._super.apply(this, arguments);
        
		this.observe("templateItems.content.model", function() {                
			window.scrollTo(0,0);
		});
    };
    
    return Application;
});

compiler.registerClass("wipeoutDocs.viewModels.components.codeBlock", "wo.view", function() {
    var codeBlock = function(templateId) {
        this._super(templateId || "wipeoutDocs.viewModels.components.codeBlock");        
        this.code = null;
        
        this.observe("code", this._onCodeChanged, {context: this});   
    };
	
	codeBlock.prototype.onInitialized = function () {
		this._super();
		     
        this.computed("renderCode", function() {
            return this.code ? this.code.replace(/</g, "&lt;") : this.code;
        });
	}
    
    codeBlock.prototype._onCodeChanged = function(oldVal, newVal) {
		return this.onCodeChanged(newVal);
    };
    
    codeBlock.prototype.onCodeChanged = function(newVal) {
    };
    
    codeBlock.prototype.onRendered = function() {
        this._super.apply(this, arguments);
        prettyPrint(null, this.templateItems.codeBlock);
        
        this.highlightParts();
    };
    
    codeBlock.prototype.highlightParts = function () {
        if (!this.highlight) return;
        
        enumerate(this.highlight instanceof Array ? this.highlight : [this.highlight], function (item) {
            $("span:contains('" + item + "')", this.templateItems.codeBlock)
                .css("font-weight", "bold").css("background", "yellow");
        }, this);
    };
    
    return codeBlock;
});

compiler.registerClass("wipeoutDocs.viewModels.components.dynamicRender", "wo.content", function() {
    var dynamicRender = function() {
        this._super();
        
        this.content = null;
        
        this.templateId = wo.content.createAnonymousTemplate("{{$this.content}}");
    };
    
    dynamicRender.prototype.onModelChanged = function(newVal) {
        this._super(newVal);
               
        var oldVal = this.content;
        
        if(newVal == null) {
            this.content = null;
        } else {
            var newVm = null;
            
            if(newVal instanceof wipeoutDocs.models.pages.landingPage) {
                newVm = new wipeoutDocs.viewModels.pages.landingPage();
            } else if(newVal instanceof wipeoutDocs.models.descriptions.class) {
                newVm = new wipeoutDocs.viewModels.pages.classPage();
            } else if(newVal instanceof wipeoutDocs.models.descriptions.event) {
                newVm = new wipeoutDocs.viewModels.pages.eventPage();
            } else if(newVal instanceof wipeoutDocs.models.descriptions.property) {
                newVm = new wipeoutDocs.viewModels.pages.propertyPage();
            } else if(newVal instanceof wipeoutDocs.models.descriptions.function) {
                newVm = new wipeoutDocs.viewModels.pages.functionPage();
            } else if(newVal instanceof wipeoutDocs.models.components.StaticPageTreeViewBranchTemplate) {
                newVm = new wo.view(newVal.templateId);
            } else {
                throw "Unknown model type";
            }
            
            newVm.model = newVal;
            this.content = newVm;
        }
    };  
    
    return dynamicRender
});

compiler.registerClass("wipeoutDocs.viewModels.components.jCodeBlock", "wipeoutDocs.viewModels.components.codeBlock", function () {
    var jCodeBlock = function() {
        this._super.apply(this, arguments);
    };
    
    jCodeBlock.prototype.onCodeChanged = function(newVal) {  
        new Function(newVal
            .replace(/\&lt;/g, "<")
            .replace(/\&amp;/g, "&")
            .replace(/\&gt;/g, ">"))();
    };

    return jCodeBlock;
});

compiler.registerClass("wipeoutDocs.viewModels.components.newTemplateCodeBlock", "wipeoutDocs.viewModels.components.templateCodeBlock", function() {
    var newTemplateCodeBlock = function() {
        this._super.apply(this, arguments);
    };
    
    newTemplateCodeBlock.prototype.onCodeChanged = function(newVal) {
        
        if (this.newScriptId) {
            var oldScript = document.getElementById(this.newScriptId);
            if (oldScript)
                oldScript.parentElement.removeChild(oldScript);
                
            delete wipeout.template.engine.instance.templates[this.newScriptId];
        }
        
        return this._super.apply(this, arguments);
    };
    
    newTemplateCodeBlock.prototype.getTemplateHtml = function(newVal) {
        
        if(!this.newScriptId) throw "You must specify a script id";
        
        return '<script type="text/xml" id="' + 
            this.newScriptId + '">' + 
            this._super(newVal.replace(/\&lt;/g, "<").replace(/\&gt;/g, ">")) + 
            "</script>";
    };
    
    return newTemplateCodeBlock;
});

compiler.registerClass("wipeoutDocs.rl", "wo.view", function() {
    var RouteLink = function() {
        this._super("wipeoutDocs.viewModels.components.routeLink");
    };
    
    RouteLink.prototype.onRendered = function(oldValues, newValues) {
        this._super(oldValues, newValues);
        
        $(this.templateItems.link).on("click", function(e) {
            if(e.button === 1)
                return;
            
            e.preventDefault();
            window.history.pushState(null, "", this.href);
            crossroads.parse(location.pathname + location.search);
        });
    }
    
    return RouteLink;
});

compiler.registerClass("wipeoutDocs.viewModels.components.templateCodeBlock", "wipeoutDocs.viewModels.components.codeBlock", function() {
    var templateCodeBlock = function() {
        templateCodeBlock.staticConstructor();
        this._super.apply(this, arguments);
    };
    
    var templateDiv;
    templateCodeBlock.staticConstructor = function() {
        if(templateDiv) return;
        
        templateDiv = document.createElement("div");
        templateDiv.setAttribute("style", "display: none");
        document.getElementsByTagName("body")[0].appendChild(templateDiv);
    };
    
    templateCodeBlock.prototype.getTemplateHtml = function(newVal) {
        return newVal
            .replace(/\&lt;/g, "<")
            .replace(/\&gt;/g, ">");
    };
    
    templateCodeBlock.prototype.onCodeChanged = function(newVal) {  
        templateDiv.innerHTML += this.getTemplateHtml(newVal);
    };
    
    return templateCodeBlock;
});

compiler.registerClass("wipeoutDocs.viewModels.components.treeViewBranch", "wo.view", function() {
    var treeViewBranch = function() {
        this._super(treeViewBranch.nullTemplate);
        
        this.isOpen = false;
        
        this.computed("glyphClass", function() {
            var open = this.isOpen,
                model = this.model,
                hasBranches = model && model.branches && model.branches.length;
                        
            if(this.isOpen && hasBranches)                
                return "glyphicon glyphicon-chevron-down";
            if(model && model.href && !hasBranches)                
                return "glyphicon glyphicon-chevron-right";
            
            return "";
        });
		
		this.observe("model", function(oldVal, newVal) {

			if(newVal && (newVal.branches || newVal.href)) {
				this.templateId = treeViewBranch.branchTemplate;
			} else if(newVal) {
				this.templateId = treeViewBranch.leafTemplate;
			} else {
				this.templateId = treeViewBranch.nullTemplate;
			}
		}, {context: this});
    };
    
    treeViewBranch.branchTemplate = "wipeoutDocs.viewModels.components.treeViewBranch_branch";
    treeViewBranch.leafTemplate = "wipeoutDocs.viewModels.components.treeViewBranch_leaf";
    treeViewBranch.nullTemplate = wipeout.viewModels.content.createAnonymousTemplate("");
	
    treeViewBranch.prototype.select = function() {
        this.isOpen = !this.isOpen;
                
        if(this.model.href) {  
            if (this.isOpen || !this.model.branches || !this.model.branches.length) {
                history.pushState(null, "", this.model.href);
                crossroads.parse(location.pathname + location.search);
            }
        }
    };
    
    return treeViewBranch;
});


compiler.registerClass("wipeoutDocs.viewModels.components.usageCodeBlock", "wipeoutDocs.viewModels.components.codeBlock", function() {
    var usageCodeBlock = function() {
        this._super("wipeoutDocs.viewModels.components.usageCodeBlock");
        
        this.usage = null;
        
        this.showDefinitionCode = true;
    };
    
    usageCodeBlock.prototype.onCodeChanged = function(newVal) {  
        this.usage = wo.content.createAnonymousTemplate(newVal
            .replace(/\&lt;/g, "<")
            .replace(/\&amp;/g, "&")
            .replace(/\&gt;/g, ">"));
    };
    
    return usageCodeBlock;
});

wo.viewModel("wipeoutDocs.viewModels.components.versioned")
.templateId(wo.content.createAnonymousTemplate('<div class="well">\
    <fieldset>\
        <legend>Version > {{$this.version}}</legend>\
        <wo.view template-id="$this.contentTemplateId" share-parent-scope="true"></wo.view>\
    </fieldset>\
</div>'))
.initialize(function () {
    wipeout.viewModels.content.createTemplatePropertyFor(this, "contentTemplateId", "contentTemplate");
})
.parser("version", "float")
.parser("contentTemplate", "template")
.binding("contentTemplate", "templateProperty")
.build();


compiler.registerClass("wipeoutDocs.viewModels.howDoIApplication", "wipeoutDocs.viewModels.application", function() {
    
    var apiTemplateId;
    var staticConstructor= function() {
        if(apiTemplateId)
            return;
        
        apiTemplateId = wo.content.createAnonymousTemplate('<h1 data-bind="text: $context.find(wipeoutDocs.viewModels.howDoIApplication).apiPlaceholderName"></h1>\
<wipeout-docs.view-models.components.dynamic-render model="$context.find(wipeoutDocs.viewModels.howDoIApplication).apiPlaceholder"></wipeout-docs.view-models.components.dynamic-render>');
    };
    
    function HowDoIApplication() {
        staticConstructor();
        
        this._super("wipeoutDocs.viewModels.howDoIApplication");
        
        this.contentTemplate = 'wipeoutDocs.viewModels.welcome-template';
        
        this.apiPlaceholder = null;
        this.apiPlaceholderName = null;
        
        var placeholder = document.getElementById("headerText");
        var textbox = $('<input style="margin-top: 20px;" type="text" placeholder="Search Docs..."></input>')[0];
        placeholder.parentElement.insertBefore(textbox, placeholder);
        
        var _this = this;
        textbox.addEventListener("keyup", function() {
            _this.model.search(textbox.value);
        });
        
        textbox.addEventListener("change", function() {
            _this.model.search(textbox.value);
        });
    };
    
    HowDoIApplication.prototype.route = function(query) { 
        if(query.article) {
            this.openArticle(query.article);
        } else if (query.type === "api") {
            this.apiPlaceholder = wipeoutDocs.models.apiApplication.getModel(query);
            if(this.apiPlaceholder) {
                this.apiPlaceholderName = this.apiPlaceholder instanceof wipeoutDocs.models.descriptions.class ? this.apiPlaceholder.classFullName : "";
                this.contentTemplate = apiTemplateId;
            }
        } else {
            this.contentTemplate = wo.content.createAnonymousTemplate("");
        }
    };
    
    HowDoIApplication.prototype.openArticle = function(article) {
        $(".list-group-item-info", this.templateItems.leftNav).removeClass("list-group-item-info");
        
        delete window.demoApp;
        this.contentTemplate = "Articles." + article;
        
        var current, groups = this.templateItems.articles.getItemViewModels();
        for(var i = 0, ii = groups.length; i < ii; i++) {
            if(groups[i].templateItems.header && groups[i].templateItems.header.model.header.article === article) {
                this.scrollToArticle(groups[i].templateItems.header);
                return;
            }
            
            var items = groups[i].templateItems.items ? groups[i].templateItems.items.getItemViewModels() : [];
            for (var j = 0, jj = items.length; j < jj; j++) {
                if(items[j].model.article === article) {
                    this.scrollToArticle(items[j]);
                    return;
                }
            }
        }        
    };
    
    HowDoIApplication.prototype.scrollToArticle = function(articleVm) { 
                
        var articleElement = articleVm.$domRoot.openingTag;
        while (articleElement && articleElement.nodeType !== 1)
            articleElement = articleElement.nextSibling;
        
        if(!articleElement) return;
        if(!$(articleElement).hasClass("active"))
            $(articleElement).addClass("list-group-item-info");
        
        var _do = function() {
            window.scrollTo(0, 0);
            $(this.templateItems.leftNav).animate({
                scrollTop: $(articleElement).offset().top + this.templateItems.leftNav.scrollTop - 80
            }, 500);
        };
        
        setTimeout(_do.bind(this), 100);
    };
    
    return HowDoIApplication;
});

compiler.registerClass("wipeoutDocs.viewModels.pages.classItemTable", "wo.list", function() {
    return function() {
        this._super("wipeoutDocs.viewModels.pages.classItemTable", "wipeoutDocs.viewModels.pages.classItemRow");
        
        this.itemType = "Function";
    };
});


    compiler.registerClass("wipeoutDocs.viewModels.pages.classPage", "wo.view", function() {
        var classPage = function() {
            this._super("wipeoutDocs.viewModels.pages.classPage");

            this.computed("usagesTemplateId", function() {
                if(this.model) {
                    var className = this.model.classFullName + classPage.classUsagesTemplateSuffix;
                    if(document.getElementById(className))
                        return className;
                }

                return wo.content.createAnonymousTemplate("");
            });
        };

        classPage.classUsagesTemplateSuffix = "_ClassUsages";
        
        return classPage;
    });

compiler.registerClass("wipeoutDocs.viewModels.pages.eventPage", "wo.view", function() {
    return function() {
        this._super("wipeoutDocs.viewModels.pages.eventPage");
    };
});

compiler.registerClass("wipeoutDocs.viewModels.pages.functionPage", "wo.view", function() {
    var functionPage = function() {
        this._super("wipeoutDocs.viewModels.pages.functionPage");
        
        this.showCode = false;
        
        this.showReturnValue = true;
                
        this.computed("usagesTemplateId", function() {
            if(this.model) {
                var name = this.model.fullyQualifiedName + functionPage.classUsagesTemplateSuffix;
                if(document.getElementById(name))
                    return name;
            }

            return wo.content.createAnonymousTemplate("");
        });
    };
    
    functionPage.prototype.fixJsFunction = function (func) {
        var code = func.toString().replace(/\t/g, '    ').replace(/\s$/g, "");
        var rx = /\n/g, result, tmp;
        while (tmp = rx.exec(code))
            result = tmp.index;
        
        if (!/^\s*\}$/.test(tmp = code.substr(result)))
            return code;
        
        result = "\\n";
        for (var i = 1, ii = tmp.length; i < ii && /^ $/.test(tmp[i]); i++)
            result += " ";
        
        return code.replace(new RegExp(result, "g"), "\n");
    };
    
    functionPage.classUsagesTemplateSuffix = "_FunctionUsages";
    
    return functionPage;
});

wo.filters.yesNo = {
	parentToChild: function (val1) {
		return val1 ? "Yes" : "No";
	},
	childToParent: function (val1) {
		return /^\s*[Yy][Ee][Ss]\s*$/.test(val1);
	}
};


compiler.registerClass("wipeoutDocs.viewModels.pages.landingPage", "wo.view", function() {
    return function() {
        this._super("wipeoutDocs.viewModels.pages.landingPage");
    };
});

compiler.registerClass("wipeoutDocs.viewModels.pages.propertyPage", "wo.view", function() {
    function propertyPage() {
        this._super("wipeoutDocs.viewModels.pages.propertyPage");
        
        this.computed("usagesTemplateId", function() {
            if(this.model) {
                var name = this.model.fullyQualifiedName + propertyPage.classUsagesTemplateSuffix;
                if(document.getElementById(name))
                    return name;
            }

            return wo.content.createAnonymousTemplate("");
        });
    };
    
    propertyPage.classUsagesTemplateSuffix = "_PropertyUsages";
    
    return propertyPage;
});

	compiler.compile(window.wipeoutDocs);
	delete compiler;
}());