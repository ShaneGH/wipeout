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
        
        //TODO: difference between host and hostname
        values.routedUrl = (this.parts.protocol ? (location.protocol + "//") : "") +
            (this.parts.host ? location.host : "") +
            (this.parts.port ? (":" + location.port) : "") +
            (this.parts.pathname ? location.pathname : "") +
            (this.parts.search ? location.search : "") +
            (this.parts.hash ? location.hash : "");
        
        return values;
    };
    
    //http://tools.ietf.org/html/rfc3986#section-3.1 (+ js variable names)
    var protocol = /^[a-zA-Z\{]([\w\$\+\-\.\{\}])*:/;
    
    route.splitRoute = function (route) {
		///<summary>Split a route into parts: protocol, host, path etc...</summary>
        ///<param name="route" type="String">The route string</param>
        ///<returns type="Object">A dictionary of parts</returns>
        
        var tmp, output = {uri: route};
        
        // protocol
        if (tmp = protocol.exec(route)) {
            output.protocol = tmp[0];
            route = route.replace(protocol, "").replace(/^\/+/, "");
        }
        
        // host
        if ((tmp = /[:\/\?#]|$/.exec(route)) && tmp.index > 0) {
            output.host = route.substring(0, tmp.index);
            route = route.replace(output.host, "");
        }
        
        // port
        if (output.host && route[0] === ":" && (tmp = /[\/\?#]|$/.exec(route)) && tmp.index > 0) {
            output.port = route.substring(1, tmp.index);
            route = route.replace(":" + output.port, "");
        }
        
        // pathname
        if ((tmp = /[\?#]|$/.exec(route)) && tmp.index > 0) {
            output.pathname = route.substring(0, tmp.index);
            route = route.replace(output.pathname, "");
        }
        
        // search
        if (route[0] === "?") {
            if ((tmp = /[#]|$/.exec(route)) && tmp.index > 0) {
                output.search = route.substring(0, tmp.index);
                route = route.replace(output.search, "");
            }
        }
        
        // hash
        if (route[0] === "#") {
            output.hash = route;
        } else if (route.length) {
            throw "Invalid url: \"" + output.uri + "\".";
        }
        
        return output;
    };
    
    return route;
});