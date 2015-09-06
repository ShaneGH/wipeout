(function () {
    
    var noTemplate;
    setup.push(function () {
        noTemplate = wipeout.viewModels.content.createAnonymousTemplate("", true);
    });
    
    var route = viewModel("wipeout.viewModels.route", wipeout.viewModels.content)
        .binding("refreshModel", "getter")
        .binding("modelAndRoute", "modelAndRoute")
        .initialize(function ($router, $url) {
            
            this.$router = $router;
            this.$url = $url;
            
            if (this.templateId)
                this.$cachedTemplateId = this.templateId;
            this.templateId = noTemplate;
            
            var ctxt = {context: this};
            this.observe("route", this.reRegister, ctxt);
            this.observe("exactMatch", this.reRegister, ctxt);
            this.observe("templateId", function (oldVal, newVal) {
                if (newVal === noTemplate)
                    return;
                
                this.$cachedTemplateId = newVal;
                
                if (!this.$routeValues)
                    this.synchronusTemplateChange(noTemplate);
            }, ctxt);
        })
        .rendered(function () {
            this.reRegister();
        })
        .build();
    
    //TODM: can be overridden by refreshModel property
    route.refreshModel = function () {
        return this.model == null;
    };
    
    route.reRegister = function () {
        if (this.$routeDisposeKey) {
            this.disposeOf(this.$routeDisposeKey);
            this.$routeDisposeKey = null;
        }
        
        if (!this.route)
            return;
        
        this.$routeDisposeKey = this.registerDisposable(
            this.$router.addRoute(this.buildRoute(), this.routed, {
                exactMatch: this.exactMatch,
                unRoutedCallback: this.unRouted.bind(this), 
                executeImmediately: true,
                context: this
            }));
    };
    
    route.buildRoute = function () {
        
        if (!this.route || this.route[0] !== "~")
            return this.route;
        
        var _route = this.route;
        if (this.$domRoot) {
            var i = 0;
            while (_route[0] === "~" && this.$domRoot.renderContext.$parents.length > i) {
                if (this.$domRoot.renderContext.$parents[i] instanceof route.constructor)
                    _route = this.$domRoot.renderContext.$parents[i].buildRoute() + _route.substr(1);
                
                i++;
            }
            
            // remove /*/, */, /* and *
            _route = _route
                .replace(/\/\*\//g, "/")
                .replace(/\*\//g, "/")
                .replace(/\/\*/g, "/")
                .replace(/\*/g, "");  
            
            if (_route[0] !== "~")
                return _route;
        }
        
        throw "Cannont subscribe to route \"" + _route + "\". The \"~\" is used to locate the route of a parent control, however no parent could be found.";
    };
    
    route.routed = function ($allValues) {
        
        //TODM
        this.$routeValues = $allValues;
        debugger;
        if (this.refreshModel())
            this.$url(null, wipeout.settings.convertRouteUrlToDataUrl($allValues.routedUrl), true, (function (model) {
                this.model = model;
                this.synchronusTemplateChange(this.$cachedTemplateId);
            }).bind(this));
        else
            this.synchronusTemplateChange(this.$cachedTemplateId);
    };
    
    route.unRouted = function () {
        this.$routeValues = null;
        
        this.synchronusTemplateChange(noTemplate);
    };
    
    return route;
}());