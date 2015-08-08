Class("wipeout.template.engine", function () {
    
	var fixTemplateId = (function () {
		var blankTemplateId;
		return function (templateId) {
            
            if (templateId) {
                var t = templateId;
                templateId = templateId.replace(/\s/g, "").toLowerCase();
                if (templateId[0] === "/" || templateId[0] === "\\")
                    templateId = templateId.substr(1);
                
                if (!templateId)
                    throw "Invalid templateId: " + t;
                
                return templateId;
            }
            
			return blankTemplateId || 
				(blankTemplateId = fixTemplateId(wipeout.viewModels.content.createAnonymousTemplate("")));
		};
	}());
        
    function engine () {
		///<summary>The wipeout template engine</summary>
		
		///<summary type="Object">Cached templates</summary>
        this.templates = {};
        
		///<summary type="wipeout.utils.dictionary">Cached view model initializers</summary>
        this.xmlIntializers = new wipeout.utils.dictionary();
    }
    
    engine.prototype.setTemplateWithModules = function (templateId, template, callback) {
		///<summary>Associate a template string with a template id and load any modules in that template</summary>
        ///<param name="templateId" type="String">The template id</param>
        ///<param name="template" type="String|wipeout.wml.wmlAttribute">The template</param>
        ///<param name="callback" type="Function" optional="true">A callback which the compiled template will be passed to</param>
        ///<returns type="Boolean">True if synchronus, false if asynchronus</returns>
		
        if (!(typeof template === "string")) {
            callback(this.setTemplate(templateId, template));
            return;
        }
        
		if (isNullOrWhiteSpace(templateId)) throw "Invalid template id";
        
		templateId = fixTemplateId(templateId);
        if (this.templates[templateId]) throw "Template " + templateId + " has already been defined.";
		
        this.templates[templateId] = new wipeout.template.templateModuleLoader(template);
        return this.templates[templateId].addCallback((function (template) {
            this.templates[templateId] = null;  //setTemplate will need this to be null
            template = this.setTemplate(templateId, template);
            if (callback)
                callback(this.templates[templateId]);
        }).bind(this));
    };
    
    engine.prototype.setTemplate = function (templateId, template) {
		///<summary>Associate a template string with a template id</summary>
        ///<param name="templateId" type="String">The template id</param>
        ///<param name="template" type="String|wipeout.wml.wmlAttribute">The template</param>
        ///<returns type="wipeout.template.rendering.compiledTemplate">The template</returns>
		
		if (isNullOrWhiteSpace(templateId)) throw "Invalid template id";
        
		templateId = fixTemplateId(templateId);
        if (this.templates[templateId]) throw "Template " + templateId + " has already been defined.";
		
        if (typeof template === "string")
            template = wipeout.wml.wmlParser(template);
		else if (template.nodeType === 2)
            template = wipeout.wml.wmlParser(template.value);
        
        return this.templates[templateId] = new wipeout.template.rendering.compiledTemplate(template);
    };
    
    engine.prototype.getTemplateXml = function (templateId, callback) {  
		///<summary>Load a template and pass the value to a callback. The load may be synchronus (if the template exists) or asynchronus) if the template has to be loaded.</summary>
        ///<param name="templateId" type="String">The template id</param>
        ///<param name="callback" type="Function">The callback</param>
        ///<returns type="Object">Null, if the template is loaded, an object with a "cancel" function to cancel the load</returns>
	
		templateId = fixTemplateId(templateId);      
        return this.compileTemplate(templateId, (function() {
            callback(this.templates[templateId].xml);
        }).bind(this));
    };
    
    engine.prototype.compileTemplate = function (templateId, callback) {
		///<summary>Load a template and pass the value to a callback. The load may be synchronus if the template exists or asynchronus if the template has to be loaded.</summary>
        ///<param name="templateId" type="String">The template id</param>
        ///<param name="callback" type="Function">The callback</param>
        ///<returns type="Object">Null, if the template is loaded, an object with a "cancel" function to cancel the load</returns>
        
		templateId = fixTemplateId(templateId);
			
        // if the template exists
        if (this.templates[templateId] instanceof wipeout.template.rendering.compiledTemplate) {
            callback(this.templates[templateId]);
            return null;
        }
        
        // if the template does not exist        
        if (!this.templates[templateId]) {
            
            // if the template exists in the DOM but has not been loaded
            var script;      
            if (script = document.getElementById(templateId)) {
                return this.setTemplateWithModules(
                    templateId, trimToLower(script.tagName) === "script" ? script.text : script.innerHTML, callback);
            } 

            // if an async process has not been kicked off yet
            if (wipeout.settings.asynchronousTemplates) {
                var _this = this;
                this.templates[templateId] = new wipeout.template.loader(templateId);
                var cancel1 = this.templates[templateId].addCallback(function (template) {
                    
                    // setTemplateWithModules will need this property to be null
                    _this.templates[templateId] = null;
                    cancel2 = _this.setTemplateWithModules(templateId, template, callback);
                }), cancel2;
                
                if (cancel1) {
                    cancel1.onCancel(function () {
                        if (cancel2)
                            cancel2.cancel();
                    });
                }
                
                return cancel1;
            }
        }
        
        // if the template is in the middle of an async load
        if (this.templates[templateId] instanceof wipeout.base.asyncLoaderBase) {
            var _this = this;
            var cancel = this.templates[templateId].addCallback(function () {
                setTimeout(function () {
                    // when operation completes, re-add the callback to try again
                    var c = _this.compileTemplate(templateId, callback);
                    if (cancel && c)
                        cancel.onCancel(function () {
                            c.cancel();
                        });
                });
            });
            
            return cancel;
        } 
        
        // otherwise, bad template
        throw "Could not load template \"" + templateId + "\".";    //TODE
    };
    
    engine.prototype.getVmInitializer = function (wmlInitializer) {
		///<summary>Get a compiled initializer from a piece of wml</summary>
        ///<param type="wipeout.wml.wmlElement" name="wmlInitializer">The xml</param>
        ///<returns type="wipeout.template.initialization.compiledInitializer">The initializer</returns>
		
        var tmp;
        return (tmp = this.xmlIntializers.value(wmlInitializer)) ?
            tmp :
            this.xmlIntializers.add(wmlInitializer, new wipeout.template.initialization.compiledInitializer(wmlInitializer));
    };
    
    engine.instance = new engine();
        
    return engine;
});