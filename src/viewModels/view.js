
Class("wipeout.viewModels.view", function () {
    
    var view = wipeout.base.bindable.extend(function view (templateId, model /*optional*/) {        
        ///<summary>Extends on the view class to provide expected MVVM functionality, such as a model and bindings</summary>  
        ///<param name="templateId" type="String" optional="true">An initial template id</param>
        ///<param name="model" type="Any" optional="true">An initial model</param>

        this._super();

        ///<Summary type="Boolean">Specifies whether this object should be used as a binding context. If true, the binding context of this object will be it's parent. Default is false</Summary>
        this.shareParentScope = false;

        ///<Summary type="Object">Dictionary of items created within the current template. The items can be views or html elements</Summary>
        this.templateItems = {};

        ///<Summary type="String">The id of the template of the view, giving it an appearance</Summary>
        this.templateId = templateId;
        
        this.observe("model", this._onModelChanged, {context: this, activateImmediately: true});
		
        ///<Summary type="ko.observable" generic0="Any">The model of view. If not set, it will default to the model of its parent view</Summary>
        this.model = model == null ? null : model;
    });
    
    view.$synchronusTemplateChangeEvent = "$synchronusTemplateChange";
	
    view.addGlobalBindingType("bindingStrategy", "bindingStrategy");
    
    view.addGlobalBindingType("shareParentScope", "shareParentScope");
	
    view.addGlobalParser("id", "string");
    view.addGlobalBindingType("id", "viewModelId");
    
    view.prototype.getParent = function() {
        ///<summary>Get the parent view of this view</summary> 
        ///<returns type="Any">The parent view model</returns>
        
		var renderContext = this.getRenderContext();
        return renderContext ? 
            (renderContext.$this === this ? renderContext.$parent : renderContext.$this) : 
            null;
    };
    
    view.prototype.getParents = function() {
        ///<summary>Get all parent views of this view</summary> 
        ///<returns type="Array" generic0="wo.view">The parent view model</returns>
        
		var renderContext = this.getRenderContext();
		if (!renderContext)
			return [];
						
		var op = renderContext.$parents.slice();	
		if (renderContext.$this !== this)	// if share parent scope
			op.splice(0, 0, renderContext.$this);
		
		return op;
    };
    
    view.prototype.getRenderContext = function() {
        ///<summary>Get the render context of this view</summary> 
        ///<returns type="wipeout.template.context">The render context</returns>
        
		return (this.$domRoot && this.$domRoot.renderContext) || null;
    };
        
    view.prototype._onModelChanged = function (oldValue, newValue) {
        ///<summary>Called when the model has changed</summary>
        ///<param name="oldValue" type="Any" optional="false">The old model</param>
        ///<param name="newValue" type="Any" optional="false">The new mode</param>
        
        if (oldValue !== newValue)
			this.onModelChanged(newValue);
	};
	
    view.prototype.onModelChanged = function (newValue) {
        ///<summary>Called when the model has changed</summary>
        ///<param name="newValue" type="Any" optional="false">The new mode</param>
		
		this.disposeOf(this.$modelRoutedEventKey);
		this.$modelRoutedEventKey = null;

		if (newValue instanceof wipeout.events.routedEventModel) {
            var d1 = wipeout.events.event.instance.register(newValue, 
                                                     wipeout.events.routedEventModel.triggerRoutedEvent, 
                                                     this._onModelRoutedEvent, 
                                                     this);
			this.$modelRoutedEventKey = this.registerDisposable(d1);
		}
    };
    
    view.prototype._onModelRoutedEvent = function (eventArgs) {
        ///<summary>When the model of this class fires a routed event, catch it and continue the traversal upwards</summary>
        ///<param name="eventArgs" type="ObjectArgs" optional="false">The routed event args</param>
        
        this.triggerRoutedEvent(eventArgs.routedEvent, eventArgs.eventArgs);
    };
	
	view.prototype.dispose = function () {
        ///<summary>Dispose of this view</summary>
		
		this._super();
		
		// dispose of routed event subscriptions
        if (this.$routedEventSubscriptions)
            this.$routedEventSubscriptions.dispose();
	};
	
	view.prototype.synchronusTemplateChange = function (templateId) {
        ///<summary>Tell the overlying renderedContent the the template has changed</summary>    
        ///<param name="templateId" type="String" optional="true">Set the template id also</param>
		
		if (arguments.length)
			this.templateId = templateId;
		
        wipeout.events.event.instance.trigger(this, view.$synchronusTemplateChangeEvent);
	};
	
    view.visualGraph = function (rootElement, displayFunction) {
        ///<summary>Compiles a tree of all view elements in a block of html, starting at the rootElement</summary>    
        ///<param name="rootElement" type="HTMLNode" optional="false">The root node of the view tree</param>
        ///<param name="displayFunction" type="Function" optional="true">A function to convert view models found into a custom type</param>
        ///<returns type="Array" generic0="Object">The view graph</returns>

        throw "Not implemented exception";	//issue-#44
        
        /*if (!rootElement)
            return [];

        displayFunction = displayFunction || function() { return typeof arguments[0]; };

        var output = [];
        wipeout.utils.obj.enumerateArr(wipeout.utils.html.getAllChildren(rootElement), function (child) {
            wipeout.utils.obj.enumerateArr(visual.visualGraph(child), output.push, output);
        });

        var vm = wipeout.utils.domData.get(rootElement, wipeout.bindings.wipeout.utils.wipeoutKey);        
        if (vm) {
            return [{ viewModel: vm, display: displayFunction(vm), children: output}];
        }

        return output;*/
    };
    
    // virtual
    view.prototype.onRendered = function () {
        ///<summary>Triggered each time after a template is rendered</summary>
		
		enumerateArr(this.$onRendered, function (f) {
			f.call(this);
		}, this);
    };
    
    // virtual
    view.prototype.onUnrendered = function () {
        ///<summary>Triggered just before a view is un rendered</summary>
		
		enumerateArr(this.$onUnrendered, function (f) {
			f.call(this);
		}, this);
    };
    
    // virtual
    view.prototype.onApplicationInitialized = function () {
        ///<summary>Triggered after the entire application has been initialized. Will only be triggered on the viewModel created directly by the wipeout binding</summary>
		
		enumerateArr(this.$onApplicationInitialized, function (f) {
			f.call(this);
		}, this);
    };
	
    // virtual
    view.prototype.onInitialized = function() {
        ///<summary>Called by the template engine after a view is created and all of its properties are set</summary>
		
        //TODO: test whether this works when vm is set as property (<wo.view><prop><my-vm></my-vm></prop></wo.view>)
        
        //TODM
		enumerateArr(this.$onInitialized, function (f) {
            if (!f.$args)
                f.$args = wipeout.utils.jsParse.getArgumentNames(f);
            
            var args = [];
            enumerateArr(f.$args, function (a) {
                a = wipeout.di.ioc.instance.get(a);
                args.push(a);
                
                if (a instanceof busybody.dispose && !a.singleton)
                    this.registerDisposable(a);
            }, this);
            
			f.apply(this, args);
		}, this);
    };

    return view;
});
