Class("wipeout.settings", function() {
    function settings (settings) {
        ///<summary>Change all settings</summary>
        ///<param name="settings" type="Object">A dictionary of new settings</param>
		
        enumerateObj(wipeout.settings, function(a,i) {
            if (i === "bindingStrategies") return;
            delete wipeout.settings[i];
        });
        
        enumerateObj(settings, function(setting, i) {
            if (i === "bindingStrategies") return;
            wipeout.settings[i] = setting;
        });
    }
    
    //TODM
    settings.applicationRootUrl = "";
    
    //TODM
    settings.scanDom = true;

    settings.defaultBindingType = "ow"; //TODM
    settings.asynchronousTemplates = true;
    settings.displayWarnings = true;
    settings.useElementClassName = false;
    settings.asyncModuleRoot = "";
    
    //TODM
    settings.convertTemplateToUrl = function (template) {
        return template;
    };
    
    //TODM
    settings.convertModuleToUrl = function (forModule) {
        return "/" + forModule.replace(/\./g, "/") + ".js";
    };
    
    //TODM
    settings.convertStyleToUrl = function (forStyle) {
        return "/" + forStyle.replace(/\./g, "/") + ".css";
    };
    
    settings.bindingStrategies = {
        onlyBindObservables: 0,
        bindNonObservables: 1,
        createObservables: 2
    };
    
    settings.bindingStrategy = settings.bindingStrategies.createObservables;
	
    return settings;
});