
window.wo = function (model, htmlElement) {
    ///<summary>Create a new observable array</summary>
    ///<param name="model" type="Any" optional="true">The root model</param>
    ///<param name="htmlElement" type="HTMLElement or String" optional="true">The root html element. Can be an element or an id</param>
	
    if (arguments.length < 2)
        htmlElement = document.body;
    else if (typeof htmlElement === "string")
        htmlElement = document.getElementById(htmlElement);
	
    if (!htmlElement)
		return;
	
	function woAnElement (element, elementParent) {
		if (wipeout.utils.viewModels.getViewModel(element, true, elementParent)) {
			warn("Attempting to create a wo application twice.", element);
			return;
		}
		
		if (wipeout.utils.viewModels.getViewModelConstructor(element)) {
			var vme = new wipeout.template.rendering.viewModelElement(element);
			if (model != null)
				vme.createdViewModel.model = model;

			return vme;
		} else {
			var disp = new busybody.disposable();
			enumerateArr(Array.prototype.slice.call(element.childNodes), function (n) {
				if (n.nodeType !== 1 || !element.contains(n))
					return;

				var rendered;
				if (rendered = woAnElement(n, element))
					disp.registerDisposable(rendered);
			});
			
			if (disp.$disposables)
				for (var i in disp.$disposables)
					return disp;
		}
	}
	
	return woAnElement(htmlElement);
};

window.addEventListener("load", function () {
    window.wo();
});