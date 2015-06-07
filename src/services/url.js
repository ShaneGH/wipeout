Class("wipeout.services.url", function () {
    
    var urlCache = {};
    function url(object, url, hydrate) {
        if (arguments.length < 2) {
            delete object.$urlBuilder;
            return object;
        }
        
        if (!urlCache[url]) {
            var urlFunc = [], 
                open1 = /\{/g, 
                close1 = /\}/g,
                open2 = /\[/g,
                close2 = /\]/g,
                open, close, result1, result2, lastIndex = 0;
            
            while (true) {
                result1 = open1.exec(url);
                result2 = open2.exec(url);
                if (!result1 && !result2)
                    break;
                
                if (!result1 || (result2 && result1.index > result2.index)) {
                    open = open2;
                    close = close2;
                    result1 = "";
                } else {
                    open = open1;
                    close = close1;
                    result1 = "model.";
                }
                
                urlFunc.push('"' + url.substring(close.lastIndex, open.lastIndex - 1) + '"');
                close.lastIndex = open.lastIndex;
                if (close.exec(url))
                    urlFunc.push('encodeURIComponent(' + result1 + url.substring(open.lastIndex, close.lastIndex - 1) + ' || "null")');
                else
                    throw "Invalid URL: " + url;
                
                lastIndex = open1.lastIndex = close1.lastIndex = open2.lastIndex = close2.lastIndex = close.lastIndex;
            }
            
            urlFunc.push('"' + url.substring(lastIndex) + '"');
            
            urlCache[url] = new Function("model", "\treturn " + urlFunc.join(" +\n\t\t\t") + ";");
            urlCache[url].url = url;
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
        
    //TODO: all of the return falses should have detailed warnings
    var relativeUrlTest = /^~/;
    url.buildUrlFor = function (object, path) {
        
        object = [object];
        if (path) {
            path = wipeout.utils.obj.splitPropertyName(path);
            for (var i = 0, ii = path.length; i < ii; i++) {
                if (object[i] == null)
                    return false;
                
                object.push(object[i][path[i]]);
            }
            
            object.reverse();
            path.reverse();
        } else {
            path = [];
        }
        
        if (object[0] == null)
            return false;
        
        var url = [];
        for (var i = 0, ii = object.length; i < ii; i++) {
            if (typeof object[i].$urlBuilder !== "function") {
                if (i > path.length - 1)
                    return false;
            
                url.splice(0, 0, "/" + path[i].toString());
            } else {
                url.splice(0, 0, object[i].$urlBuilder(object[i]));
                if (!relativeUrlTest.test(url[0]))
                    break;
            }
        }
        
        if (relativeUrlTest.test(url[0]))
            return false;
        
        enumerateArr(url, function (val, i) {
            url[i] = val.replace(relativeUrlTest, "");
        });
        
        return {
            object: object[0],
            url: url.join("")
        };
    };
    
    url.post = function (object, path) {
        var obj = url.buildUrlFor(object, path);
        if (!obj)
            return false;
        
        warn("do post here");
        
        return obj;
    };
    
    var isAFunction = {};
    url.stringify = function (object) {
        if (typeof object === "function")
            return isAFunction;
        
        if (typeof object !== "object" || (object && object.constructor === Date))
            return JSON.stringify(object);
        
        var output = [], open, close, tmp;
        if (object instanceof Array) {
            open = "[", close = "]";
            enumerateArr(object, function (object) {
                if ((tmp = url.stringify(object)) !== isAFunction)
                    output.push(tmp);
            });
        } else {
            open = "{", close = "}";
            enumerateObj(object, function (object, i) {
                if ((tmp = url.stringify(object)) !== isAFunction)
                    output.push(JSON.stringify(i) + ':' + tmp);
            });
        }
        
        return open + output.join(",") + close;
    };
    
    return url;
});