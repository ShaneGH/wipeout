
function expose (name, value) {
	if (!name || value == null) throw "Invalid input";
	if (wo[name]) throw name + " is already taken!";
	wo[name] = value;
}

expose("viewModel", viewModel);

expose("array", busybody.array);
expose("observable", busybody.observable);

expose("bindings", wipeout.htmlBindingTypes);
expose("parsers", wipeout.template.initialization.parsers);
expose("filters", wipeout.template.filters);

expose("definitelyNotAViewModel", wipeout.utils.viewModels.definitelyNotAViewModel);

expose("addHtmlAttribute", SimpleHtmlAttr);

expose("findFilters", wipeout.utils.find);

expose("triggerEvent", wipeout.events.event.instance.trigger.bind(wipeout.events.event.instance));

enumerateObj(wipeout.viewModels, function(vm, name) {
	expose(name, vm);
});
}(window.orienteer, window.busybody));