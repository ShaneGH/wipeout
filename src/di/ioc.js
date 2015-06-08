
Class("wipeout.di.ioc", function () {
    
    setup.push(function () {
               
        ioc.instance = new ioc(wipeout.services);
    });
    
    function ioc (services) {
        this.services = services;
        this.cached = {};
    }
    
    ioc.prototype.get = function (name, crc) {
        var service = this.services[name];
        if (!(service instanceof Function))
            return null;
        
        if (service.singleton)
            return service;
        
        if (!crc)
            crc = [name];
        else if (crc.indexOf(name) !== -1)
            throw "Circular reference detected when creating services. Reference path: " + crc.join(", ") + ", " + name;
        else {
            // different array for each path will help with error reporting
            crc = crc.slice();
            crc.push(name);
        }
        
        if (!this.cached[name]) {
            this.cached[name] = ioc.build(wipeout.utils.jsParse.getArgumentNames(service));
        }
        
        return this.cached[name](service, this, crc);
    };
    
    ioc.build = function (args) {
        var functionString = [];
        enumerateArr(args, function(arg, i) { 
            functionString.push("var arg" + i + " = container.get(\"" + arg + "\", crc);");
            args[i] = "arg" + i;
        });

        functionString.push("");
        functionString.push("service = new service(" + args.join(", ") + ");");
        functionString.push("");

        enumerateArr(args, function (arg) {
            functionString.push("if (" + arg + " && !" + arg + ".singleton)");
            functionString.push("\tservice.registerDisposable(" + arg + ");");
        });

        functionString.push("");
        functionString.push("return service;");

        return new Function("service", "container", "crc", functionString.join("\n"));
    }
    
    return ioc;
});
