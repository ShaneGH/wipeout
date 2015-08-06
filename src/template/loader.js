
Class("wipeout.template.loader", function () {
    
    var loader = wipeout.base.asyncLoaderBase.extend(function loader (templateName) {
        ///<summary>Private class for loading templates asynchronously</summary>
        ///<param name="templateName" type="string" optional="false">The name and url of this template</param>
		
        this._super();
        
        var success = this.success.bind(this);
        wipeout.utils.obj.ajax({
            type: "GET",
            url: wipeout.settings.convertTemplateToUrl(templateName),
            success: function(result) {
                
                new wipeout.template.templateModuleLoader(result.responseText, function (template) {
                    success(template);
                }).load();
            },
            error: function() {
                throw "Could not locate template \"" + templateName + "\"";
            }
        });
    });
	
	return loader;
});