
Class("wipeout.template.loader", function () {
    
    function loader(templateName) {
        ///<summary>Private class for loading templates asynchronously</summary>
        ///<param name="templateName" type="string" optional="false">The name and url of this template</param>
		
        ///<summary type="[Function]">Specifies success callbacks for when template is loaded. If this property in null, the loading process has completed</summary>
        this._callbacks = [];
        
        ///<summary type="String">the name and url of the template to load</summary>
        this.templateName = templateName;
        
        wipeout.utils.obj.ajax({
            type: "GET",
            url: templateName,
            success: (function(result) {
                
                new wipeout.template.templateModuleLoader(result.responseText, (function (template) {
                    this._success = true;
                    var callbacks = this._callbacks;
                    delete this._callbacks;

                    this.templateValue = template;
                    for(var i = 0, ii = callbacks.length; i < ii; i++)
                        callbacks[i](this.templateValue);
                }).bind(this)).load();
            }).bind(this),
            error: (function() {
                delete this._callbacks;
                this._success = false;
                throw "Could not locate template \"" + templateName + "\"";
            }).bind(this)
        });
    }
    
    loader.prototype.add = function(success) {
        ///<summary>Call success when this template is loaded</summary>
        ///<param name="success" type="Function" optional="false">The callback</param>
        ///<returns type="Object">Null, if the template is loaded, an object with a "cancel" function to cancel the load</returns>
        
        if (this._callbacks) {
            this._callbacks.push(success);
            
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
        
        if (this._success) {
            success(this.templateValue);
            return null;
        }
        
        throw "Could not load template \"" + this.templateName + "\"";
    }
	
	return loader;
});