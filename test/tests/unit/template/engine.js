module("wipeout.template.engine", {
    setup: function() {
    },
    teardown: function() {
    }
});

var engine = wipeout.template.engine;

testUtils.testWithUtils("constructor", "with prototype, instance and static vals", false, function(methods, classes, subject, invoker) {
    // arrange
    // act - smoke test (no logic)
    invoker();
    
    //assert
    strictEqual(engine.prototype.constructor, ko.templateEngine);
    strictEqual(engine.scriptCache.constructor, Object);
    ok(engine.openCodeTag);
    ok(engine.closeCodeTag);
    ok(engine.instance.constructor);
});


testUtils.testWithUtils("scriptHasBeenReWritten", "", false, function(methods, classes, subject, invoker) {
    // arrange
    // act    
    //assert
    ok(engine.scriptHasBeenReWritten.test(engine.openCodeTag + "32423432" + engine.closeCodeTag));
    ok(!engine.scriptHasBeenReWritten.test("435435"));
    ok(!engine.scriptHasBeenReWritten.test("asdsd"));
    ok(!engine.scriptHasBeenReWritten.test(engine.openCodeTag + "3242s3432" + engine.closeCodeTag));
});

testUtils.testWithUtils("createJavaScriptEvaluatorFunction", "with bindingContext", true, function(methods, classes, subject, invoker) {
    // arrange    
    var val = {};
    
    // act    
    var actual = invoker("something")({something: val, $data:{}});
    
    //assert
    strictEqual(actual, val);
});

testUtils.testWithUtils("createJavaScriptEvaluatorFunction", "with bindingContext.$data", true, function(methods, classes, subject, invoker) {
    // arrange    
    var val = {};
    
    // act    
    var actual = invoker("something")({something: {}, $data:{something: val}});
    
    //assert
    strictEqual(actual, val);
});

testUtils.testWithUtils("createJavaScriptEvaluatorBlock", "Function", true, function(methods, classes, subject, invoker) {
    // arrange
    var id = "KJBKJBKJB";
    classes.mock("wipeout.template.engine.newScriptId", function() { return id; }, 1);
    function script() { }
    
    // act    
    var actual = invoker(script);
    
    //assert
    strictEqual(actual, engine.openCodeTag + id + engine.closeCodeTag);
    strictEqual(script, engine.scriptCache[id]);
});

testUtils.testWithUtils("createJavaScriptEvaluatorBlock", "String", true, function(methods, classes, subject, invoker) {
    // arrange
    var id = "KJBKJBKJB";
    classes.mock("wipeout.template.engine.newScriptId", function() { return id; }, 1);
    var val = {Hello: {}, $data: {}};
    
    // act    
    var actual = invoker("Hello");
    
    //assert
    strictEqual(actual, engine.openCodeTag + id + engine.closeCodeTag);
    strictEqual(val.Hello, engine.scriptCache[id](val));
});

testUtils.testWithUtils("createJavaScriptEvaluatorBlock", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var script = {};
    var expected = {};
    classes.mock("wipeout.template.engine.createJavaScriptEvaluatorBlock", function() { 
        strictEqual(arguments[0], script);
        return expected;
    }, 1);
    
    // act    
    var actual = invoker(script);
    
    //assert
    strictEqual(actual, expected);
});

testUtils.testWithUtils("rewriteTemplate", "script is not HTMLElement", false, function(methods, classes, subject, invoker) {
    // arrange
    var arg1 = {}, arg2 = {},arg3 = {};
    classes.mock("ko.templateEngine.prototype.rewriteTemplate", function() {
        methods.method([arg1, arg2, arg3]).apply(null, arguments);
    });
    
    // act    
    invoker(arg1, arg2, arg3);
    
    //assert
});

testUtils.testWithUtils("rewriteTemplate", "is HTMLElement, script has been reWritten", false, function(methods, classes, subject, invoker) {
    // arrange
    var id = "LKJBGKJBKJBKJ", arg2 = {}, arg3 = {};
    var content = engine.openCodeTag + 123 + engine.closeCodeTag;
    $("#qunit-fixture").html("<script id='" + id + "'>" + content + "</script>");
    subject.makeTemplateSource = methods.method([id, arg3], {
        data: methods.method(["isRewritten", true])
    });
    
    subject.wipeoutRewrite = methods.method([$("#" + id)[0], arg2]);
    
    // act
    invoker(id, arg2, arg3);
    
    //assert
});

testUtils.testWithUtils("wipeoutRewrite", "html only", true, function(methods, classes, subject, invoker) {
    // arrange
    var data = "<div><span data-bind=\"html: xxx\"/></div>";
    var element = wipeout.template.templateParser(data, "application/xml")[0];
    
    // act    
    invoker(element);
    
    //assert
    strictEqual(element.name, "div");
    strictEqual(element.length, 1);
    strictEqual(element[0].name, "span");
    strictEqual(element[0].length, 0);
    strictEqual(element[0].attributes["data-bind"].value, "html: xxx");
});

testUtils.testWithUtils("wipeoutRewrite", "custom tag", true, function(methods, classes, subject, invoker) {
    // arrange
    window.my = {
        tag: wo.view.extend(function() { 
            this._super();
            this._initialize = methods.method([configTag, bindingContext]);
        })
    };
    
    var bindingContext = {};
    var element = wipeout.template.templateParser("<div><my.tag id='hello'/></div>", "application/xml")[0];
    var configTag = element.firstElementChild;
        
    // act    
    invoker(element, function(){ return arguments[0]; });
    var data = element.serialize().substring("<div><!-- ko wipeout-type: 'my.tag', wo: ".length);
    data = new Function("return " + data.substring(0, data.length - " --><!-- /ko --></div>".length))();
    
    // assert
    strictEqual(engine.xmlCache[data.initXml].name, "my.tag");
    strictEqual(engine.xmlCache[data.initXml].attributes["id"].value, "hello");
    strictEqual(data.type, window.my.tag);
    strictEqual(data.id, "hello");
    
    delete window.my;
}); 

testUtils.testWithUtils("wipeoutRewrite", "invalid xml", false, function(methods, classes, subject, invoker) {
    // arrange    
    // act    
    //assert
    throws(function() {
        invoker({text:"<ASDASDASD>"});
    });
    
});

testUtils.testWithUtils("wipeoutRewrite", "element and comment", false, function(methods, classes, subject, invoker) {
    // arrange
    var html = "<div/><!-- hello -->";
    var input = {text:html};
    var rewriter = {};
    classes.mock("wipeout.template.engine.wipeoutRewrite", function() {
        strictEqual(arguments[0].name, "div");
        strictEqual(arguments[0].length, 0);
        strictEqual(arguments[1], rewriter);
        return arguments[0];
    });
    
    // act  
    invoker(input, rewriter);
    
    //assert
    ok(/^<div\s*\/><!-- hello -->$/.test(input.text));
});

testUtils.testWithUtils("renderTemplateSource", "not wo.view", false, function(methods, classes, subject, invoker) {
    // arrange
    
    // act    
    var actual = invoker(null, {});
    
    //assert
    strictEqual(actual.constructor, Array);
    strictEqual(actual.length, 0);
});

testUtils.testWithUtils("renderTemplateSource", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var text = {};
    var expected = {};
    var htmlBuilder;
    var bindingContext = {$data: new wo.view()};
    classes.mock("wipeout.template.htmlBuilder", function() {
        htmlBuilder = this;
        strictEqual(arguments[0], text);
        this.render = methods.method([bindingContext], expected);
    });
    
    var templateSource = {
        data: methods.customMethod(function() {
            strictEqual(arguments[0], "precompiled");
            if(arguments.length > 1)
                strictEqual(arguments[1], htmlBuilder);
            
            return null;
        }),
        text: function() {
            return text;
        }
    };
    
    // act    
    var actual = invoker(templateSource, bindingContext);
    
    //assert
    strictEqual(actual, expected);
});

testUtils.testWithUtils("newScriptId", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var base = parseInt(invoker());
    
    // act        
    //assert
    strictEqual(parseInt(invoker()), base + 1);
    strictEqual(parseInt(invoker()), base + 2);
    strictEqual(parseInt(invoker()), base + 3);
    strictEqual(parseInt(invoker()), base + 4);
    strictEqual(parseInt(invoker()), base + 5);
});