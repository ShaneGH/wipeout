Class("wipeout.di.utils.routing.route", function () {
    
    function route (routeString, exactMatch) {
		///<summary>Define a route</summary>
        ///<param name="routeString" type="String">The route</param>
        ///<param name="exactMatch" type="Boolean" optional="true">Default: false. If true, the port, path, search and hash segments must be present in the route, if present in the url.</param>
        
        this.parts = route.splitRoute(routeString);
        this.exactMatch = exactMatch;
        
        for (var i in this.parts) {
            if (i === "uri") {
                this.uri = this.parts[i];
                delete this.parts[i];
            } else {
                this.parts[i] = new wipeout.di.utils.routing.routePart(this.parts[i]);
            }
        }
    }
    
    //TODO: ignore leading and trailing slashes in all of routing
    route.prototype.parse = function (location) {
		///<summary>Parse a document location based on this route and return the values</summary>
        ///<param name="location" type="Location" optional="true">Default: document.location. The location</param>
        ///<returns type="Object">A dictionary of values, or null if the route does not match</returns>
        
        if (!location)
            location = document.location;
        
        if (this.exactMatch &&
            ((location.port && !this.parts.port) ||
             (location.pathname && !this.parts.pathname) ||
             (location.search && location.search !== "/" && !this.parts.search) ||
             (location.hash && !this.parts.hash)))
            return null;
        
        var values = {};
        for (var part in this.parts)
            if (!this.parts[part].parse(location[part], values))
                return null;
        
        values.routedUrl = (this.parts.protocol ? (location.protocol + "//") : "") +
            (this.parts.hostname ? location.hostname : "") +
            (this.parts.port ? (":" + location.port) : "") +
            (this.parts.pathname ? location.pathname : "") +
            (this.parts.search ? location.search : "") +
            (this.parts.hash ? location.hash : "");
        
        if (values.$searchString)
            throw "Invalid route variable name \"$searchString\". This term is reserved.";
        values.$searchString = route.compileSearchValues(location); //TODM
        
        return values;
    };
        
    route.compileSearchValues = function (location) {
        var output = {};
        enumerateArr((location.search || "").replace(/^\?/, "").split("&"), function (search) {
            search = search.split("=");
            if (search.length === 2)
                output[decodeURIComponent(search[0])] = decodeURIComponent(search[1]);
            else if (search[0])
                output[decodeURIComponent(search[0])] = undefined;
        });
        
        return output;
    };
    
    //http://tools.ietf.org/html/rfc3986#section-3.1 + js variable names (\w\$\{\})
    var protocol = /^[a-zA-Z\{]([\w\$\+\-\.\{\}])*:/;
    
    route.splitRoute = function (routeString) {
		///<summary>Split a route into parts: protocol, host, path etc...</summary>
        ///<param name="routeString" type="String">The route string</param>
        ///<returns type="Object">A dictionary of parts</returns>
        
        var tmp, output = {uri: routeString};
        
        // protocol
        if (tmp = protocol.exec(routeString)) {
            output.protocol = tmp[0];
            routeString = routeString.replace(protocol, "").replace(/^\/+/, "");
        }
        
        // host
        if ((tmp = /:|((~?)\/)|\?|#|$/.exec(routeString)) && tmp.index > 0) {
            output.hostname = routeString.substring(0, tmp.index);
            routeString = routeString.replace(output.hostname, "");
        }
        
        // port
        if (output.hostname && routeString[0] === ":" && (tmp = /((~?)\/)|\?|#|$/.exec(routeString)) && tmp.index > 0) {
            output.port = routeString.substring(1, tmp.index);
            routeString = routeString.replace(":" + output.port, "");
        }
        
        // pathname
        if ((tmp = /\?|#|$/.exec(routeString)) && tmp.index > 0) {
            output.pathname = routeString.substring(0, tmp.index);
            routeString = routeString.replace(output.pathname, "");
            
            if (!output.protocol && !output.hostname && !output.port)
                output.pathname = route.fixPathName(output.pathname, wipeout.settings.applicationRootUrl);
        }
        
        // search
        if (routeString[0] === "?") {
            if ((tmp = /#|$/.exec(routeString)) && tmp.index > 0) {
                output.search = routeString.substring(0, tmp.index);
                routeString = routeString.replace(output.search, "");
            }
        }
        
        // hash
        if (routeString[0] === "#") {
            output.hash = routeString;
        } else if (routeString.length) {
            throw "Invalid url: \"" + output.uri + "\".";
        }
        
        return output;
    };
    
    route.fixPathName = function (pathName, rootPath) {
        if (pathName[0] !== "~")
            return pathName;
        
        var leadingSlash = rootPath && rootPath[0] !== "/" ? "/" : "";
        var trailingSlash = rootPath && 
            rootPath[rootPath - 1] !== "/"
            && pathName[1] !== "/" ? "/" : "";

        return leadingSlash +
            rootPath + 
            trailingSlash +
            pathName.substr(1);
    };
    
    return route;
});