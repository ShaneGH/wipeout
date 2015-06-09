Class("wipeout.profile.profile", function () {
    
    var profileState, buildInitializer, initialize, renderCurrent, compileTemplate;
    var profile = function profile(profile) {
        ///<summary>Profile this application.</summary>
        ///<param name="profile" type="Boolean" optional="true">Switch profiling on or off. Default is true</param>
        
        if(arguments.length === 0)
            profile = true;
        
        if((profile && profileState) || (!profile && !profileState)) return;
        
        buildInitializer = buildInitializer || wipeout.template.initialization.compiledInitializer.prototype.build;
        initialize = initialize || wipeout.template.initialization.compiledInitializer.prototype.initialize;
        renderCurrent = renderCurrent || wipeout.template.rendering.renderedContent.prototype.renderCurrent;
        compileTemplate = compileTemplate || wipeout.template.engine.prototype.setTemplate;
        
        if(profile) {
            var div = document.createElement("div");
            div.innerHTML = '<div style="position: fixed; top: 10px; right: 10px; background-color: white; padding: 10px; border: 2px solid gray; display: none; max-height: 500px; overflow-y: scroll; z-index: 10000"></div>';
            div = div.firstChild;
            div.parentElement.removeChild(div);
            profileState = {
                highlighter: new wipeout.profile.highlighter(),
                infoBox: div,
                eventHandler: function(e) {
                    if (!e.ctrlKey) return;
                    e.stopPropagation();
                    e.preventDefault();

                    var current = e.target;
                    while ((vm = wipeout.utils.viewModels.getViewModel(current)) && !(vm instanceof wo.view))
                        current = wipeout.template.rendering.renderedContent.getParentElement(current);
                        
					if(!vm) return;
                    
                    var vms = vm.$domRoot.renderContext.$parents.slice();
                    vms.splice(0, 0, vm);
                    if (current !== e.target)
                        vms.splice(0, 0, wipeout.utils.viewModels.getViewModel(e.target));

                    profileState.infoBox.innerHTML = '<span style="float: right; margin-left: 10px; cursor: pointer;">x</span><br/>Open a console window and click on am item below to debug it<br/>\
If view models do not have names, you can <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name" target="_blank">name them</a><br/>\
If view models have odd names ensure you are not using a minifier<br/>\
To see more detailed render time information, enable the profiler before any view models are rendered.';
                    profileState.infoBox.firstChild.addEventListener("click", function() { profileState.infoBox.style.display = "none"; });

                    var html = [];
                    profileState.profiles = [];
                    for (var i = 0, ii = vms.length; i < ii; i++) {
                        profileState.profiles.push(buildProfile(vms[i]));
                        profileState.infoBox.appendChild(profileState.profiles[i].element);
                    }
                    
                    profileState.infoBox.style.display = "block";
                },
                dispose: function() {
                    enumerateArr(profileState.profiles, function (p) { p.dispose(); });
                    profileState.profiles.length = 0;
                    
                    profileState.highlighter.dispose();
                    if(profileState.infoBox.parentNode)
                        profileState.infoBox.parentNode.removeChild(profileState.infoBox);
                    
                    document.body.removeEventListener("click", profileState.eventHandler);
                    
                    wipeout.template.initialization.compiledInitializer.prototype.build = buildInitializer;
                    wipeout.template.initialization.compiledInitializer.prototype.initialize = initialize;
                    wipeout.template.rendering.renderedContent.prototype.renderCurrent = renderCurrent;
                    wipeout.template.rendering.compiledTemplate.prototype.compile = compileTemplate;
                }
            };
            
            wipeout.template.initialization.compiledInitializer.prototype.build = function () {
                
                var before = new Date();
                var op = buildInitializer.apply(this, arguments);
                this.$buildTime = (new Date() - before) + "ms";
                
                return op;
            };
            
            wipeout.template.initialization.compiledInitializer.prototype.initialize = function (vm) {
                
                if (!vm.$profiler)
                    vm.$profiler = {};
                
                var before = new Date();
                var op = initialize.apply(this, arguments);
                vm.$profiler["Initilize time"] = (new Date() - before) + "ms";
                
                if (this.hasOwnProperty("$buildTime")) {
                    vm.$profiler["Initializer build time"] = this.$buildTime;
                    delete this.$buildTime;
                }
                
                return op;
            };
            
            wipeout.template.engine.prototype.setTemplate = function () {
                
                var before = new Date();
                var op = compileTemplate.apply(this, arguments);
                op.$compileTime = (new Date() - before) + "ms";
                
                return op;
            };
            
            wipeout.template.rendering.renderedContent.prototype.renderCurrent = function (template) {
                
                if (!this.viewModel)
                    return renderCurrent.apply(this, arguments);;
                
                if (!this.viewModel.$profiler)
                    this.viewModel.$profiler = {};
                
                var before = new Date();
                var op = renderCurrent.apply(this, arguments);
                this.viewModel.$profiler["Render time"] = (new Date() - before) + "ms";
                
                if (template.hasOwnProperty("$compileTime")) {
                    this.viewModel.$profiler["Template compile time"] = template.$compileTime;
                    delete template.$compileTime;
                }
                
                return op;
            };
            
            document.body.appendChild(profileState.infoBox);
            document.body.addEventListener("click", profileState.eventHandler, false);
        } else {
            profileState.dispose();            
            profileState = null;
        }
        
        return;
    };
    
    var viewVm = new Function("viewModel", "model", "console.log(viewModel);\nconsole.log(model);\n\n//Use your browser's debugger to inspect the model and view model\ndebugger;");
    
	var functionName = /^function\s*([^\s(]+)/;
    var buildProfile = function(vm) {
                
        var div = document.createElement('div');
        
		// IE doesn't support name
		var tmp;		
		var fn = vm.constructor.name ? 
			vm.constructor.name :
			((tmp = vm.constructor.toString().match(functionName)) ? tmp[1] : 'unknown vm type');
			
        var innerHTML = ["<h4 style='cursor: pointer; margin-bottom: 5px;'>" + fn + (vm.id ? (" #" + vm.id) : "") + "</h4>"];
        if(vm.$profiler)
            for(var i in vm.$profiler)
                innerHTML.push("<label>" + i + ":</label> " + vm.$profiler[i]);
        
        div.innerHTML += innerHTML.join("<br />");
        
        function listener() {
            viewVm(vm, vm.model);
        }
        
        div.firstChild.addEventListener("click", listener, false);
        
        return {
            element: div,
            dispose: function() {
                div.firstChild.removeEventListener("click", listener);
            }
        };
    };    
    
    return profile;
});