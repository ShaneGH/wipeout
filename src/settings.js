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

    settings.asynchronousTemplates = true;
    settings.displayWarnings = true;
    settings.useElementClassName = false;
    
    settings.bindingStrategies = {
        onlyBindObservables: 0,
        bindNonObservables: 1,
        createObservables: 2
    };
    
    settings.bindingStrategy = settings.bindingStrategies.onlyBindObservables;
	
    return settings;
});