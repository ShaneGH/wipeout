Class("wipeout.htmlBindingTypes.getter", function () {  
    
    return function getter(viewModel, setter, renderContext) {
		///<summary>Set the property of the viewModel as a function getter to get the value</summary>
        ///<param name="viewModel" type="Any">The current view model</param>
        ///<param name="setter" type="wipeout.template.initialization.viewModelPropertyValue">The setter object</param>
        ///<param name="renderContext" type="wipeout.template.context">The current context</param>
        
        viewModel[setter.name] = setter.getter();
    }
});