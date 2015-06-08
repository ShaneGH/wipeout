
Class("wipeout.template.rendering.viewModelElement", function () {
    
    var viewModelElement = wipeout.template.rendering.renderedContent.extend(function viewModelElement (element, xmlOverride, parentRenderContext, useElement) {
        ///<summary>The begin and end comment tags which surround and render a view model</summary>
        ///<param name="element" type="Element">The html element to replace with the view model</param>
        ///<param name="xmlOverride" type="wipeout.wml.wmlElement" optional="true">If set, will use this xml to initialize the view model. If not will parse and use the element property</param>
        ///<param name="parentRenderContext" type="wipeout.template.context" optional="true">The render context of the parent view model</param>
        
        var vm = wipeout.utils.viewModels.getViewModelConstructor(xmlOverride ? xmlOverride : element);
        
        if(!vm)
            throw "Invalid view model";
        
        this._super(element, wipeout.utils.obj.trim(vm.name), parentRenderContext, useElement);
        
        // create actual view model
        this.createdViewModel = new vm.constructor();
		
		var initializer = wipeout.template.engine.instance
            .getVmInitializer(xmlOverride || wipeout.wml.wmlParser(element));
		
		// nothing to dispose for shareParentScope
		var d1 = initializer.initialize(this.createdViewModel, null, "shareParentScope");
		
		///<summary type="wipeout.template.context">The context for the view model</summary>
        this.renderContext = parentRenderContext ?
			parentRenderContext.contextFor(this.createdViewModel) :
			new wipeout.template.context(this.createdViewModel);
        
        // initialize the view model
        // if there is no parent, use the new render context instead (application root only)
        var d2 = initializer.initialize(this.createdViewModel, parentRenderContext || this.renderContext);
        
		this.disposeOfViewModelBindings = function () {
			//issue-#41, this could be a bit better
			d1.apply(this, arguments);
			d2.apply(this, arguments);
		};
		
        // run onInitialized after value initialization is complete
        if (this.createdViewModel instanceof wipeout.viewModels.view && !this.renderContext.$parentContext) {
            this.createdViewModel.onApplicationInitialized();
        }
        
        this.render(this.createdViewModel);
		this.render = blockRendering;
    });
	
	function blockRendering () {
		throw "A view model element can only be rendered once";
	}
    
    viewModelElement.prototype.dispose = function(leaveDeadChildNodes) {
        ///<summary>Dispose of this view model and viewModel element, removing it from the DOM</summary>
        ///<param name="leaveDeadChildNodes" type="Boolean">If set to true, do not remove html nodes after disposal. This is a performance optimization</param>
        
        this._super(leaveDeadChildNodes);
		
		this.disposeOfViewModelBindings();
		
		if (this.createdViewModel instanceof busybody.disposable)
        	this.createdViewModel.dispose();
		else
			busybody.dispose(this.createdViewModel);
			
        delete this.createdViewModel;
    };
    
    return viewModelElement;    
});