Class("wipeout.di.utils.routing.routePart", function () {
    
    var begin = /\{/, end = /\}/, exact = /\*$/;
    var routePart = orienteer.extend(function routePart (route) {
		///<summary>Define a section of a route</summary>
        ///<param name="route" type="String">The route section</param>
        
        this.parts = [];
        this.variables = {};
        
        var exactMatch = !exact.test(route);
        if (!exactMatch)
            route = route.replace(exact, "");
        
        var r = route, tmp, staticPart, variableName, compulsary;
        while (tmp = begin.exec(route)) {
            staticPart = route.substr(0, tmp.index);
            this.parts.push(wipeout.utils.obj.asRegExp.i(staticPart));

            if (!(tmp = end.exec(route)))
                throw "Invalid route part: \"" + r + "\". Missing closing brace \"}\"";

            variableName = route.substring(staticPart.length + 1, tmp.index);
            if (variableName[0] === "*") {
                variableName = variableName.substr(1);
                compulsary = false;
            } else {
                compulsary = true;
            }
            
            if (this.variables[variableName])
                throw "Invalid route part: \"" + r + "\". Variable \"" + variableName + "\" defined more than once.";
            
            //TODO: parser flags
                
            this.variables[variableName] = compulsary;
            this.parts.push(variableName);
            route = route.substr(tmp.index + 1);
        }
        
        if (route.length)
            this.parts.push(wipeout.utils.obj.asRegExp.i(route));
        
        if (exactMatch)
            this.parts.push(/$/);
    });
    
    routePart.prototype.parse = function (uriPart, values) {
		///<summary>Parse a string into values based on the route</summary>
        ///<param name="uriPart" type="String">The string to parse</param>
        ///<param name="values" type="Object" optional="true">The object to append values to. If null, will create a new object</param>
        ///<returns type="Object">A dictionary of values, or null if the route part does not match</returns>
        
        // check no other route has assigned variables belonging to this
        if (values) //TEST
            for (var i in this.variables)
                if (values.hasOwnProperty(i))
                    throw "Duplicate url value for: \"" + i + "\".";
        
        var routedVariables = {}, temp;
        for (var i = 0, ii = this.parts.length; i < ii; i++) {
            
            // if it is a static part, ensure it is at the beginning
            // and remove from uri
            if (this.parts[i] instanceof RegExp) {
                if (!(temp = this.parts[i].exec(uriPart)) || temp.index !== 0)
                    return null;
                
                uriPart = uriPart.substr(temp[0].length);
            } else {
                if (i + 1 < ii) {
                    if (!(temp = this.parts[i + 1].exec(uriPart)))
                        return null;
                } else {
                    temp = {index: uriPart.length};
                }

                // get the value
                routedVariables[this.parts[i]] = uriPart.substr(0, temp.index);

                // remove value from route
                uriPart = uriPart.substr(temp.index);
            }
        }
        
        values = values || {};
        for (var i in this.variables) { //TEST
            if (this.variables[i]) {
                if (!routedVariables.hasOwnProperty(i) || routedVariables[i] === "")
                    return null;
                
                values[i] = routedVariables[i]; //TODO: parse
            } else {
                values[i] = routedVariables[i] === "" ? null : routedVariables[i];  //TODO: parse
            }
        }

        return values;
    };
    
    return routePart;
});