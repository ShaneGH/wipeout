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
    
    function s (template){
        this.modules = [];
        
        var mod;
        // find blank lines or lines beginning with ~. ~ can be escaped with ~~
        //TODM
        while (mod = /(^\s+)|(^\s*~(?!~).*)/.exec(template)) {
            template = template.substr(mod[0].length + 1);
            if (/^\s*$/.test(mod[0]))
                continue;
            
            this.modules.push(mod[0].replace(/^\s*~\s*/, "").replace(/\s+$/, "").replace(/\./g, "/"));
        }
        
        this.template = template;}