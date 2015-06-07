Class("wipeout.services.router", function () {
    
    var active = [];
    router.onPopState = onPopState;
    
    function onPopState () {
        enumerateArr(active, function (router) {
            router.parse();
        });
    }
    
    function router (activate) {
        if (activate || !arguments.length)
            this.activate();
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
        this.deActivate();
        this.routes = null;
    };
    
    router.prototype.parse = function (location) {
        enumerateObj(this.routes, function (route) {
            var vals = route.parse(location);
            if (vals) {
                enumerateArr(route.callbacks, function (cb) {
                    cb.tryInvoke(vals);
                })
            }
        });
    };
    
    router.prototype.addRoute = function (route, callback, exactMatch) {
        if (!route || !callback)
            return;
        
        this.routes = this.routes || {};
        
        var routeKey = route + (!!exactMatch);
        
        if (!this.routes[routeKey]) {
            this.routes[routeKey] = new wipeout.services.routing.route(route, exactMatch);
            this.routes[routeKey].callbacks = [callback];
        } else {
            this.routes[routeKey].callbacks.push(callback);
        }   
        
        callback.args = wipeout.utils.jsParse.getArgumentNames(callback);
        callback.tryInvoke = tryInvoke;
        
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
    
    function tryInvoke (vals) {
        var args = [];
        for (var i = 0, ii = this.args.length; i < ii; i++) {
            if (this.args[i] === "$allValues")
                args.push(vals);
            else if (!vals.hasOwnProperty(this.args[i]))
                return false;
            else
                args.push(vals[this.args[i]]);
        }
        
        this.apply(null, args);
        
        return true;
    }
    
    return router;
});