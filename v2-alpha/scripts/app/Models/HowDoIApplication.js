compiler.registerClass("wipeoutDocs.models.howDoIApplication", "orienteer", function() {
    
    var articleLink = busybody.observable.extend(function articleLink(title, article) {
        
        this._super();
        
        this.text = title;
        this.article = article;
        this.href = buildHref({article: article});
        this.visible = true;
    });
    
    var buildHref = function(parameters) {
        if(parameters.article && !wo.content.templateExists("Articles." + parameters.article))
            throw "No template for " + parameters.article;
        
        var output = []
        for(var i in parameters)
            output.push(i + "=" + parameters[i]);
        
        return location.protocol + "//" + location.host + location.pathname + "?" + output.join("&");
    };
    
    function HowDoIApplication() {
        this._super();
        
        this.leftHandNav = [{
            header: new articleLink("Get started", "get-started"),
            items: [
                new articleLink("With orienteer", "get-started-with-orienteer"),
                new articleLink("With busybody", "get-started-with-busybody"),
                new articleLink("With Hello World", "get-started-with-hello-world"),
                new articleLink("With MVVM basics", "get-started-with-mvvm-basics"),   
                new articleLink("With MVVM interactions", "get-started-with-mvvm-interactions"),
                new articleLink("With Pluggable MVVM components", "get-started-with-pluggable-mvvm-components"),
                new articleLink("With viewModels", "get-started-with-view-models"),           
                new articleLink("Using viewModels and templates", "get-started-using-view-models")
            ]
        }, {
            header: new articleLink("Using templates", "using-templates"),
            items: [
                new articleLink("Camel casing", "camel-casing"),
                new articleLink("Where do templates go?", "where-to-put-a-template"),
                new articleLink("Rendering Simple Content", "rendering-simple-content"),
                new articleLink("View Models and Html Elements", "view-models-and-html-elements"),
                new articleLink("Accessing html elements and view models", "template-items"),
                new articleLink("Binding Setters", "binding-setters"),
                new articleLink("Setting the template within a template", "content"),
                new articleLink("Complex template properties", "complex-template-properties"),
                new articleLink("Illegal html tags", "illegal-html-tags"),
                new articleLink("Html element/ViewModel name clashes", "definitely-not-a-view-model"),
                new articleLink("Share parent scope", "share-parent-scope")
            ]
        }, {
            header: new articleLink("Define viewModels", "define-view-models"),
            items: [
                new articleLink("Add a default template", "add-a-default-template"),
                new articleLink("Add a default value", "add-a-default-value"),
                new articleLink("Add a function", "add-a-function"),
                new articleLink("Add a static value", "add-a-static-value"),
                new articleLink("Add a static function", "add-a-static-function"),
                new articleLink("Alter the viewModel lifecycle", "view-model-lifecycle"),
                new articleLink("Add Computed Values", "add-compued-values"),
                new articleLink("Add a property binding", "add-a-property-binding"),
                new articleLink("Add a property parser", "add-a-parser"),
                new articleLink("Inherit from another viewModel", "inherit-from-another-view-model"),
                new articleLink("Create an anonymous template property", "create-an-anonymous-template-property")
            ]
        }, {        
            header: new articleLink("Use the model layer", "models"),
            items: [
                new articleLink("Observing array changes", "observable-arrays")
            ]
        }, {        
            header: new articleLink("Bind or set properties", "bind-or-set-propertes"),
            items: [
                new articleLink("Bind to a static value", "bind-to-static-value"),
                new articleLink("Bind to a property on the model", "bind-to-model"),
                new articleLink("Bind to a property on the parent's viewModel", "bind-to-parents-view-model"),
                new articleLink("Set the model from the parent's model", "bind-to-parents-model"),
                new articleLink("Cascading models", "cascading-models"),
                new articleLink("Bind to a global value", "bind-to-global"),
                new articleLink("Set properties using HTML elements", "bind-with-elements"),
                new articleLink("Find an ancestor to bind to", "bind-to-ancestor"),
                new articleLink("Custom $context.find filters", "custom-find-filters")
        ]}, {        
            header: new articleLink("Binding to non observables", "binding-to-non-observables"),
            items: [
                new articleLink("Setting the global binding strategy", "global-binding-strategy"),
                new articleLink("Setting the binding strategy for a view model type", "typed-binding-strategy"),
                new articleLink("Setting the binding strategy for a view model", "instance-binding-strategy")
        ]}, {        
            header: new articleLink("Work with lists", "working-with-lists"),
            items: [
                new articleLink("wo.list control", "wo-list-control"),
                new articleLink("Setting the list template", "list-template"),
                new articleLink("List item lifecycle", "list-item-lifecycle"),
                new articleLink("Creating custom list items", "list-custom-items"),
                new articleLink("Self removing items", "list-self-removing-items")
        ]}, {
            header: new articleLink("The if component", "if-control"),
            items: []
        }, {        
            header: new articleLink("Html Attributes", "html-attributes"),
            items: [
                new articleLink("Value attributes", "value-attributes"),
                new articleLink("Event attributes", "event-attributes"),
                new articleLink("Attribute", "wo-attr"),
                new articleLink("Blur", "wo-blur"),
                new articleLink("Change", "wo-change"),
                new articleLink("Checked Value", "wo-checked-value"),
                new articleLink("Class", "wo-class"),
                new articleLink("Click", "wo-click"),
                new articleLink("Content", "wo-content"),
                new articleLink("Event", "wo-event"),
                new articleLink("Focus", "wo-focus"),
                new articleLink("For each", "wo-foreach"),
                new articleLink("If", "wo-if"),
                new articleLink("Keydown", "wo-keydown"),
                new articleLink("Keypress", "wo-keypress"),
                new articleLink("Keyup", "wo-keyup"),
                new articleLink("Mousedown", "wo-mousedown"),
                new articleLink("Mouseout", "wo-mouseout"),
                new articleLink("Mouseover", "wo-mouseover"),
                new articleLink("Mouseup", "wo-mouseup"),
                new articleLink("On Event", "wo-on-event"),
                new articleLink("Render", "wo-render"),
                new articleLink("Style", "wo-style"),
                new articleLink("Submit", "wo-submit"),
                new articleLink("Value", "wo-value"),
                new articleLink("Visible", "wo-visible")
        ]}, {        
            header: new articleLink("Custom html attributes", "custom-html-attributes"),
            items: [
                new articleLink("Subscribe to an element event", "html-attr-on-element-event"),
                new articleLink("Get the setter string", "html-attr-get-the-setter-string"),
                new articleLink("Get the value of the setter", "html-attr-get-the-value-of-the-setter"),
                new articleLink("Observe the value of the setter", "html-attr-observe-the-value-of-the-setter"),
                new articleLink("Set the value of the setter", "html-attr-set-the-value-of-the-setter"),
                new articleLink("Access another wipeout attribute", "html-attr-get-other-attr"),
                new articleLink("Dispose of the attribute", "html-attr-dispose-of-the-attribute"),
		]}, {        
            header: new articleLink("Property flags", "property-flags"),
            items: [
		]}, {        
            header: new articleLink("Binding Types", "binding-types"),
            items: [
                new articleLink("One way bindings", "bind-one-way"),
                new articleLink("Two way bindings", "bind-two-way"),
                new articleLink("One way to source bindings", "bind-one-way-to-source"),
                new articleLink("Setter binding", "bind-no-way"),
                new articleLink("Change default binding", "change-default-binding")
		]}, {        
            header: new articleLink("Custom binding", "custom-binding"),
            items: [
                new articleLink("Get the name of the property", "get-the-name-of-the-property"),
                new articleLink("Get the setter string", "get-the-setter-string"),
                new articleLink("Get the value of the property", "get-the-value-of-the-property"),
                new articleLink("Get the value of the setter", "get-the-value-of-the-setter"),
                new articleLink("Observe the value of the property", "observe-the-value-of-the-property"),
                new articleLink("Observe the value of the setter", "observe-the-value-of-the-setter"),
                new articleLink("Set the value of the property", "set-the-value-of-the-property"),
                new articleLink("Set the value of the setter", "set-the-value-of-the-setter"),
                new articleLink("Dispose of the binding", "dispose-of-the-binding"),
		]}, {        
            header: new articleLink("Parsers", "parsers"),
            items: [
                new articleLink("Using a parser", "using-a-parser"),
                new articleLink("Boolean Parser", "boolean-parser"),
                new articleLink("Date Parser", "date-parser"),
                new articleLink("Float Parser", "float-parser"),
                new articleLink("Int Parser", "int-parser"),
                new articleLink("Json Parser", "json-parser"),
                new articleLink("Regexp Parser", "regexp-parser"),
                new articleLink("String Parser", "string-parser"),
                new articleLink("Create a custom parser", "custom-parser")
		]}, {
            header: new articleLink("Binding Filters", "filters"),
            items: [
                new articleLink("A List Filter", "list-filter"),
                new articleLink("A Two Way Date Formatter", "date-parser-filter")
		]}, {
            header: new articleLink("Events", "events"),
            items: [
                new articleLink("Routed Events", "routed-events")
		]}, {
            header: new articleLink("Manually create a wipeout application", "manually-create-an-application"),
            items: []
        }, {
            header: new articleLink("Profiling", "profiling"),
            items: []
        }/*        
            header: new articleLink("Profiling", "profiling"),
            items: []
        }*/];
        
        this.flatList = [];
        this.index();
    };
    
    HowDoIApplication.prototype.search = function(searchTerm) {
        if(!searchTerm || searchTerm.length < 2)
            searchTerm = "";
        
        var _this = this;        
        var token = this.token = {};        
        setTimeout(function() {
            if(token === _this.token)
                _this._search(searchTerm);
        }, 100);
    };
    
    HowDoIApplication.prototype._search = function(searchTerm) {
        if(!searchTerm) {
            wipeout.utils.obj.enumerateArr(this.flatList, function(item) {
                if(!item.visible)item.visible = true;
            }, this);
            
            return;
        }
        
        searchTerm = searchTerm.toLowerCase().split(/\s+/);        
        
        wipeout.utils.obj.enumerateArr(this.flatList, function(item) {
            
            var visible = true;
            var title = item.text.toLowerCase();
            for(var i = 0, ii = searchTerm.length; i < ii; i++)
                visible &= (title.indexOf(searchTerm[i]) !== -1 || item.body.indexOf(searchTerm[i]) !== -1);
            
            item.visible = visible;
        }, this);
    };
    
    HowDoIApplication.prototype.index = function() {
        this.flatList.length = 0;
        wipeout.utils.obj.enumerateArr(this.leftHandNav, function(group) {
            if(group.header)
                this.flatList.push(group.header);
            
            wipeout.utils.obj.enumerateArr(group.items, function(item) {
                this.flatList.push(item);
            }, this);
        }, this);
        
        wipeout.utils.obj.enumerateArr(this.flatList, function(item) {
            item.body = document.getElementById("Articles." + item.href.substr(item.href.indexOf("article=") + 8)).text.toLowerCase();
        }, this);        
    };
    
    return HowDoIApplication;
});