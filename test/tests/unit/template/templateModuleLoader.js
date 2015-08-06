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
});