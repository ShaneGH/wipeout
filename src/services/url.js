Class("wipeout.services.url", function () {
    
    var urlCache = {};
    function url(object, url, hydrate) {
        if (arguments.length < 2) {
            delete object.$urlBuilder;
            return object;
        }
        
        if (!urlCache[url]) {
            var urlFunc = [], 
                open = /\{/g, 
                close = /\}/g;
            
            while ((open.lastIndex = close.lastIndex), open.exec(url)) {
                urlFunc.push('"' + url.substring(close.lastIndex, open.lastIndex - 1) + '"');
                close.lastIndex = open.lastIndex;
                if (close.exec(url))
                    urlFunc.push('encodeURIComponent(model["' + url.substring(open.lastIndex, close.lastIndex - 1) + '"] || "null")');
                else
                    throw "Invalid URL: " + url;
            }
            
            urlCache[url] = new Function("model", "\treturn " + urlFunc.join(" +\n\t\t\t") + ";");
        }

        Object.defineProperty(object, "$urlBuilder", {
            enumerable: false,
            configurable: true,
            value: urlCache[url],
            writable: false
        });
        
        if (hydrate)
            wipeout.services.url.hydrate(object);
        
        return object;
    };
    
    url.hydrate = function (object) {
        if (!object.$urlBuilder)
            return;
        
        wipeout.utils.obj.ajax({
            url: object.$urlBuilder(object),
            success: function (result) {
                var r = result.response;
                result = convertArrays(JSON.parse(result.response));
                for (var i in object)
                    if (object.hasOwnProperty(i) && !result.hasOwnProperty(i))
                        delete object[i];
                
                for (var i in result)
                    object[i] = result[i];
            }
        });
    };
    
    function convertArrays (object) {
        if (typeof object !== "object") return;
        
        if (object instanceof Array) {
            enumerateArr(object, function (obj, i) {
                if (obj instanceof Array)
                    obj = object[i] = busybody.array(obj);
                
                convertArrays(obj);
            });
        } else {
            enumerateObj(object, function (obj, i) {
                if (obj instanceof Array)
                    obj = object[i] = busybody.array(obj);
                
                convertArrays(obj);
            });
        }
        
        return object;
    }
    
    url.stringify = function (object) {
        if (typeof object !== "object" || (object && object.constructor === Date))
            return JSON.stringify(object);
        
        var output = [], open, close;
        if (object instanceof Array) {
            open = "[", close = "]";
            enumerateArr(object, function (object) {
                output.push(url.stringify(object));
            });
        } else {
            open = "{", close = "}";
            enumerateObj(object, function (object, i) {
                output.push(JSON.stringify(i) + ':' + url.stringify(object));
            });
        }
        
        return open + output.join(",") + close;
    };
    
    return url;
});