
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

// passing in a function from "bind" will break docs
expose("triggerEvent", function triggerEvent (forObject, event, eventArgs) {
    ///<summary>Trigger an event.</summary>
    ///<param name="forObject" type="Object">The object triggering the event</param>
    ///<param name="event" type="String">The event name</param>
    ///<param name="eventArgs" type="Object">The arguments for the event callbacks</param>
    
    return wipeout.events.event.instance.trigger.apply(wipeout.events.event.instance, arguments)
});

enumerateObj(wipeout.viewModels, function(vm, name) {
	expose(name, vm);
});

enumerateArr(setup, function(f) {
    f();
});

setup = null;

}(window.orienteer, window.busybody));