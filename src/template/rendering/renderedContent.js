
Class("wipeout.template.rendering.renderedContent", function () {
    
    var renderedContent = busybody.disposable.extend(function renderedContent (element, name, parentRenderContext) {
        ///<summary>The begin and end comment tags which surround and render a view model</summary>
        ///<param name="element" type="Element">The html element to replace with the view model</param>
        ///<param name="name" type="String">The content of the rendered comment tags</param>
        ///<param name="parentRenderContext" type="wipeout.template.context" optional="true">The render context of the parent view model</param>
                        
		this._super();
		
        name = wipeout.utils.obj.trim(name);
        
        this.parentRenderContext = parentRenderContext;
        
        //issue-#38
        //this.openingTag = document.createElement("script");
		
        // create opening and closing tags and link to this
		///<summary type="Comment">The opening tag</summary>
        this.openingTag = document.createComment(" " + name + " ");
        this.openingTag.wipeoutOpening = this;
		
		///<summary type="Comment">The closing tag</summary>
        this.closingTag = document.createComment(" /" + name + " ");
        this.closingTag.wipeoutClosing = this;
        
        // add this to DOM and remove placeholder
        element.parentNode.insertBefore(this.openingTag, element);
        element.parentNode.insertBefore(this.closingTag, element);
        element.parentNode.removeChild(element);
    });
	
	renderedContent.prototype.rename = function (name) {
		///<summary>Rename the opeining and closing tags</summary>
        ///<param name="name" type="String">The new name</param>
		
		this.openingTag.nodeValue = " " + name + " ";
		this.closingTag.nodeValue = " /" + name + " ";
	};
	    
    renderedContent.prototype.renderArray = function (array) {
		///<summary>Render an array</summary>
        ///<param name="array" type="Array">The array to render</param>
        
        // if a previous request is pending, cancel it
        if (this.asynchronous) {
            this.asynchronous.cancel();
			delete this.asynchronous;
		}
                
        this.unRender();
        
		var ra = new wipeout.template.rendering.renderedArray(array, this);
        this.disposeOfBindings = ra.dispose.bind(ra);
		
        if (array instanceof busybody.array)
            ra.registerDisposable(array.observe(ra.render, {context: ra, useRawChanges: true}));
		
		ra.render([{
			type: "splice",
			addedCount: array.length,
			removed: [],
			index: 0
		}]);
	};
	
    renderedContent.prototype.render = function (object, arrayIndex) {
		///<summary>Render a view model</summary>
        ///<param name="object" type="Any">The The view model</param>
        ///<param name="arrayIndex" type="Number" optional="true">The array index if the item is part of an array</param>
		
        if (object instanceof Array) {
            this.renderArray(object);
            return;
        }
        
        this.unRender();
		
		this.viewModel = object;
        
        if (this.viewModel == null)
            return;
		
		this.renderContext = this.parentRenderContext ? 
			this.parentRenderContext.contextFor(this.viewModel, arrayIndex) :
			new wipeout.template.context(this.viewModel, null, arrayIndex);
        
        if (this.viewModel instanceof wipeout.viewModels.view) {
			this.templateChangeKey = this.registerDisposable(
                wipeout.events.event.instance.register(this.viewModel, wipeout.viewModels.view.$synchronusTemplateChangeEvent, this.templateHasChanged, this));
			
            this.viewModel.$domRoot = this;
            this.templateObserved = this.viewModel.observe("templateId", this._template, {context: this, activateImmediately: true});
			
            if (this.viewModel.templateId)
                this.template(this.viewModel.templateId);
        } else {
            this.appendHtml(this.viewModel.toString());
        }
    };
	
	renderedContent.prototype.templateHasChanged = function () {
        ///<summary>Re-template the view model</summary>
		
		this.template(this.viewModel.templateId);
	};
    
    renderedContent.prototype._template = function(oldTemplateId, templateId) {
        ///<summary>Render the view model with the given template</summary>
        ///<param name="oldTemplateId" type="String">The previous value (unused)</param>
        ///<param name="templateId" type="String">A pointer to the template to apply</param>
		
        this.template(templateId);
    };
	
	renderedContent.prototype.unRender = function(leaveDeadChildNodes) {
		///<summary>Dispose of all items created during the rendering process</summary>
        ///<param name="leaveDeadChildNodes" type="Boolean">If set to true, the un-render will not lear down the DOM. This is a performance optimization</param>
		
        this.unTemplate(leaveDeadChildNodes);
        
		if (this.templateObserved) {
			this.templateObserved.dispose();
			delete this.templateObserved;
		}
		
		if (this.templateChangeKey) {
			this.disposeOf(this.templateChangeKey);
			delete this.templateChangeKey;
		}
		
        if (this.viewModel instanceof wipeout.viewModels.view)
            delete this.viewModel.$domRoot;
		
		delete this.renderContext;
		delete this.viewModel;
    };
	
	renderedContent.prototype.unTemplate = function(leaveDeadChildNodes) {
        ///<summary>Remove a view model's template, leaving it blank</summary>
        ///<param name="leaveDeadChildNodes" type="Boolean">If set to true, do not remove html nodes after disposal. This is a performance optimization</param>
        
        if (this.viewModel instanceof wipeout.viewModels.view)
            this.viewModel.onUnrendered();
        
		delete this.currentTemplate;
		
        // dispose of bindings
        if (this.disposeOfBindings) {
            this.disposeOfBindings();
            delete this.disposeOfBindings;
        }
		
		//issue-#39
        // remove all children
        if(!leaveDeadChildNodes) {
			var ns;
            while ((ns = this.openingTag.nextSibling) && ns !== this.closingTag) {
				//issue-#40
				if (ns.elementType === 1)
					ns.innerHTML = "";
				
                ns.parentNode.removeChild(this.openingTag.nextSibling);
			}
		}
    };
    
    renderedContent.prototype.template = function(templateId) {
        ///<summary>Render the view model with the given template</summary>
        ///<param name="templateId" type="String">A pointer to the template to apply</param>
        		
        // if a previous request is pending, cancel it
        if (this.asynchronous)
            this.asynchronous.cancel();
		
		if (this.currentTemplate === templateId) return;
        
        // remove old template
        if (this.__initialTemplate)
            this.unTemplate();
				
		if (!templateId) return;
        		
        this.asynchronous = wipeout.template.engine.instance.compileTemplate(templateId, (function (template) {
            delete this.asynchronous;
            
            // remove loading placeholder
            if (element) {
                element.parentNode.removeChild(element);
                element = null;
            }
            
			this.currentTemplate = templateId;
			
			// add html and execute to add dynamic content
            this.disposeOfBindings = template.quickBuild(this.appendHtml.bind(this), this.renderContext);
            this.__initialTemplate = true;
            
            this.viewModel.onRendered();
        }).bind(this));
        
        if (this.asynchronous) {            
            var element = wipeout.utils.html.createTemplatePlaceholder(this.viewModel);
            this.closingTag.parentNode.insertBefore(element, this.closingTag);
        }
    };
    
    renderedContent.prototype.dispose = function(leaveDeadChildNodes) {
        ///<summary>Dispose of this view model and viewModel element, removing it from the DOM</summary>
        ///<param name="leaveDeadChildNodes" type="Boolean">If set to true, do not remove html nodes after disposal. This is a performance optimization</param>
        
		this._super();
		
		if (!this.closingTag) return;
		
        this.unRender(leaveDeadChildNodes);
        
        if (!leaveDeadChildNodes && !this.detatched) {
			this.closingTag.parentNode.removeChild(this.closingTag);
			this.openingTag.parentNode.removeChild(this.openingTag);
		}
		
		delete this.detatched;
		
		delete this.closingTag.wipeoutClosing;
		delete this.openingTag.wipeoutOpening;
		
		delete this.closingTag;
		delete this.openingTag;
    };
	
    renderedContent.prototype.appendHtml = function (html) {
		///<summary>Append a html string to this renderContext</summary>
        ///<param name="html" type="String">The current html</param>
		
		if (this.openingTag && this.openingTag.nodeType === 1) {
			this.openingTag.insertAdjacentHTML('afterend', html);
		} else {
        	//issue-#38
			var scr = document.createElement("script");
			this.closingTag.parentNode.insertBefore(scr, this.closingTag);
			scr.insertAdjacentHTML('afterend', html);
			scr.parentNode.removeChild(scr);
		}
    };
    
    renderedContent.getParentElement = function(forHtmlElement) {
		///<summary>Get the parent element of a html element, keeping in mind that it might be a wipeout opeing comment</summary>
        ///<param name="forHtmlElement" type="Element">The element</param>
        ///<returns type="Node">The parent element</returns>
		
        var current = forHtmlElement.wipeoutClosing ? forHtmlElement.wipeoutClosing.openingTag : forHtmlElement;
        while (current = current.previousSibling) {
            if (current.wipeoutClosing)
                current = current.wipeoutClosing.openingTag;
            else if (current.wipeoutOpening)
                return current;
        }
        
        return forHtmlElement.parentNode;
    };
    
    return renderedContent;    
});