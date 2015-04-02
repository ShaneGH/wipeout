
HtmlAttr("visible", function () {
	return function visible (element, attribute, renderContext) { //TODE
		
		element.style.display = attribute.execute(renderContext) ? "" : "none";
		
		attribute.watch(renderContext, function (oldVal, newVal) {
			if (newVal && !oldVal)
                element.style.display = "";
			else if (!newVal && oldVal)
                element.style.display = "none";
        }, false);
    }
});