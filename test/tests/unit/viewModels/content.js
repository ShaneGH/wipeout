module("wipeout.viewModels.content", {
    setup: function() {
    },
    teardown: function() {
    }
});

var content = wipeout.viewModels.content;

testUtils.testWithUtils("constructor", "and all functionality", false, function(methods, classes, subject, invoker) {
    // arrange
    var template = {}, templateId = {}, model = {};
    subject._super = methods.method([templateId, model]);
    subject.templateId = {};
    classes.mock("wipeout.viewModels.content.createTemplatePropertyFor", function() {
        methods.method([subject, "templateId", "template"])(arguments[0], arguments[1]);
        return template;
    }, 1);
    
    // act
    // assert
    invoker(templateId, model);
});

testUtils.testWithUtils("createTemplatePropertyFor", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var templateValue = "Hi";
    var owner = new wipeout.viewModels.view();
    content.createTemplatePropertyFor(owner, "testTemplateId", "testTemplate");
    
    // act
    var t1 = owner.testTemplateId = content.createAnonymousTemplate(templateValue);
	    
    // assert
	var xx = owner.observe("testTemplate", function () {
		xx.dispose();
        strictEqual(wipeout.template.engine.instance.templates[t1].xml, owner.testTemplate);
        strictEqual(owner.testTemplate.serializeContent(), "Hi");
		
		owner.testTemplate = "Bye";
		xx = owner.observe("testTemplateId", function () {
			xx.dispose();
            ok(t1 != owner.testTemplateId);
        
            owner.testTemplateId = t1;
			xx = owner.observe("testTemplate", function () {
				xx.dispose();
        		strictEqual(owner.testTemplate.serializeContent(), "Hi");
				owner.dispose();
				start();
            });
        });
    });
	
	stop();
});

testUtils.testWithUtils("createTemplatePropertyFor", "disposal, dependant on \"createTemplatePropertyFor\" passing", true, function(methods, classes, subject, invoker) {
    // arrange
    var owner = new wipeout.viewModels.view();
    content.createTemplatePropertyFor(owner, "testTemplateId", "testTemplate").dispose();
    
    // act
    owner.testTemplateId = content.createAnonymousTemplate("Hello");
    
    // assert
	owner.observe("testTemplate", function () {
		ok(false);
	});
	
	setTimeout(function () {
		strictEqual(owner.testTemplate.serializeContent(), "");
		start();
	}, 50);
	
	stop();
});

testUtils.testWithUtils("createAnonymousTemplate", "Using string", true, function(methods, classes, subject, invoker) {
    // arrange
    var val = "LKJBLKJBKJBLKJBKJBKJB";
        
    // act
    var result1 = invoker(val);
    var result2 = invoker(val);
    
    // assert
    strictEqual(result1, result2);
    strictEqual(wipeout.template.engine.instance.templates[result1].xml.serializeContent(), val);
});

testUtils.testWithUtils("createAnonymousTemplate", "Using xml", true, function(methods, classes, subject, invoker) {
    // arrange
    var val = wipeout.wml.wmlParser("<div></div>");
        
    // act
    var result1 = invoker(val);
    var result2 = invoker(val);
    
    // assert
    strictEqual(result1, result2);
    strictEqual(wipeout.template.engine.instance.templates[result1].xml, val);
    strictEqual(result1, val["wipeout-anonymous-template"]);
});