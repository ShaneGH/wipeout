Class("wipeout.utils.viewModels", function () { 
	
	function viewModels () {}

	var realName1 = "wo-el", realName2 = "data-wo-el";
	viewModels.getElementName = function (wmlElement) {
        ///<summary>Get the actual name of an element. The actual name is either the "data-wo-element-name" attribute or the element name</summary>
        ///<param name="wmlElement" type="wipeout.wml.wmlElement">The key</param>
        ///<returns type="String">The name</returns>

		name = wmlElement instanceof Element ?
			(wmlElement.getAttribute(realName1) || wmlElement.getAttribute(realName2) || camelCase(wmlElement.localName)) :
			camelCase(trim(wmlElement.name));
		
		return /^js[A-Z]/.test(name) ? name.substr(2) : name;
	};
	
	viewModels.getViewModel = function (htmlNode, includeNoScopeItems, endAt) {
        ///<summary>Get the view model which rendered this node (if any)</summary>
        ///<param name="htmlNode" type="Element">The node</param>
        ///<param name="includeNoScopeItems" type="Boolean" optional="true">Default: false. If false, will ignore view models with shareParentScope == true</param>
        ///<param name="endAt" type="Element" optional="true">An element which definitely has not view model, meaning all parent elements will also not have a view model.</param>
        ///<returns type="Object">The view model</returns>
		
		if (!htmlNode || htmlNode === endAt)
			return;
		
        var vm;
		if (htmlNode.wipeoutOpening)
			vm = htmlNode.wipeoutOpening.viewModel;
		else if (htmlNode.wipeoutClosing)
			vm = htmlNode.wipeoutClosing.viewModel;
        
        if (vm) {
            if (includeNoScopeItems || !vm.shareParentScope)
                return vm;
            
            // shortcut if available
            if (vm.$domRoot && vm.$domRoot.renderContext)
                return vm.$domRoot.renderContext.$this;
        }
		
		var ps = htmlNode.previousSibling;
		if (ps && ps.wipeoutClosing)
			ps = ps.wipeoutClosing.openingTag.previousSibling || htmlNode.parentNode;
				
		return viewModels.getViewModel(ps, endAt);
	};
	
	viewModels.getViewModelConstructor = function (wmlElement) {
        ///<summary>A constructor for a view model (if any) given a specific element</summary>
        ///<param name="wmlElement" type="wipeout.wml.wmlElement">The element</param>
        ///<returns type="Boolean">Success</returns>

		var constr, name = viewModels.getElementName(wmlElement);

		if (!viewModels.definitelyNotAViewModel[name] && (constr = wipeout.utils.obj.getObject(name)))
			return {
				name: name,
				constructor: constr
			};
	};
    
    viewModels.definitelyNotAViewModel = {
        "a": true,
        "abbr": true,
        "acronym": true,
        "address": true,
        "applet": true,
        "area": true,
        "article": true,
        "aside": true,
        "audio": true,
        "b": true,
        "base": true,
        "basefont": true,
        "bdi": true,
        "bdo": true,
        "big": true,
        "blockquote": true,
        "body": true,
        "br": true,
        "button": true,
        "canvas": true,
        "caption": true,
        "center": true,
        "cite": true,
        "code": true,
        "col": true,
        "colgroup": true,
        "command": true,
        "datalist": true,
        "dd": true,
        "del": true,
        "details": true,
        "dfn": true,
        "dir": true,
        "div": true,
        "dl": true,
        "dt": true,
        "em": true,
        "embed": true,
        "fieldset": true,
        "figcaption": true,
        "figure": true,
        "font": true,
        "footer": true,
        "form": true,
        "frame": true,
        "frameset": true,
        "h1": true,
        "h2": true,
        "h3": true,
        "h4": true,
        "h5": true,
        "h6": true,
        "head": true,
        "header": true,
        "hgroup": true,
        "hr": true,
        "html": true,
        "i": true,
        "iframe": true,
        "img": true,
        "input": true,
        "ins": true,
        "kbd": true,
        "keygen": true,
        "label": true,
        "legend": true,
        "li": true,
        "link": true,
        "map": true,
        "mark": true,
        "menu": true,
        "meta": true,
        "meter": true,
        "nav": true,
        "noframes": true,
        "noscript": true,
        "object": true,
        "ol": true,
        "optgroup": true,
        "option": true,
        "output": true,
        "p": true,
        "param": true,
        "pre": true,
        "progress": true,
        "q": true,
        "rp": true,
        "rt": true,
        "ruby": true,
        "s": true,
        "samp": true,
        "script": true,
        "section": true,
        "select": true,
        "small": true,
        "source": true,
        "span": true,
        "strike": true,
        "strong": true,
        "style": true,
        "sub": true,
        "summary": true,
        "sup": true,
        "table": true,
        "tbody": true,
        "td": true,
        "textarea": true,
        "tfoot": true,
        "th": true,
        "thead": true,
        "time": true,
        "title": true,
        "tr": true,
        "track": true,
        "tt": true,
        "u": true,
        "ul": true,
        "var": true,
        "video": true,
        "wbr": true
    };
	
	return viewModels;
});