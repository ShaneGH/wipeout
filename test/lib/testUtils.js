window.testUtils = window.testUtils || {};

window.asyncAssert = function(callback, context) {
    stop();
    setTimeout(function() {
        callback.call(context);
        start();
    }, 50);
};

window.enumerateArr = wipeout.utils.obj.enumerateArr;

window.testApp = wo.content.extend(function testApp() {this._super.apply(this, arguments); });
window.integrationTestSetup = function () {
	window.$fixture = $("#qunit-fixture");
	$fixture.html("<div data-wo-el='testApp' model='busybody.makeObservable()' application='true'></div>");
	wo(null, $fixture.children()[0]);
	window.application = wipeout.utils.viewModels.getViewModel(window.node = $fixture[0].firstChild);
	application.application = true;

	window.views = {};
};
	
window.clearIntegrationStuff = function() {
	var node = application.$domRoot.openingTag;
	application.$domRoot.dispose();
	node.wipeoutOpening = {dispose: function (){}}
};

window.integrationTestTeardown = function () {
	delete window.views;
	node.wipeoutOpening.dispose();
	$fixture.html("");
	delete window.$fixture;
	delete window.node;
	delete window.application;
};

$.extend(testUtils, (function() {
    
    var cached = [];
    var classMock = function () { this.mocks = []; cached.push(this); };
    classMock.reset = function() {
        for(var i = 0, ii = cached.length; i < ii; i++) {
            cached[i].reset();
        }
    };
 
    classMock.prototype.mock = function(className, newValue /*optional*/, expected /*optional*/) {
 
        newValue = newValue || function(){};
 
        className = className.split(".");
        var current = window;
        for (var i = 0, ii = className.length - 1; i < ii; i++) {
            current = current[className[i]] = (current[className[i]] || {});
        }
 
        var mock = {
			ns: current, 
			name: className[i], 
			oldVal: current.hasOwnProperty(className[i]) ? current[className[i]] : deleteMe, 
			expected: expected, 
			actual: 0
		};
        this.mocks.push(mock);
        if(newValue == null || newValue.constructor === Function)        
            current[className[i]] = function() {
                mock.actual++;

                // return so that both methods and constructors can be mocked
                return newValue.apply(this, arguments);
            };
        else
            current[className[i]] = newValue;
 
        return current[className[i]];
    };
 
	var deleteMe;
    classMock.prototype.reset = function() {
        for(var i = 0, ii = this.mocks.length; i < ii; i++) {
            if(this.mocks[i].expected != null) {
                strictEqual(this.mocks[i].actual, this.mocks[i].expected, "Constructor not called the correct number of times");
            }
 
			if (this.mocks[i].oldVal === deleteMe)
				delete this.mocks[i].ns[this.mocks[i].name];
			else
            	this.mocks[i].ns[this.mocks[i].name] = this.mocks[i].oldVal;
        }
 
        this.mocks.length = 0;
    };
 
    var methodMock = function () { this.calls = []; };
 
    methodMock.prototype.customMethod = function (evaluatorFunction, name /* optional */) {
        evaluatorFunction = evaluatorFunction || function() { };
        var output = function () {
            output.__called = true;
            return evaluatorFunction.apply(this, arguments);
        };
 
        this.calls.push({ name: name, method: output });
 
        return output;
    };
 
    methodMock.prototype.dynamicMethod = function (expectedArguments, returnValue /* optional */, name /* optional */) {
        name = name || "unnamed";
 
        return this.customMethod(function () {
            var expected = expectedArguments();
            if(expected)
                for (var i = 0, ii = arguments.length; i < ii; i++) {
                    strictEqual(expected[i], arguments[i], "Argument " + i + " of method \"" + name + "\" was invalid.");
                }
 
            return returnValue ? returnValue() : returnValue;        
        }, name);
    };
 
    methodMock.prototype.method = function (expectedArguments, returnValue /* optional */, name /* optional */) {
        return this.dynamicMethod(function () { return expectedArguments; }, function () { return returnValue; }, name);
    };
 
    methodMock.prototype.verifyAllExpectations = function () {
        for (var i = 0, ii = this.calls.length; i < ii; i++) {
            ok(this.calls[i].method.__called, "Method \"" + this.calls[i].name + "\" was not called.");
        }
    };
 
    var testWithUtils = function(method, description, isStatic, testLogic) {
        
        var methods = new methodMock();
        var classes = new classMock();
        test(method + (description ? (", " + description) : ""), function() {
            try {
                var subject = {};                
                var testSubject = testUtils.currentModule;
                if(method.toLowerCase() !== "constructor") {
                    if(!isStatic) {
                        testSubject += ".prototype";
                    }

                    testSubject += "." + method;
                }
                
                testSubject = wipeout.utils.obj.getObject(testSubject);
                function invoker() {                    
                    return testSubject.apply(subject, arguments);                   
                };
                
                testLogic(methods, classes, subject, invoker);    
                methods.verifyAllExpectations();
            } finally {
                classes.reset();
            }
        });
    };
    
    function html(html, appendFunction /*optional*/) {
        var $html = $(html);
        if(appendFunction)
            appendFunction($html.toArray());
        else {
            $("#qunit-fixture").empty();
            $("#qunit-fixture").append($html);
        }
        
        var ids = {};
        $html.filter("[id]").add($("[id]", $html)).each(function() {
            ids[this.id] = this;
        });
        
        return ids;
    }
    
    QUnit.moduleStart(function( details ) {
      testUtils.currentModule = details.name;
    });
    
    return {
        html: html,
        testWithUtils: testWithUtils,
        classMock: classMock,
        methodMock: methodMock,
		allHtmlTags: ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "head", "header", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "map", "mark", "menu", "meta", "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]
    };

})());