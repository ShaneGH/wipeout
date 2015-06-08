Class("wipeout.htmlBindingTypes.modelAndRoute", function () {  
    
    //TODO: set default parser of modelAndRoute to string
    //      add a no parser parser
    //      use a getter instead of setter.value()
    return function modelAndRoute(viewModel, setter, renderContext) {
		///<summary>Binds the model two ways and set's the route of a wo.route</summary>
        ///<param name="viewModel" type="Any">The current view model</param>
        ///<param name="setter" type="wipeout.template.initialization.viewModelPropertyValue">The setter object</param>
        ///<param name="renderContext" type="wipeout.template.context">The current context</param>
        
        var val = setter.value(true).replace(/^~?\/?/, "");
        
        viewModel.route = "~/" + val.replace(".", "/");
        
        var disp;
        setter.useAnotherProperty("model", "$model." + val.replace("/", "."), function (mSetter) {
            disp = wipeout.htmlBindingTypes.tw(viewModel, mSetter, renderContext);
        });
        
        return disp;
    }
});