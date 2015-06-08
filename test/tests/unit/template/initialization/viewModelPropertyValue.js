
module("wipeout.template.initialization.viewModelPropertyValue", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("onPropertyChanged", "no val", false, function(methods, classes, subject, invoker) {
    // arrange
	subject.propertyOwner = {aaa:{}};
	subject.name = "aaa";
	var obs = {}, cb = methods.method([undefined, subject.propertyOwner.aaa]);
	subject.primed = methods.method();
	subject._caching = [];
    classes.mock("busybody.tryObserve", function () {
		methods.method([subject.propertyOwner, subject.name, cb]).apply(null, arguments);
		return obs;
	});
	
	// act
    // assert
    ok(invoker(cb, true));
});


	
function ss (property, value, callback) {
		
		this.primed();
        
        var prop = new wipeout.template.initialization.viewModelPropertyValue(property, new wipeout.wml.wmlAttribute(value));
        this._caching.push.apply(this._caching, prop.prime(this.propertyOwner, this.renderContext, callback));
	};

testUtils.testWithUtils("useAnotherProperty", null, false, function(methods, classes, subject, invoker) {
    // arrange
    subject.primed = methods.method();
    subject._caching = [];
    subject.propertyOwner = {};
    subject.renderContext = {};
    var mPropDisposable = {};
    
    // act
    invoker("theName", "$model.value", methods.customMethod(function (mProp) {
        mProp._caching.push(mPropDisposable);
        strictEqual(mProp.renderContext, subject.renderContext);
        strictEqual(mProp.propertyOwner, subject.propertyOwner);
    }));
    
    // assert
    strictEqual(subject._caching.length, 1);
    strictEqual(subject._caching[0], mPropDisposable);
});