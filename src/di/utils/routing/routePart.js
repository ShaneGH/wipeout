Class("wipeout.di.utils.routing.routePart", function () {
    
    var begin = /\{/, end = /\}/;
    function routePart (route) {
		///<summary>Define a section of a route</summary>
        ///<param name="route" type="String">The route section</param>
                
        this.parts = [];
        var r = route, tmp;
        while (tmp = begin.exec(route)) {
            this.parts.push(route.substr(0, tmp.index));

            if (!(tmp = end.exec(route)))
                throw "Invalid route part: \"" + r + "\"";

            this.parts.push(route.substring(this.parts[this.parts.length - 1].length + 1, tmp.index));
            route = route.substr(tmp.index + 1);
        }
        
        if (route.length)
            this.parts.push(route);
    }
    
    routePart.prototype.parse = function (uriPart, values) {
		///<summary>Parse a string into values based on the route</summary>
        ///<param name="uriPart" type="String">The string to parse</param>
        ///<param name="values" type="Object" optional="true">The object to append values to. If null, will create a new object</param>
        ///<returns type="Object">A dictionary of values, or null if the route part does not match</returns>
        
        var vals = [""], temp;
        if (uriPart.indexOf(this.parts[0]) !== 0)
            return null;

        uriPart = uriPart.substr(this.parts[0].length);
        for (var i = 2, ii = this.parts.length; i < ii; i+=2) {
            if ((temp = uriPart.indexOf(this.parts[i])) === -1)
                return null;

            // add blank space to sync next array
            vals.push(uriPart.substr(0, temp), "");
            uriPart = uriPart.substr(this.parts[i].length + temp);
        }
        
        // there is a final variable bit at the end
        if (uriPart.length) {
            if (vals.length >= this.parts.length)
                return null;
            
            vals.push(uriPart);
        }
        
        values = values || {};
        for (i = 1, ii = vals.length; i < ii; i+=2) {
            if (values[this.parts[i]])
                throw "Duplicate url value for: \"" + this.parts[i] + "\".";
            
            values[this.parts[i]] = decodeURIComponent(vals[i]);
        }

        return values;
    };
    
    return routePart;
});