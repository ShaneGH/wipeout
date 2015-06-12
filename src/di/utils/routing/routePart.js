Class("wipeout.di.utils.routing.routePart", function () {
    
    var begin = /\{/, end = /\}/, invalidExactBeginning = /^\*\{/, exactBeginning = /^\*/, exactEnding = /\*$/;
    var routePart = orienteer.extend(function routePart (route) {
		///<summary>Define a section of a route</summary>
        ///<param name="route" type="String">The route section</param>
        
        // * will only match the beginning, ** will passthrough everything
        if (route === "*")
            route = "**";
        
        this.parts = [];
        this.variables = {};
        
        if (invalidExactBeginning.test(route))
            throw "The route \"" + route + "\" is invalid. You cannot begin a route with a wildcard followed by a route variable as all wildcard characters will be compiled into the route variable";
        
        var startExact = !exactBeginning.test(route);
        if (!startExact)
            route = route.replace(exactBeginning, "");
        
        // determine if route is exact match
        var endExact = !exactEnding.test(route);    //TODM
        if (!endExact)
            route = route.replace(exactEnding, "");
        
        // add static values and variables
        var r = route, tmp, staticPart, variable;
        
        // find first variable
        while (tmp = begin.exec(route)) {
            // add static part
            staticPart = route.substr(0, tmp.index);
            if (!startExact) {
                this.parts.push(new RegExp(".*" + wipeout.utils.obj.asRegExp.convert(staticPart), "i"));
                startExact = true;
            } else {
                this.parts.push(wipeout.utils.obj.asRegExp.i(staticPart));
            }

            // get variable name
            if (!(tmp = end.exec(route)))
                throw "Invalid route part: \"" + r + "\". Missing closing brace \"}\"";
            variable = routePart.prepareVariable(route.substring(staticPart.length + 1, tmp.index));
            
            if (this.variables[variable.name])
                throw "Invalid route part: \"" + r + "\". Variable \"" + variable.name + "\" defined more than once.";

            // add variable metadata
            this.variables[variable.name] = variable;
            
            // add variable name
            this.parts.push(variable.name);
            
            // prepare route for next loop
            route = route.substr(tmp.index + 1);
        }
        
        if (route.length) {
            if (!startExact) {
                this.parts.push(new RegExp(".*" + wipeout.utils.obj.asRegExp.convert(route), "i"));
            } else {
                this.parts.push(wipeout.utils.obj.asRegExp.i(route));
            }
        }
        
        if (endExact)
            this.parts.push(/$/);
    });
    
    var compulsary = /^\*/;
    routePart.prepareVariable = function (variableName) {

        variableName = wipeout.template.rendering.compiledTemplate.getPropertyFlags(variableName);
        var output = {
            compulsary: !compulsary.test(variableName.name),    //TODM
            name: variableName.name,
            parser: wipeout.template.initialization.parsers.string  //TODM
        };
        
        // determine whether variable is compulsary
        if (!output.compulsary)
            output.name = output.name.replace(compulsary, "");
        
        // try to get custom parser
        for (var i = 0, ii = variableName.flags.length; i < ii; i++)
            if (wipeout.template.initialization.parsers[variableName.flags[i]]) {
                output.parser = wipeout.template.initialization.parsers[variableName.flags[i]];
                break;
            }
        
        return output;
    };
    
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
            if (this.variables[i].compulsary) {
                if (!routedVariables.hasOwnProperty(i) || routedVariables[i] === "")
                    return null;
                
                values[i] = this.variables[i].parser(decodeURIComponent(routedVariables[i]));
            } else {
                values[i] = routedVariables[i] === "" ? null : this.variables[i].parser(decodeURIComponent(routedVariables[i]));
            }
        }

        return values;
    };
    
    return routePart;
});