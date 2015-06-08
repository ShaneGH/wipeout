
Class("wipeout.di.ioc", function () {
    
    setup.push(function () {
               
        ioc.instance = new ioc(wipeout.services);
    });
    
    function ioc (services) {
        this.services = services;
        this.cached = {};
    }
    
    ioc.prototype.get = function (name) {
        var service = this.services[name];
        if (!(service instanceof Function))
            return null;
        
        if (service.singleton)
            return service;
        
        if (!this.cached[name]) {
            var args = wipeout.utils.jsParse.getArgumentNames(service);
            var functionString = [];
            enumerateArr(args, function(arg, i) { 
                functionString.push("var arg" + i + " = container.get(\"" + arg + "\");");
                args[i] = "arg" + i;
            });
            
            functionString.push("");
            functionString.push("service = new service(" + args.join(", ") + ");");
            functionString.push("");
            
            enumerateArr(args, function (arg) {
                functionString.push("if (!" + arg + ".singleton)");
                functionString.push("\tservice.registerDisposable(" + arg + ");");
            });
            
            functionString.push("");
            functionString.push("return service;");
            
            this.cached[name] = new Function("service", "container", functionString.join("\n"));
        }
        
        return this.cached[name](service, this);
    };
    
    return ioc;
});
