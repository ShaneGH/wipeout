
Class("wipeout.change.objectObserveObjectHandler", function () {
        
    var useObjectObserve = wipeout.base.watched.useObjectObserve;
    
    var objectObserveObjectHandler = wipeout.change.objectHandler.extend(function objectObserveObjectHandler (forObject) {
        
        this._super(forObject);
        
        this.registeredChanges = [];
        this.extraCallbacks = 0;

        this.__subscription = (function(changes) {
            if (this.extraCallbacks) return;
            this.registeredChanges.length = 0;

            enumerateArr(changes, function(change) {
                this.registerChange(change);
            }, this)
        }).bind(this);
        
        (this.forArray ? Array : Object).observe(forObject, this.__subscription);
    });
    
    objectObserveObjectHandler.prototype._observe = function (property, callback, callbackList, sortCallback) {
        
        var _this = this, tempSubscription = function (changes) {
            
            // was disposed of
            if (!_this.__subscription) {
                Object.unobserve(_this.forObject, tempSubscription);
                return;
            }
                        
            // has been disposed of, do nothing
            if (!_this) return;
                        
            enumerateArr(changes, function(change) {
                
                if (callback.firstChange === true && (change.name === property || (property === wipeout.change.objectHandler.arrayIndexProperty) && this.isValidArrayChange(change))) {
                    Object.unobserve(_this.forObject, tempSubscription);
                    _this.extraCallbacks--;
                    firstChangeDone = true;
                    
                    callback.firstChange = change;
                    callbackList.push(callback);
                    sortCallback();
                }
                
                // record change so that another subscription will not act on it
                if (_this.registeredChanges.indexOf(change) !== -1) return;
                _this.registeredChanges.push(change);
                
                _this.registerChange(change);
            }, _this);
        };
            
        (this.forArray ? Array : Object).observe(this.forObject, tempSubscription);        
        this.extraCallbacks++;
        
        return function () {
            // using _this as a flag
            _this = null;
        };
    };
    
    objectObserveObjectHandler.prototype.dispose = function() {
        
        this._super();
        
        if (this.__subscription) {
            (this.forArray ? Array : Object).unobserve(this.forObject, this.__subscription);
            delete this.__subscription;
        }
    }
    
    return objectObserveObjectHandler;
});