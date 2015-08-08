
Class("wipeout.base.asyncLoaderBase", function () {
    
    var asyncLoaderBase = orienteer.extend(function asyncLoaderBase() {
        ///<summary>Base class for running an async operation and running callbacks safely</summary>
		
        ///<summary type="[Function]">Specifies success callbacks for when operation is complete. If this property in null, the loading process has completed</summary>
        this._callbacks = [];
    });
    
    asyncLoaderBase.prototype.failure = function() {
        this._callbacks = null;
    };
    
    asyncLoaderBase.prototype.success = function() {
        if (this.__successArgs)
            return; // can only call this method once
    
        this.__successArgs = Array.prototype.slice.call(arguments);
        var callbacks = this._callbacks;
        this._callbacks = null;

        for(var i = 0, ii = callbacks.length; i < ii; i++)
            callbacks[i].apply(null, this.__successArgs);
    };
    
    asyncLoaderBase.prototype.addCallback = function(success) {
        ///<summary>Call success when this template is loaded</summary>
        ///<param name="success" type="Function" optional="false">The callback</param>
        ///<returns type="Object">Null, if the template is loaded, an object with a "cancel" function to cancel the load</returns>
        
        if (this._callbacks) {
            this._callbacks.push(success = success.bind(null)); // make unique function
        } else if (this.__successArgs) {
            success.apply(null, this.__successArgs);
            return null;
        } else {
            throw "Async operation failed";
        }
            
        var onCancel;
        return {
            cancel: (function() {
                var i;
                if (this._callbacks && (i = this._callbacks.indexOf(success)) !== -1)
                    this._callbacks.splice(i, 1);

                enumerateArr(onCancel, function (cb) {
                    cb();
                });
            }).bind(this),
            onCancel: function (callback) {
                if (!callback)
                    return;

                if (!onCancel)
                    onCancel = [callback];
                else
                    onCancel.push(callback);
            }
        };        
    }
	
	return asyncLoaderBase;
});