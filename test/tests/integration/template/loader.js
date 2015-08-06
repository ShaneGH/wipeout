module("integration: wipeout.template.loader", {
    setup: function() {
    },
    teardown: function() {
    }
});

test("constructor", function() {
        
	// arrange
    var classes = new testUtils.classMock(), template = {}, name = "KJBJKBKJB", methods = new testUtils.methodMock();
    classes.mock("wipeout.utils.obj.ajax", function (input) {
		strictEqual(input.type, "GET");
		strictEqual(input.url, name);
		
        input.success({responseText: template});
        throws(function () {
            input.error();
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
    methods.verifyAllExpectations();
    classes.reset();
});