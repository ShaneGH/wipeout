Class("wipeout.template.templateModuleLoader", function () {
    
    
    var templateModuleLoader = wipeout.base.asyncLoaderBase.extend(function templateModuleLoader (template) {
        ///<summary>Scans a template for required modules and loads them</summary>
        ///<param name="template" type="string" optional="false">The template</param>
        ///<param name="onComplete" type="Function" optional="true">A callback to invoke on complete</param>
		
        this._super();
        
        this.getModules(template);
        this.load();
    });
    
    templateModuleLoader.prototype.getModules = function(template) {
        this.modules = [];
        this.styles = [];
        
        var mod;
        // find blank lines or lines beginning with ~. ~ can be escaped with ~~
        //TODM
        while (mod = /(^\s+)|(^\s*~(?!~).*)/.exec(template)) {
            template = template.replace(mod[0], "");
            if (/^\s*$/.test(mod[0]))
                continue;
            
            var m = mod[0].replace(/^\s*~\s*(module\s*:\s*)?/i, "").replace(/\s+$/, "");
            if (/^style:/i.test(m)) {
                this.styles.push(m.replace(/^style:\s*/i, ""));
            } else {
                this.modules.push(m);
            }
        }
        
        this.template = template[0] === "~" && template[1] === "~" ? template.substr(1) : template;
    };
    
    templateModuleLoader.prototype.load = function() {
        ///<summary>Load the modules found in the template</summary>
        ///<returns type="Boolean">True if there are moudles to load, running asynchronusly. False otherwise, running synchronusly.</returns>
        
        if (this.__loading) return true;
        
        var styles = [], modules = [], mod;
        
        // add modules which are not already present
        for (var i = 0, ii = this.modules.length; i < ii; i++) {
            mod = {
                module: this.modules[i],
                url: wipeout.settings.convertModuleToUrl(this.modules[i])
            };
            
            if (!templateModuleLoader.moduleExists(mod))
                modules.push(mod);
        }
        
        // add styles which are not already present
        for (var i = 0, ii = this.styles.length; i < ii; i++) {
            mod = {
                style: this.styles[i],
                url: wipeout.settings.convertStyleToUrl(this.styles[i])
            };
            
            if (!templateModuleLoader.styleExists(mod))
                styles.push(mod);
        }
        
        if (!modules.length && !styles.length) {
            this.success(this.template);
            return false;
        }
        
        this.__loading = this.modules.length + this.styles.length;
        enumerateArr(modules, this.addModuleScript, this);
        enumerateArr(styles, this.addStylesheet, this);
        return true;
    };
    
    function toHttp (url) {
        return url.replace(/^https/i, "http");
    }
          
    //TODO: jquery 2.1.4 licence
    function getStyles(elem) {
		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		if (elem.ownerDocument.defaultView.opener) {
			return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
		}

		return window.getComputedStyle(elem, null);
	};
    
    var cachedStyleUrls = {};   //TODO: add to this on load new style
    var cachedStylesheets = {};   //TODO: add to this on load new style
    templateModuleLoader.styleExists = function (style) {
        
        if (cachedStylesheets[style.style]) {
            return true;
        }
        
        var tmp = document.createElement("a");
        tmp.href = style.url;
        var url = toHttp(tmp.href);
        if (cachedStyleUrls[url])
            return true;
        
        var test = document.createElement("div");
        document.body.appendChild(test);
        test.className = style.style.replace(/\./g, "-");
        if (/^\s*wipeout\s*$/i.test(getStyles(test).fontFamily)) { //TODM
            return cachedStylesheets[style.style] = true;
        }
        
        test.parentElement.removeChild(test);
        
        var styles = document.getElementsByTagName("link");
        for (var i = 0, ii = styles.length; i < ii; i++) {
            cachedStyleUrls[toHttp(styles[i].href)] = true;
            
            if (toHttp(styles[i].href) === url) return true;
        }
        
        return false;
    };
    
    var cachedScriptUrls = {};   //TODO: add to this on load new script
    templateModuleLoader.moduleExists = function (module) {
        if (wipeout.utils.obj.getObject(module.module))
            return true;
        
        var tmp = document.createElement("a");
        tmp.href = module.url;
        var url = toHttp(tmp.href);
        if (cachedScriptUrls[url])
            return true;
        
        var scripts = document.getElementsByTagName("script");
        for (var i = 0, ii = scripts.length; i < ii; i++) {
            cachedScriptUrls[toHttp(scripts[i].src)] = true;
            
            if (toHttp(scripts[i].src) === url) return true;
        }
        
        return false;
    };
    
    templateModuleLoader.prototype.loaded = function () {
        this.__loading--;
        
        if (this.__loading === 0) {
            this.success(this.template);
        }
    };
    
    templateModuleLoader.prototype.failed = function (event) {
        this.__loading = 0;
        
        throw "Error loading script at " + event.target.src;
    };
    
    templateModuleLoader.prototype.addModuleScript = function(forModule) {        
        
        var node = document.createElement("script");
        node.type = "text/javascript";
        node.async = true;
        
        node.addEventListener("load", this.loaded.bind(this), false);
        node.addEventListener("error", this.failed.bind(this), false);
        
        node.src = forModule.url;
        document.body.appendChild(node);
    };
    
    templateModuleLoader.prototype.addStylesheet = function(forStyle) {        
        
        var node = document.createElement("link");
        node.rel = "stylesheet";
        node.type = "text/css";
        
        node.addEventListener("load", this.loaded.bind(this), false);
        node.addEventListener("error", this.failed.bind(this), false);
        
        node.href = forStyle.url;
        document.body.appendChild(node);
    };
    
    return templateModuleLoader;
});