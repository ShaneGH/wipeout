
//"use strict"; - cannot use strict right now. any functions defined in strict mode are not accesable via arguments.callee.caller, which is used by _super

var ajax = function (options) {
    ///<summary>Perform an ajax request</summary>
    ///<param name="options" type="Object">Configure the request</param>
    ///<returns type="XMLHttpRequest">The ajax request object</returns>
    
    var xmlhttp = window.XMLHttpRequest ?
        new XMLHttpRequest() :
        new ActiveXObject("Microsoft.XMLHTTP");

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            // 0 for non web srever response (e.g. file system)
            if ((xmlhttp.status == 200 || xmlhttp.status == 0) && options.success) {
                options.success(xmlhttp);
            } else if (options.error) {
                options.error(xmlhttp);
            }
        }
    };

    xmlhttp.open(options.type || "GET", options.url || document.location.href, options.hasOwnProperty("async") ? options.async : true);
    xmlhttp.send();
    
    return xmlhttp;
};
    
var enumerateArr = function(enumerate, action, context) {
    ///<summary>Enumerate through an array or object</summary>
    ///<param name="enumerate" type="Any">An item to enumerate over</param>
    ///<param name="action" type="Function">The callback to apply to each item</param>
    ///<param name="context" type="Any" optional="true">The context to apply to the callback</param>
    
    if (!enumerate) return;
    
    context = context || window;
    
    for(var i = 0, ii = enumerate.length; i < ii; i++)
        action.call(context, enumerate[i], i);
};
    
var enumerateObj = function(enumerate, action, context) {
    ///<summary>Enumerate through an array or object</summary>
    ///<param name="enumerate" type="Any">An item to enumerate over</param>
    ///<param name="action" type="Function">The callback to apply to each item</param>
    ///<param name="context" type="Any" optional="true">The context to apply to the callback</param>
    
    if (!enumerate) return;
    
    context = context || window;
        
    if(enumerate == null) return;

    for(var i in enumerate)
        action.call(context, enumerate[i], i);
};

var Class = function(classFullName, accessorFunction) {
    ///<summary>Create a wipeout class</summary>
    ///<param name="classFullName" type="String">The name of the class</param>
    ///<param name="accessorFunction" type="Function">A function which returns the class</param>
    
	var current = window;
    classFullName = splitPropertyName(classFullName);
    
    if (classFullName[0] === "wipeout") {
		current = wipeout;
    	classFullName.splice(0, 1);
		if (!classFullName.length)
			throw 'Cannot override the "wipeout" variable';
	}
	
	for (var i = 0, ii = classFullName.length - 1; i < ii; i++)
		current = current[classFullName[i]] || (current[classFullName[i]] = {});
	
	return current[classFullName[classFullName.length - 1]] = accessorFunction();
};

function HtmlAttr(attributeName, accessorFunction) {
	///<summary>Create a wipeout html attribute</summary>
	///<param name="attributeName" type="String">The name of the attribute</param>
	///<param name="accessorFunction" type="Function">A function which returns the attribute handler</param>
	
	Class("wipeout.template.rendering.htmlAttributes." + "wo-" + attributeName, accessorFunction);
	accessorFunction = function () {
		return wipeout.template.rendering.htmlAttributes["wo-" + attributeName];
	};
	
	if (wipeout.template.rendering.htmlAttributes["wo-" + attributeName].test instanceof Function)
		Class("wipeout.template.rendering.dynamicHtmlAttributes." + "wo-" + attributeName, accessorFunction);
	
	return Class("wipeout.template.rendering.htmlAttributes." + "data-wo-" + attributeName, accessorFunction);
};

function SimpleHtmlAttr(attributeName, attribute) {
	///<summary>Create a wipeout html attribute</summary>
	///<param name="attributeName" type="String">The name of the attribute</param>
	///<param name="accessorFunction" type="Function">A function which returns the attribute handler</param>
	
    return HtmlAttr(attributeName, function () {
        return attribute;
    });
};
    
var _trimString = /^\s+|\s+$/g;
var trim = function(string) {
    ///<summary>Trims a string</summary>
    ///<param name="string" type="String">The string to trim</param>
    ///<returns type="String">The trimmed string</returns>
    
    return string ? string.replace(_trimString, '') : string;
};

var trimToLower = function(string) {
    ///<summary>Trims a string and converts it to lower case</summary>
    ///<param name="string" type="String">The string to trim</param>
    ///<returns type="String">The trimmed string</returns>
    
    return string ? trim(string).toLowerCase() : string;
};

var parseBool = function(input) {
    ///<summary>Parses a String into a Boolean</summary>
    ///<param name="input" type="String">The string to parse</param>
    ///<returns type="Boolean">The parsed boolean</returns>
    
    if(input == null) return false;
        
    input = trimToLower(input);
    
    return !!(input && input !== "false" && input !== "0");
};

var camelCase = function(input) {
    ///<summary>Converts a string from "first-second" to "firstSecond"</summary>
    ///<param name="input" type="String">The string to convert</param>
    ///<returns type="String">The camel cased string</returns>
    
    if(!input) return input;
    
    var minus = /\-/, i;
    while ((i = input.search(minus)) !== -1) {
        if (i === input.length - 1) {
            return input.substr(0, i);
        } else {
            input = input.substr(0, i) + input[i + 1].toUpperCase() + input.substr(i + 2);
        }
    }
    
    return input;
};

var splitPropertyName = (function () {
	
	var arrayMatch = /\[\s*\d\s*\]$/g;
	return function(propertyName) {
        ///<summary>Split a property path into its component parts</summary>
        ///<param name="propertyName" type="String">the property</param>
        ///<returns type="Array">An array of strings and numbers</returns>
		
		propertyName = propertyName.split(".");

		var tmp;
		for (var i = 0; i < propertyName.length; i++) {
			propertyName[i] = trim(propertyName[i]);
			var match = propertyName[i].match(arrayMatch);
			if (match && match.length) {
				if (tmp = trim(propertyName[i].replace(arrayMatch, ""))) {
					propertyName[i] = trim(propertyName[i].replace(arrayMatch, ""));
				} else {
					propertyName.splice(i, 1);
					i--;
				}

				for (var j = 0, jj = match.length; j < jj; j++)
					propertyName.splice(++i, 0, parseInt(match[j].match(/\d/)[0]));
			}
		}

		return propertyName;
	};
}());

Class("wipeout.utils.obj", function () {
            
    var joinPropertyName = function (propertyName) {
        ///<summary>Join an array of strings and numbers into a property path</summary>
        ///<param name="propertyName" type="Array">the name</param>
        ///<returns type="String">The name</returns>
		
        var output = [];
        enumerateArr(propertyName, function (item) {
            if (!isNaN(item))
                output.push("[" + item + "]");
            else if (output.length === 0)
                output.push(item);
            else
                output.push("." + item);
        });
        
        return output.join("");
    }
    
    var getObject = function(propertyName, context) {
        ///<summary>Get an object from string</summary>
        ///<param name="propertyName" type="String">A pointer to the object to get</param>
        ///<param name="context" type="Any" optional="true">The root context. Defaults to window</param>
        ///<returns type="Any">The object</returns>
        
        return _getObject(splitPropertyName(propertyName), context);
    };
    
    var _getObject = function(splitPropertyName, context) {
        ///<summary>Get an object from string</summary>
        ///<param name="splitPropertyName" type="Array">The property name split into parts, including numbers for array parts</param>
        ///<param name="context" type="Any" optional="true">The root context. Defaults to window</param>
        ///<returns type="Any">The object</returns>
        if(!context) context = window;
        
        for (var i = 0, ii = splitPropertyName.length; i <ii; i++) {
            context = context[splitPropertyName[i]];
            if(context == null)
                return i === ii - 1 ? context : null;
        }
        
        return context;
    };
    
    var setObject = function(propertyName, context, value) {
        ///<summary>Set an object</summary>
        ///<param name="propertyName" type="String">The property name</param>
        ///<param name="context" type="Any">The root</param>
        ///<param name="value" type="Any">The value</param>
        ///<returns type="Any">The value</returns>
		
        propertyName = splitPropertyName(propertyName);
        if (propertyName.length > 1)
            context = _getObject(propertyName.splice(0, propertyName.length -1), context);
        
		if (context)
        	return context[propertyName[0]] = value;
    };

    var copyArray = function(input) {
        ///<summary>Make a deep copy of an array</summary>
        ///<param name="input" type="Array">The array to copy</param>
        ///<returns type="Array">The copied array</returns>
        
        if (input instanceof Array)
            return input.slice();
        
        var output = [];
        for(var i = 0, ii = input.length; i < ii; i++) {
            output.push(input[i]);
        }
        
        return output;
    };
    
    var random = function(max) {
        ///<summary>Random int generator</summary>
        ///<param name="max" type="Number">The maximum value</param>
        ///<returns type="Number">A random number</returns>
		
        return Math.floor(Math.random() * max);
    };
    
    var extend = function(extend, extendWith) {
        ///<summary>The same as jQuery.extend</summary>
        ///<param name="extend" type="Object">The object to extend</param>
        ///<param name="extendWith" type="Object">The object to extend it with</param>
        ///<returns type="Object">The object to extend</returns>
		
        if(extendWith && extend)
            for(var i in extendWith)
                extend[i] = extendWith[i];
        
        return extend;
    };
    
    function asRegExp (inputString) {
        return new RegExp(asRegExp.convert(inputString));
    }
    
    var regexpReplace = /(?=[-\/\\^$*+?.()|[\]{}])/g;
    asRegExp.convert = function (inputString) {
        return inputString.replace(regexpReplace, "\\");
    }
    
    asRegExp.g = function (inputString) {
        return new RegExp(asRegExp.convert(inputString), "g");
    }
    
    asRegExp.ig = function (inputString) {
        return new RegExp(asRegExp.convert(inputString), "gi");
    }
    
    asRegExp.i = function (inputString) {
        return new RegExp(asRegExp.convert(inputString), "i");
    }
    
    var obj = function obj() { };
    obj.extend = extend;
    obj.camelCase = camelCase;
    obj.ajax = ajax;
    obj.parseBool = parseBool;
    obj.trimToLower = trimToLower;
    obj.trim = trim;
    obj.enumerateArr = enumerateArr;
    obj.enumerateObj = enumerateObj;
    obj.getObject = getObject;
    obj.setObject = setObject;
    obj.splitPropertyName = splitPropertyName;
    obj.joinPropertyName = joinPropertyName;
    obj.copyArray = copyArray;
    obj.random = random;
    obj.asRegExp = asRegExp;
    return obj;
});