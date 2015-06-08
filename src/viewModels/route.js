//Incomplete, removed for now

/*(function () {
    
    var noTemplate;
    setup.push(function () {
        noTemplate = wipeout.viewModels.content.createAnonymousTemplate("", true);
    });
    
    var route = viewModel("wipeout.viewModels.route")
        .binding("refreshModel", "getter")
        .binding("modelAndRoute", "modelAndRoute")
        .initialize(function ($router, $url) {
            this.$router = $router;
            this.$url = $url;
            
            if (this.templateId)
                this.$cachedTemplateId = this.templateId;
            this.templateId = noTemplate;
            
            this.observe("route", this.reRegister);
            this.observe("exactMatch", this.reRegister);
            this.observe("templateId", function (oldVal, newVal) {
                if (newVal === noTemplate)
                    return;
                
                this.$cachedTemplateId = newVal;
                
                if (!this.$routeValues)
                    this.synchronusTemplateChange(noTemplate);
            });
            
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
            this.$router.addRoute(this.buildRoute(), this.routed.bind(this), {
                exactMatch: this.exactMatch,
                unRoutedCallback: this.unRouted.bind(this), 
                executeImmediately: true
            }));
    };
    
    route.buildRoute = function () {
        if (!this.route || this.route[0] !== "~")
            return this.route;
        
        var route = this.route;
        if (this.domRoot) {
            var i = 0;
            while (route[0] === "~" && this.domRoot.renderContext.$parents.length > i) {
                if (this.domRoot.renderContext.$parents[i] instanceof route)
                    route = this.domRoot.renderContext.$parents[i].buildRoute() + route.substr(1);
                
                i++;
            }
            
            if (route[0] !== "~")
                return route;
        }
        
        throw "Cannont subscribe to route \"" + route + "\". The \"~\" is used to locate the route of a parent control, however no parent could be found.";
    };
    
    route.routed = function ($allValues) {
        
        //TODM
        this.$routeValues = $allValues;
        
        if (this.refreshModel())
            this.$url(null, $allValues.routedUrl, true, (function (model) {
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
}());*/