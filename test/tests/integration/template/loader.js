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
        
        setTimeout(function () {
            strictEqual(input.type, "GET");
            strictEqual(input.url, name);

            input.success({responseText: template});
            throws(function () {
                input.error();
            });
            
            methods.verifyAllExpectations();
            classes.reset();
            start();
        });
    }, 1);
    
	// act
	// assert
	var subject = new wipeout.template.loader(name);
    subject.addCallback(methods.method([template]));
    stop();
});