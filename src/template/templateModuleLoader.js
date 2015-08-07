Class("wipeout.template.templateModuleLoader", function () {
    
    
    var templateModuleLoader = wipeout.base.asyncLoaderBase.extend(function templateModuleLoader (template) {
        ///<summary>Scans a template for required modules and loads them</summary>
        ///<param name="template" type="string" optional="false">The template</param>
        ///<param name="onComplete" type="Function" optional="true">A callback to invoke on complete</param>
		
        this._super();
        
        this.getModules(template);
    });
    
    templateModuleLoader.prototype.getModules = function(template) {
        this.modules = [];
        
        var mod;
        // find blank lines or lines beginning with ~. ~ can be escaped with ~~
        //TODM
        while (mod = /(^\s+)|(^\s*~(?!~).*)/.exec(template)) {
            template = template.replace(mod[0], "");
            if (/^\s*$/.test(mod[0]))
                continue;
            
            this.modules.push(mod[0].replace(/^\s*~\s*/, "").replace(/\s+$/, "").replace(/\./g, "/"));
        }
        
        this.template = template[0] === "~" && template[1] === "~" ? template.substr(1) : template;
    };
    
    templateModuleLoader.prototype.load = function() {
        ///<summary>Load the modules found in the template</summary>
        ///<returns type="Boolean">True if there are moudles to load, running asynchronusly. False otherwise, running synchronusly.</returns>
        
        if (this.__loading) return true;
        
        // remove modules which are already present
        for (var i = this.modules.length - 1; i >= 0; i--) {
            if (wipeout.utils.obj.getObject(this.modules[i]))
                this.modules.splice(i, 1);
        }
        
        if (!this.modules.length) {
            if (this.callback) this.callback(this.template);
            return false;
        }
        
        this.__loading = this.modules.length;
        enumerateArr(this.modules, this.addModuleScript, this);
        return true;
    };
    
    templateModuleLoader.prototype.loaded = function () {
        this.__loading--;
        
        if (this.__loading === 0 && this.callback) {
            this.success(this.template);
        }
    };
    
    templateModuleLoader.prototype.failed = function (event) {
        this.__loading = 0;
        
        throw "Error loading script at " + event.target.src;
    };
    
    templateModuleLoader.prototype.addModuleScript = function(forModule) {        
        
        var node = document.createElement('script');
        node.type = 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;
        
        node.addEventListener('load', this.loaded.bind(this), false);
        node.addEventListener('error', this.failed.bind(this), false);
        
        node.src = wipeout.settings.convertModuleToUrl(forModule);  //TODO: getId part
        document.body.appendChild(node);
    };
    
    return templateModuleLoader;
});