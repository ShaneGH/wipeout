module("integration: wipeout.base.asyncLoaderBase", {
    setup: function() {
    },
    teardown: function() {
    }
});

test("success", function() {
        
	// arrange
    var classes = new testUtils.classMock(), methods = new testUtils.methodMock(), input = {};
    
	// act
	// assert
	var subject = new wipeout.base.asyncLoaderBase(name);
	subject.addCallback(methods.method([input]));
	subject.addCallback(function () { ok(false) }).cancel();
    subject.success();
	subject.addCallback(methods.method([input]));
    
    methods.verifyAllExpectations();
    classes.reset();
});