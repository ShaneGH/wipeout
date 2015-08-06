
Class("wipeout.viewModels.content", function () {    

    var content = wipeout.viewModels.view.extend(function content(templateId, model) {
        ///<summary>Expands on view and view functionality to allow the setting of anonymous templates</summary>
        ///<param name="templateId" type="string" optional="true">The template id. If not set, defaults to a blank template</param>
        ///<param name="model" type="Any" optional="true">The initial model to use</param>
        this._super(templateId, model);

        ///<summary type="String">The template which corresponds to the templateId for this item</summary>
        //this.setTemplate = "";
        
        wipeout.viewModels.content.createTemplatePropertyFor(this, "templateId", "setTemplate");
    });  
    
    content.addGlobalParser("setTemplate", "template");
    content.addGlobalBindingType("setTemplate", "setTemplateToTemplateId");
    
    content.createTemplatePropertyFor = function(owner, templateIdProperty, templateProperty) {
        ///<summary>Binds the template property to the templateId property so that a changee in one reflects a change in the other</summary>
        ///<param name="owner" type="wipeout.base.observable" optional="false">The owner of the template and template id properties</param>
        ///<param name="templateIdProperty" type="String" optional="false">The name of the templateId property</param>
        ///<param name="templateProperty" type="String" optional="false">The name of the template property.</param>
                
        return new boundTemplate(owner, templateIdProperty, templateProperty);
    };
    
    content.createAnonymousTemplate = (function () {
        
        var i = Math.floor(Math.random() * 1000000000), 
            anonymousTemplateId = "WipeoutAnonymousTemplate",
            templateStringCache = {};
        
        function newTemplateId () {
            return anonymousTemplateId + "-" + (++i);
        }
                
        return function (templateStringOrXml) {
            ///<summary>Creates an anonymous template within the DOM and returns its id</summary>
            ///<param name="templateStringOrXml" type="String" optional="false">Gets a template id for an anonymous template</param>
            ///<returns type="String">The template id</returns>

            if (typeof templateStringOrXml === "string") {
				// look in cached template strings and create template if necessary
                if (!templateStringCache[templateStringOrXml]) {
                    var id = newTemplateId();
                    wipeout.template.engine.instance.setTemplate(id, templateStringOrXml);  //SETTEMPLATEINSTANCE 1
                    templateStringCache[templateStringOrXml] = id;
                }

                return templateStringCache[templateStringOrXml];
            } else {
				// look for cached id within xml or create one
                if (!templateStringOrXml[anonymousTemplateId]) {
                    var id = newTemplateId();
                    wipeout.template.engine.instance.setTemplate(id, templateStringOrXml);  //SETTEMPLATEINSTANCE 2
                    templateStringOrXml[anonymousTemplateId] = id;
                }

                return templateStringOrXml[anonymousTemplateId];
            }
        };
    })();
    
    function boundTemplate (owner, templateIdProperty, templateProperty) {
        ///<summary>Binds the template property to the templateId property so that a changee in one reflects a change in the other</summary>
        ///<param name="owner" type="wipeout.base.observable" optional="false">The owner of the template and template id properties</param>
        ///<param name="templateIdProperty" type="String" optional="false">The name of the templateId property</param>
        ///<param name="templateProperty" type="String" optional="false">The name of the template property.</param>
        
        this.currentTemplate = owner[templateProperty];
        this.currentTemplateId = owner[templateIdProperty];
        
        this.owner = owner;
        this.templateIdProperty = templateIdProperty;
        this.templateProperty = templateProperty;
        
        // bind template to template id for the first time
        this.refreshTemplate(this.currentTemplateId);
        
        this.d1 = owner.observe(templateIdProperty, this.onTemplateIdChange, {context: this});
        this.d2 = owner.observe(templateProperty, this.onTemplateChange, {context: this});
    };
        
    boundTemplate.prototype.dispose = function() {
        ///<summary>Dispose of this binding</summary>
		
        this.d1.dispose();
        this.d2.dispose();
    };
    
    boundTemplate.prototype.refreshTemplate = function(templateId) {
		
        this.pendingLoad = wipeout.template.engine.instance.getTemplateXml(templateId, (function (template) {
            delete this.pendingLoad;                
            this.currentTemplate = this.owner[this.templateProperty] = template;
        }).bind(this)); 
    };

    boundTemplate.prototype.onTemplateIdChange = function(oldVal, newVal) {
        if (newVal === this.currentTemplateId) {
            this.currentTemplateId = null;
            return;
        }

        this.currentTemplateId = null;

        if (this.pendingLoad)
            this.pendingLoad.cancel();

        this.refreshTemplate(newVal);
    };

    boundTemplate.prototype.onTemplateChange = function(oldVal, newVal) {
        if (newVal === this.currentTemplate) {
            this.currentTemplate = null;
            return;
        }

        this.currentTemplate = null;
        this.currentTemplateId = this.owner[this.templateIdProperty] = wipeout.viewModels.content.createAnonymousTemplate(newVal);
    }
    
    return content;
});