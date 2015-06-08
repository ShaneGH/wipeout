Class("wipeout.services.router", function () {
    
    var router = busybody.observable.extend(function router (location) {
        this.location = location;
        this.activate();
    });
    
    var active = [];
    router.onPopState = onPopState;
    
    function onPopState () {
        enumerateArr(active, function (router) {
            router.parse();
        });
    }
    
    router.prototype.activate = function () {
        if (active.indexOf(this) !== -1)
            return;
        
        if (!active.length)
            window.addEventListener("popstate", onPopState);
        
        active.push(this);
    };
    
    router.prototype.deActivate = function () {
        var tmp;
        while ((tmp = active.indexOf(this)) !== -1)
            active.splice(tmp, 1);
        
        if (!active.length)
            window.removeEventListener("popstate", onPopState);
    };
    
    router.prototype.dispose = function () {
        try {
            this._super();
        } finally {
            this.deActivate();
            this.routes = null;
        }
    };
    
    router.prototype.parse = function () {
        enumerateObj(this.routes, function (route) {
            var vals = route.parse(this.location);
            enumerateArr(route.callbacks, function (cb) {
                cb.invokeIfValid(vals);
            });
        }, this);
    };
    
    //TODO: change arg structure?
    router.prototype.addRoute = function (route, callback, options) {
        // options: exactMatch, unRoutedCallback, executeImmediately
        
        if (!route || !callback)
            return;
        
        this.routes = this.routes || {};
        
        var routeKey = route + (!!(options && options.exactMatch));
        
        if (!this.routes[routeKey]) {
            this.routes[routeKey] = new wipeout.services.routing.route(route, options && options.exactMatch);
            this.routes[routeKey].callbacks = [callback];
        } else {
            this.routes[routeKey].callbacks.push(callback);
        }   
        
        callback.args = wipeout.utils.jsParse.getArgumentNames(callback);
        callback.invokeIfValid = invokeIfValid;
        callback.unRoutedCallback = options && options.unRoutedCallback;
        
        if (options && options.executeImmediately) {
            var vals = this.routes[routeKey].parse(this.location);
            callback.invokeIfValid(vals);
        }
        
        return {
            dispose: (function () {
                if (!route)
                    return;
                
                if (this.routes && this.routes[routeKey])
                    while ((route = this.routes[routeKey].callbacks.indexOf(callback)) !== -1)
                        this.routes[routeKey].callbacks.splice(route, 1);
                
                route = null;
            }).bind(this)
        };
    };
    
    function invokeIfValid (vals) {
        if (!vals) {
            if (this.hasControl && this.unRoutedCallback)
                this.unRoutedCallback.call(null);
            
            return this.hasControl = false;;
        }
        
        var args = [];
        for (var i = 0, ii = this.args.length; i < ii; i++) {
            if (this.args[i] === "$allValues") {
                args.push(vals);
            } else if (!vals.hasOwnProperty(this.args[i])) {
                if (this.hasControl && this.unRoutedCallback)
                    this.unRoutedCallback.call(null);
                    
                return this.hasControl = false;
            } else {
                args.push(vals[this.args[i]]);
            }
        }
        
        this.apply(null, args);
        
        return this.hasControl = true;
    }
    
    return router;
});