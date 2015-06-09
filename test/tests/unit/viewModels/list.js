module("wipeout.viewModels.list", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("constructor", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var templateId = {}, itemTemplateId = {}, model = {};
    subject._super = methods.method([templateId, model]);
    subject.observe =function(){/*tested in next test*/};
    
    classes.mock("wipeout.viewModels.content.createTemplatePropertyFor", function () {
        methods.method([subject, "itemTemplateId", "itemTemplate"])(arguments[0], arguments[1], arguments[2]);
    }, 1);
	
    subject.registerDisposable = methods.method();
    
    subject._removeItem = {};
    subject.registerRoutedEvent = methods.method([wipeout.viewModels.list.removeItem, subject._removeItem, subject]);
    
    // act
    invoker(templateId, itemTemplateId, model);
    
    // assert
    strictEqual(subject.itemTemplateId, itemTemplateId);
    strictEqual(subject.items.constructor, busybody.array);
});

testUtils.testWithUtils("onIntialized", "item template change", false, function(methods, classes, subject, invoker) {
    // arrange
	subject = new wipeout.viewModels.list();
    subject.onInitialized();
	var template = wipeout.viewModels.content.createAnonymousTemplate("hello"), 
        vm1 = {synchronusTemplateChange: stc}, 
        vm2 = {__createdBylist: true, synchronusTemplateChange: stc};
    
	subject.getItemViewModels = function () { return [vm1, vm2]; };
    
    function stc (templateId) { this.templateId = templateId; }
	
	// assert
	subject.observe("itemTemplateId", function () {
		setTimeout(function () {
			strictEqual(vm1.templateId, undefined);
			strictEqual(vm2.templateId, template);
			start();
		});
	});
	
	subject.itemTemplateId = template;
	stop();
});

testUtils.testWithUtils("_removeItem", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var e = {data:{}};
    subject.items = {
        indexOf: methods.method([e.data], 1)
    };
    subject.removeItem = methods.method([e.data], 1);
    
    // act
    invoker(e);
    
    // assert
    ok(e.handled);
});

testUtils.testWithUtils("removeItem", "", false, function(methods, classes, subject, invoker) {
    // arrange    
    var data = {};
    subject.items = new wo.array([data]);
    
    // act
    invoker(data);
    
    // assert
    strictEqual(subject.items.length, 0)
});

testUtils.testWithUtils("removedItem", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var item = new busybody.disposable();
    item.dispose = methods.method();
    subject.onItemRemoved = methods.method([item]);
    
    // act
    invoker(item);
    
    // assert
});   

testUtils.testWithUtils("_createItem", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var model = {};
    var expected = {
        __woBag: {}
    };
    subject.createItem = methods.method([model], expected);
    
    // act
    var actual = invoker(model);
    
    // assert
    strictEqual(actual, expected);
});

testUtils.testWithUtils("createItem", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var itemTemplateId = {};
    var model = {};
    subject.itemTemplateId = itemTemplateId;
    
    // act
    var actual = invoker(model);
    
    // assert
    ok(actual instanceof wipeout.viewModels.view);
    strictEqual(actual.model, model);
    strictEqual(actual.templateId, itemTemplateId);
});