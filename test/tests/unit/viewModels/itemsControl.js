module("wipeout.viewModels.itemsControl", {
    setup: function() {
    },
    teardown: function() {
    }
});

var itemsControl = wipeout.viewModels.itemsControl;

testUtils.testWithUtils("constructor", "static constructor", false, function(methods, classes, subject, invoker) {
    // arrange
    var ex = {};
    subject._super = methods.customMethod(function() {
        // can't test content as it might or might not have been rewritten by now
        ok($("#" + arguments[0]).html());
        // exit, we are done
        throw ex;
    });
        
    // act
    try {
        invoker();
    } catch (e) {
        strictEqual(e, ex);
    }
    
    // assert
});

testUtils.testWithUtils("constructor", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var templateId = {}, itemTemplateId = {}, model = {};
    subject._super = methods.method([templateId, model]);
    classes.mock("wipeout.viewModels.contentControl.createTemplatePropertyFor", function () {
        methods.method([subject.itemTemplateId, subject])(arguments[0], arguments[1]);
    }, 1);
    
    var mock = wipeout.utils.ko.version()[0] < 3 ? "_subscribeV2" : "_subscribeV3";
    classes.mock("wipeout.viewModels.itemsControl." + mock, function() {
        strictEqual(this, subject);
    }, 1);
    
    subject._syncModelsAndViewModels = function(){};
    subject.registerDisposable = methods.method();
    
    subject._removeItem = {};
    subject.registerRoutedEvent = methods.method([wipeout.viewModels.itemsControl.removeItem, subject._removeItem, subject]);
    
    // act
    invoker(templateId, itemTemplateId, model);
    
    // assert
    strictEqual(subject.itemTemplateId(), itemTemplateId);
    ok(ko.isObservable(subject.itemSource));
    ok(ko.isObservable(subject.items));
});

testUtils.testWithUtils("_syncModelsAndViewModels", "null models", false, function(methods, classes, subject, invoker) {
    // arrange
    var m0 = {}, m1 = {};
    subject.itemSource = ko.observableArray(null);
    subject.itemSource.subscribe(methods.method());
    subject.items = ko.observableArray([{model: ko.observable(m0)}, {model: ko.observable(m1)}]);
    
    // act
    invoker();
    
    // assert
    strictEqual(subject.itemSource().length, 2);
    strictEqual(subject.itemSource()[0], m0);
    strictEqual(subject.itemSource()[1], m1);
});

testUtils.testWithUtils("_syncModelsAndViewModels", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var m0 = {}, m1 = {};
    subject.itemSource = ko.observableArray([{}, {}, {}, {}]);
    subject.itemSource.subscribe(methods.method());
    subject.items = ko.observableArray([{model: ko.observable(m0)}, {model: ko.observable(m1)}]);
    
    // act
    invoker();
    
    // assert
    strictEqual(subject.itemSource().length, 2);
    strictEqual(subject.itemSource()[0], m0);
    strictEqual(subject.itemSource()[1], m1);
});

testUtils.testWithUtils("_modelsAndViewModelsAreSynched", "different lengths", false, function(methods, classes, subject, invoker) {
    // arrange
    var m0 = {}, m1 = {};
    subject.itemSource = ko.observableArray([m0, m1, {}]);
    subject.items = ko.observableArray([{model: ko.observable(m0)}, {model: ko.observable(m1)}]);
    
    // act
    var actual = invoker();
    
    // assert
    ok(!actual);
});

testUtils.testWithUtils("_modelsAndViewModelsAreSynched", "different values", false, function(methods, classes, subject, invoker) {
    // arrange
    var m0 = {}, m1 = {};
    subject.itemSource = ko.observableArray([m0, {}]);
    subject.items = ko.observableArray([{model: ko.observable(m0)}, {model: ko.observable(m1)}]);
    
    // act
    var actual = invoker();
    
    // assert
    ok(!actual);
});

testUtils.testWithUtils("_modelsAndViewModelsAreSynched", "are synched", false, function(methods, classes, subject, invoker) {
    // arrange
    var m0 = {}, m1 = {};
    subject.itemSource = ko.observableArray([m0, m1]);
    subject.items = ko.observableArray([{model: ko.observable(m0)}, {model: ko.observable(m1)}]);
    
    // act
    var actual = invoker();
    
    // assert
    ok(actual);
});

testUtils.testWithUtils("_itemsChanged", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var added = {}, deleted = {};
    subject.onItemDeleted = methods.method([deleted]);
    subject.onItemRendered = methods.method([added]);
    
    // act
    invoker([{
        status: wipeout.utils.ko.array.diff.deleted, 
        value: deleted }, {
        status: wipeout.utils.ko.array.diff.added, 
        value: added
    }]);
    
    // assert
});

testUtils.testWithUtils("_itemSourceChanged", "should cover all cases", false, function(methods, classes, subject, invoker) {
    // arrange
    subject.items = ko.observableArray([{},{},{},{},{},{},{},{},{}]);
    var result = [subject.items()[2], subject.items()[3], subject.items()[1], subject.items()[8]];
    
    // act
    invoker(ko.utils.compareArrays(subject.items(), result));
    
    // assert
    strictEqual(subject.items().length, 4);
    strictEqual(subject.items()[0], result[0]);
    strictEqual(subject.items()[1], result[1]);
    strictEqual(subject.items()[2], result[2]);
    strictEqual(subject.items()[3], result[3]);
});

testUtils.testWithUtils("onItemDeleted", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var item = {
        dispose: methods.method()
    };
    
    // act
    // assert
    invoker(item);
});

testUtils.testWithUtils("dispose", "", false, function(methods, classes, subject, invoker) {
    // arrange    
    subject._super = methods.method();
    subject.items = ko.observableArray([{dispose: methods.method()},{dispose: methods.method()}]);
    
    // act
    // assert
    invoker();
});

testUtils.testWithUtils("_removeItem", "", false, function(methods, classes, subject, invoker) {
    // arrange  
    var item = {
        data: {}
    };    
    subject.itemSource = ko.observableArray([item.data]);
    subject.removeItem = methods.method([item.data]);
    
    // act
    invoker(item);
    
    // assert
    ok(item.handled);
});

testUtils.testWithUtils("removeItem", "", false, function(methods, classes, subject, invoker) {
    // arrange    
    var data = {};
    subject.itemSource = ko.observableArray([data]);
    
    // act
    invoker(data);
    
    // assert
    strictEqual(subject.itemSource().length, 0)
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
    ok(actual.__woBag.createdByWipeout);
});

testUtils.testWithUtils("createItem", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var itemTemplateId = {};
    var model = {};
    subject.itemTemplateId = function() { return itemTemplateId; };
    
    // act
    var actual = invoker(model);
    
    // assert
    ok(actual instanceof wipeout.viewModels.view);
    strictEqual(actual.model(), model);
    strictEqual(actual.templateId, itemTemplateId);
});

testUtils.testWithUtils("reDrawItems", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var model = {};
    var viewModel = {};
    subject.itemSource = ko.observableArray([model]);
    subject.items = ko.observableArray([]);
    subject._createItem = methods.method([model], viewModel);
    
    // act
    invoker();
    
    // assert
    strictEqual(subject.items().length, 1);
    strictEqual(subject.items()[0], viewModel);
});