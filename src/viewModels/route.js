(function () {
    
    var noTemplate;
    setup.push(function () {
        noTemplate = wipeout.viewModels.content.createAnonymousTemplate("", true);
    });
    
    var route = viewModel("wipeout.viewModels.route")
        //TODO: not 100% sure if this is a good idea yet
        .value("shareParentScope", true)
        .binding("refreshModel", "getter")
        .binding("modelAndRoute", "modelAndRoute")
        .initialize(function () {   //TODO: services
            var router = new wipeout.services.router();
            this.registerDisposable(router);
            
            if (this.templateId)
                this.$cachedTemplateId = this.templateId;
            this.templateId = noTemplate;
            
            this.observe("route", this.reRegister);
            this.observe("exactMatch", this.reRegister);
            this.observe("templateId", function (oldVal, newVal) {
                if (newVal === noTemplate)
                    return;
                
                this.$cachedTemplateId = newVal;
                
                if (!this.$routeIsActive)
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
            this.router.addRoute(this.route, this.routed.bind(this), {
                exactMatch: this.exactMatch,
                unRoutedCallback: this.unRouted.bind(this), 
                executeImmediately: true
            }));
    };
    
    route.routed = function ($allValues) {
        this.$routeIsActive = true;
        
        //TODM
        this.routeValues = $allValues;
        
        if (this.refreshModel())
            wipeout.services.url(null, $allValues.routedUrl, true, (function (model) {
                this.model = model;
                this.synchronusTemplateChange(this.$cachedTemplateId);
            }).bind(this));
        else
            this.synchronusTemplateChange(this.$cachedTemplateId);
    };
    
    route.unRouted = function () {
        this.$routeIsActive = false;
        this.routeValues = null;
        
        this.synchronusTemplateChange(noTemplate);
    };
    
    return route;
}());