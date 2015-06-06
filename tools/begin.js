;
(function (orienteer, busybody) {
    
    window.wipeout = {};
    
    var setup = [];
	
	function warn (warning, data) {
		if (wipeout.settings.displayWarnings) {
			warning += "\n\nTo disable warnings globally you can set \"wipeout.settings.displayWarnings\" to false.";
			
			console.warn(data ? {
				message: warning,
				data: data
			} : warning);
		}
	}
    