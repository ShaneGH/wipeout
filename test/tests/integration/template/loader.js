module("integration: wipeout.template.loader", {
    setup: function() {
    },
    teardown: function() {
    }
});

test("success", function() {
        
	// arrange
    var classes = new testUtils.classMock(), template = {}, name = "KJBJKBKJB", methods = new testUtils.methodMock();
    classes.mock("wipeout.utils.obj.ajax", function (input) {
		strictEqual(input.type, "GET");
		strictEqual(input.url, name);
		
        setTimeout(function() {
            input.success({responseText: template});
			subject.add(methods.method([template]));
			
			methods.verifyAllExpectations();
			classes.reset();
			start();
        });
    }, 1);
    
    classes.mock("wipeout.template.templateModuleLoader", function (input1, input2) {
        strictEqual(input1, template);
        input2(template);
        
        this.load = methods.method([]);
    }, 1);
    
	// act
	// assert
	var subject = new wipeout.template.loader(name);
	subject.add(methods.method([template]));
	subject.add(function () { ok(false) }).cancel();
	stop();
});

test("failure", function() {
        
	// arrange 
    var classes = new testUtils.classMock(), template = {}, name = "KJBJKBKJB", methods = new testUtils.methodMock();
    classes.mock("wipeout.utils.obj.ajax", function (input) {
		
        setTimeout(function() {
			throws(function () {
            	input.error();
			});
			
			throws(function () {
            	subject.add(function(){});
			});
			
			start();
        });
    }, 1);
	
	// act
	// assert
	var subject = new wipeout.template.loader(name);
	stop();
});