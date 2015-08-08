module("wipeout.template.templateModuleLoader", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("getModules", "no modules", false, function(methods, classes, subject, invoker) {
    // arrange
    var template = "asdhaskdaskhdkjs";
    
	// act
	invoker(template);
	
    // assert
    strictEqual(subject.template, template);
});

testUtils.testWithUtils("getModules", "2 scripts one style", false, function(methods, classes, subject, invoker) {
    // arrange
    var mod1 = "dthdhdthd", mod2 = "aweaweawe", style = "iudsfjbsdf", template = "~ " + mod1 + "\n\
\n\
\n\
\~ MoDuLe: " + mod2 + "\n\
\~ StYle: " + style + "\n\
~~lksjdbflkjbfkj";
    
	// act
	invoker(template);
	
    // assert
    strictEqual(subject.template, "~lksjdbflkjbfkj");
    strictEqual(subject.modules.length, 2);
    strictEqual(subject.modules[0], mod1);
    strictEqual(subject.modules[1], mod2);
    strictEqual(subject.styles.length, 1);
    strictEqual(subject.styles[0], style);
});

testUtils.testWithUtils("getModules", "2 modules", false, function(methods, classes, subject, invoker) {
    // arrange
    var mod1 = "dthdhdthd", mod2 = "aweaweawe", template = "~ " + mod1 + "\n\
\n\
\n\
\~" + mod2 + "\n\
~~lksjdbflkjbfkj";
    
	// act
	invoker(template);
	
    // assert
    strictEqual(subject.template, "~lksjdbflkjbfkj");
    strictEqual(subject.modules.length, 2);
    strictEqual(subject.modules[0], mod1);
    strictEqual(subject.modules[1], mod2);
});

testUtils.testWithUtils("moduleExists", "doesn't exist", true, function(methods, classes, subject, invoker) {
    // arrange
    var mod = {
        module: "asdsadas",
        url: "sadasdasd"
    };
    
	// act
    // assert
	ok(!invoker(mod));
});

testUtils.testWithUtils("moduleExists", "exists, via window object", true, function(methods, classes, subject, invoker) {
    // arrange
    window.asdsadas = true;
    var mod = {
        module: "asdsadas",
        url: "sadasdasd"
    };
    
	// act
    // assert
	ok(invoker(mod));
    
    delete window.asdsadas;
});

testUtils.testWithUtils("moduleExists", "exists, absolute url", true, function(methods, classes, subject, invoker) {
    // arrange
    try {
    $("#qunit-fixture").html("<script type=\"text/javascript\" src=\"" + location.protocol + "//" + location.host + "/myscript.js\"></script>");
    } catch (e) {}
    
    var mod = {
        module: "asdsadas",
        url: location.protocol + "//" + location.host + "/myscript.js"
    };
    
	// act
    // assert
	ok(invoker(mod));
});

testUtils.testWithUtils("moduleExists", "exists, relative url 1", true, function(methods, classes, subject, invoker) {
    // arrange
    try {
    $("#qunit-fixture").html("<script type=\"text/javascript\" src=\"/myscript.js\"></script>");
    } catch (e) {}
    
    var mod = {
        module: "asdsadas",
        url: location.protocol + "//" + location.host + "/myscript.js"
    };
    
	// act
    // assert
	ok(invoker(mod));
});

testUtils.testWithUtils("moduleExists", "exists, relative url 2", true, function(methods, classes, subject, invoker) {
    // arrange
    try {
    $("#qunit-fixture").html("<script type=\"text/javascript\" src=\"" + location.protocol + "//" + location.host + "/myscript.js\"></script>");
    } catch (e) {}
    
    var mod = {
        module: "asdsadas",
        url: "/myscript.js"
    };
    
	// act
    // assert
	ok(invoker(mod));
});

testUtils.testWithUtils("styleExists", "doesn't exist", true, function(methods, classes, subject, invoker) {
    // arrange
    var mod = {
        style: "asdsadas",
        url: "sadasdasd"
    };
    
	// act
    // assert
	ok(!invoker(mod));
});

testUtils.testWithUtils("styleExists", "exists, via style object", true, function(methods, classes, subject, invoker) {
    // arrange
    $("#qunit-fixture").html("<style>.asdsadas-ffgdfg { font-family: 'wipeout'; }</style>");
    var mod = {
        style: "asdsadas.ffgdfg",
        url: "sadasdasd"
    };
    
	// act
    // assert
    setTimeout(function () {
        ok(invoker(mod));
        start();
    }, 10);
    
    stop();
});

testUtils.testWithUtils("styleExists", "exists, absolute url", true, function(methods, classes, subject, invoker) {
    // arrange
    try {
    $("#qunit-fixture").html("<link rel=\"stylesheet\" type=\"text/css\" href=\"" + location.protocol + "//" + location.host + "/mystyle.css\" />");
    } catch (e) {}
    
    var mod = {
        style: "asdsadas",
        url: location.protocol + "//" + location.host + "/mystyle.css"
    };
    
	// act
    // assert
	ok(invoker(mod));
});

testUtils.testWithUtils("styleExists", "exists, relative url 1", true, function(methods, classes, subject, invoker) {
    // arrange
    try {
    $("#qunit-fixture").html("<link rel=\"stylesheet\" type=\"text/css\" href=\"/mystyle.css\" />");
    } catch (e) {}
    
    var mod = {
        style: "asdsadas",
        url: location.protocol + "//" + location.host + "/mystyle.css"
    };
    
	// act
    // assert
	ok(invoker(mod));
});

testUtils.testWithUtils("styleExists", "exists, relative url 2", true, function(methods, classes, subject, invoker) {
    // arrange
    try {
    $("#qunit-fixture").html("<<link rel=\"stylesheet\" type=\"text/css\" href=\"" + location.protocol + "//" + location.host + "/mystyle.css\" />");
    } catch (e) {}
    
    var mod = {
        style: "asdsadas",
        url: "/mystyle.css"
    };
    
	// act
    // assert
	ok(invoker(mod));
});