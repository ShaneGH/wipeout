Binding("render", true, function () {
    
    var render = wipeout.bindings.bindingBase.extend(function(element, value, allBindingsAccessor, bindingContext) {  
        this._super(element);

        this.bindingMeta = ko.bindingHandlers.template.init(this.element, wipeout.bindings.render.createValueAccessor(value), allBindingsAccessor, null, bindingContext);            
        this.allBindingsAccessor = allBindingsAccessor;
        this.bindingContext = bindingContext;

        if(ko.isObservable(value)) {
            var val = value.peek();
            this.subscribed = value.subscribe(function(newVal) {
                if(newVal === val)
                    return;

                try {
                    this.reRender(newVal);
                } finally {
                    val = newVal;
                }
            }, this);
        }
    }, "render");
    
    render.prototype.moved = function(oldParentElement, newParentElement) {
        this._super(oldParentElement, newParentElement);
        if(DEBUG && !wipeout.settings.suppressWarnings && this.value) {
            for(var i = 0, ii = this.value.__woBag.nodes.length; i < ii; i++) {
                if(wipeout.utils.ko.parentElement(this.value.__woBag.nodes[i]) !== this.value.__woBag.rootHtmlElement) {
                    console.warn("Only part of this view model was moved. Un moved nodes will be deleted or orphaned with their bindings cleared when this view model is re-rendered or disposed.");
                    break;
                }
            };
        }
    };
    
    render.prototype.dispose = function() {

        this.unRender();

        this._super();     

        if(this.subscribed) {
            this.subscribed.dispose();
            delete this.subscribed;
        }            
    };
    
    render.prototype.reRender = function(value) {
        this.unRender();
        this.render(value);
    };
    
    render.prototype.unTemplate = function() {
        ///<summary>Removes and disposes (if necessary) of all of the children of the visual</summary>

        if(!this.value) return;

        // delete all template items
        enumerate(this.value.templateItems, function(item, i) {            
            delete this.value.templateItems[i];
        }, this);

        // clean up all child nodes
        var child = ko.virtualElements.firstChild(this.element);
        while (child) {
            wipeout.utils.html.cleanNode(child);
            var oc = child;
            child = ko.virtualElements.nextSibling(child);
            (oc.parentElement || oc.parentNode).removeChild(oc);
        }

        // clear references to html nodes in view
        this.value.__woBag.nodes.length = 0;
    };
    
    render.prototype.unRender = function() {

        if(!this.value) return;

        this.unTemplate();
        this.value.onUnrender();
        if(this.value.__woBag.rootHtmlElement) {
            // disassociate the visual from its root element and empty the root element
            wipeout.utils.domData.set(this.value.__woBag.rootHtmlElement, wipeout.bindings.wipeout.utils.wipeoutKey, undefined); 
            delete this.value.__woBag.rootHtmlElement;
        }

        if(this.templateChangedSubscription)
            this.value.disposeOf(this.templateChangedSubscription);

        this.value.disposeOf(this.onDisposeEventSubscription);

        delete this.onDisposeEventSubscription;
        delete this.value;
        delete this.templateChangedSubscription;
    };
    
    render.prototype.render = function (newVal) {
        if(this.value || this.templateChangedSubscription)
            throw "This binding is already rendering a visual. Call unRender before rendering again.";

        if(!(this.value = newVal))
            return;

        if (!(this.value instanceof wipeout.base.visual))
            throw "This binding can only be used to render a wo.visual within the context of a wo.visual";

        if (this.value.__woBag.rootHtmlElement)
            throw "This visual has already been rendered. Call its unRender() function before rendering again.";

        wipeout.utils.domData.set(this.element, wipeout.bindings.wipeout.utils.wipeoutKey, this.value);
        this.value.__woBag.rootHtmlElement = this.element;

        var subscription1 = this.value.__woBag.disposed.register(this.unRender, this);
        this.onDisposeEventSubscription = this.value.registerDisposable(subscription1);

        var subscription2 = this.value.templateId.subscribe(this.onTemplateChanged, this);
        this.templateChangedSubscription = this.value.registerDisposable(subscription2);
        this.onTemplateChanged(this.value.templateId.peek());
    };
    
    render.prototype.onTemplateChanged = function(newVal) {
        var _this = this;
        function reRender() {
            if(_this.value && _this.value.templateId.peek() !== newVal) return;
            _this.doRendering();
        }

        this.unTemplate();

        if(newVal && wipeout.settings.asynchronousTemplates) {
            ko.virtualElements.prepend(this.element, wipeout.utils.html.createTemplatePlaceholder(this.value));
            wipeout.template.asyncLoader.instance.load(newVal, reRender);
        } else {
            reRender();
        }
    };
    
    render.prototype.doRendering = function() {

        ko.bindingHandlers.template.update(this.element, wipeout.bindings.render.createValueAccessor(this.value), this.allBindingsAccessor, null, this.bindingContext);

        var bindings = this.allBindingsAccessor();
        if(bindings["wipeout-type"])
            wipeout.bindings["wipeout-type"].utils.comment(this.element, bindings["wipeout-type"]);
    };
    
    render.init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the render binding</summary>       

        var binding = new wipeout.bindings.render(element, valueAccessor(), allBindingsAccessor, bindingContext);                
        binding.render(wipeout.utils.ko.peek(valueAccessor()));
        return binding.bindingMeta;
    };
    
    render.createValueAccessor = function(value) {
        ///<summary>Create a value accessor for the knockout template binding.</summary>

        // ensure template id does not trigger another update
        // this will be handled within the binding
        return function () {
            value = wipeout.utils.ko.peek(value);

            // use the knockout vanilla template engine to render nothing
            if(!(value instanceof wipeout.base.visual))
                 return {
                     name: wipeout.base.visual.getBlankTemplateId()
                 };

            var output = {
                templateEngine: wipeout.template.engine.instance,
                name: value.templateId.peek(),
                afterRender: function(nodes, context) {
                    var old = [];
                    enumerate(value.__woBag.nodes, function(node) {
                        old.push(node);
                    });

                    value.__woBag.nodes.length = 0;
                    enumerate(nodes || [], function(node) {
                        value.__woBag.nodes.push(node);
                    });                            

                    value.onRendered(old, nodes);
                }
            };

            // do not move this to upper definition, knokout regards undefined as a value in this case and will use it as the current binding context
            if(!value.shareParentScope)
                output.data = value;

            return output;
        };
    };
    
    return render;
});