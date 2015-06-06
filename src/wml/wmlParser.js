
//http://www.w3.org/TR/html-markup/syntax.html
Class("wipeout.wml.wmlParser", function () {  
    
    // tags which cannot go into a <div /> tag, along with the tag they should go into
    wmlParser.specialTags = {
        area: "map",
        base: "head",
        basefont: "head",
        body: "html",
        caption: "table",
        col: "colgroup",
        colgroup: "table",
        command : "menu",
        frame: "frameset",
        frameset: "html",
        head: "html",
        keygen: "form",
        li: "ul",
        optgroup: "select",
        option: "select",
        rp: "rt",
        rt: "ruby",
        source: "audio",
        tbody: "table",
        td: "tr",
        tfoot: "table",
        th: "tr",
        thead: "table",
        tr: "tbody"
    };
    
    // tags which, if the root, wipeout will refuse to create
    wmlParser.cannotCreateTags = {
        html:true,
        basefont: true,
        base: true,
        body: true,
        frame: true,
        frameset: true,
        head: true
    };
    
    // tags which are readonly once created in IE
    wmlParser.ieReadonlyElements = {
        audio: true,
        col: true, 
        colgroup: true,
        frameset: true,
        head: true,
        rp: true,
        rt: true,
        ruby: true,
        select: true,
        style: true,
        table: true,
        tbody: true,
        tfooy: true,
        thead: true,
        title: true,
        tr: true
    };
    
	// not needed right now
    // firefox replaces some tags with others
    //wmlParser.replaceTags = {
    //    keygen: "select"
    //};
	
    wmlParser.getFirstTagName = function(htmlContent) {
        ///<summary>Get the tag name of the first element in the string</summary>
        ///<param name="htmlContent" type="String">A string of html</param>
        ///<returns type="String">The name of the first tag</returns>
        
        var result = /^\s*<\s*[a-z\-\.0-9\$]+(\s|>|\/)/.exec(
			htmlContent.replace(/<\!--[^>]*-->/g, "").replace(/^\s*/, ""));
		
		return result ?
			trim(result[0].substr(1, result[0].length - 2)) :
			null;
    };
	
	var test = document.createElement("table");
	test.innerHTML = "<tbody></tbody>";
	var ie = !test.childNodes.length;
	
	wmlParser.addToElement = function(htmlString) {
        ///<summary>Add the html string to a html element and return it</summary>
        ///<param name="htmlString" type="String">A string of html</param>
        ///<returns type="HTMLElement">The element</returns>
				
		var childTag = wmlParser.getFirstTagName(htmlString);
		if (!childTag) {
			var parent = document.createElement("div");
			parent.innerHTML = htmlString
			return parent;
		}
        
        if(wmlParser.cannotCreateTags[childTag]) throw "Cannot create an instance of the \"" + childTag + "\" tag.";
        
        var parentTagName = wmlParser.specialTags[childTag] || "div";
        
        // the innerHTML for some tags is readonly in IE
        if (ie && wmlParser.ieReadonlyElements[parentTagName]) {
            var tmp = wmlParser.createElement("<" + parentTagName + ">" + htmlString + "</" + parentTagName + ">");
			for(var i = 0, ii = tmp.childNodes.length; i < ii; i++) {
				var child = tmp.childNodes[i];
				if (child.nodeType === 1 && trimToLower(child.tagName) === parentTagName) {
					return child;
				}
			}
			
			return document.createElement(parentTagName);
		}
            
        var parent = document.createElement(parentTagName);
        parent.innerHTML = htmlString;
		return parent;
	};
    
	var inline = ["area", "base", "br", "col", "command", "hr", "img", "input", "keygen", "link", "meta", "param", "source"];		
	function parse (htmlElement) {
		var name  = htmlElement.getAttribute("wo-el") || htmlElement.getAttribute("data-wo-el") || htmlElement.localName;
		var tmp, output = new wipeout.wml.wmlElement(name, inline.indexOf(name) !== -1);
		for (var i = 0, ii = htmlElement.childNodes.length; i < ii; i++) {
			if (htmlElement.childNodes[i].nodeType === 1)
				output.push(parse(htmlElement.childNodes[i]));
			else if (htmlElement.childNodes[i].nodeType === 8)
				output.push(new wipeout.wml.wmlComment(htmlElement.childNodes[i].textContent));
			else if (htmlElement.childNodes[i].nodeType === 3)
				output.push(new wipeout.wml.wmlString(htmlElement.childNodes[i].textContent));
			else {
				// case should not arise
				tmp = document.createElement("div");
				tmp.appendChild(htmlElement.childNodes[i]);
				output.push(new wipeout.wml.wmlString(tmp.innerHTML));
			}
		}

		for (var i = 0, ii = htmlElement.attributes.length; i < ii; i++)
			if (!/^(data\-)?wo\-el$/.test(htmlElement.attributes[i].name))
				output.attributes[htmlElement.attributes[i].name] = new wipeout.wml.wmlAttribute(htmlElement.attributes[i].value, output);

		return output;
	};
	
    function wmlParser(wmlString) {
        ///<summary>Parse a string to wml</summary>
        ///<param name="wmlString" type="String|Element">The value to parse</param>
        ///<returns type="wipeout.wml.wmlElement">The element</returns>
		
		if (wmlString instanceof Element)
			return parse(wmlString);
		
		var tag = wmlParser.addToElement(wmlString);
		if (!tag)
			throw "Cannot create a template for the following string: " + wmlString;
		
		return parse(tag);
    }
    
    return wmlParser;
});