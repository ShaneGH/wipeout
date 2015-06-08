module("integration: wipeout.di.ioc", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("get", "services and singletons", true, function(methods, classes, subject, invoker) {
    // arrange
    var disp1 = false, disp2 = false, disp3 = false, 
        services = {
            obj1: busybody.disposable.extend(function (obj2, obj5) {
                this._super(function () {
                    disp1 = true;
                });

                ok(obj2 instanceof services.obj2);
                ok(obj5 instanceof services.obj5);
            }),
            obj2: busybody.disposable.extend(function (obj3) {
                this._super(function () {
                    disp2 = true;
                });

                ok(obj3 instanceof services.obj3);
            }),
            obj3: busybody.disposable.extend(function (obj4) {
                this._super(function () {
                    disp3 = true;
                });
                
                strictEqual(obj4, services.obj4);
            }),
            obj4: function () {
                ok(false);
            },
            obj5: busybody.disposable.extend(function (obj6) {
                this._super();
                
                strictEqual(obj6, services.obj6);
            }),
            obj6: {}
        };
    
    services.obj4.singleton = true;
    var subject = new wipeout.di.ioc(services);
    
    // act
    var item = subject.get("obj1");
    
    // assert
    ok(item instanceof services.obj1);
    
    ok(!disp1);
    ok(!disp2);
    ok(!disp3);
    item.dispose();
    
    ok(disp1);
    ok(disp2);
    ok(disp3);
});

testUtils.testWithUtils("get", "invalid services", true, function(methods, classes, subject, invoker) {
    // arrange
    var disp1 = false, disp2 = false, disp3 = false, 
        services = {
            obj1: busybody.disposable.extend(function (obj5) {
                this._super();

                ok(!obj5);
            }),
            obj2: {}
        };
    
    var subject = new wipeout.di.ioc(services);
    
    // act
    var item = subject.get("obj1");
    
    // assert
    ok(item instanceof services.obj1);
    ok(!subject.get("obj5"));
});

testUtils.testWithUtils("get", "circular reference", true, function(methods, classes, subject, invoker) {
    // arrange
    var disp1 = false, disp2 = false, disp3 = false, 
        services = {
            obj1: busybody.disposable.extend(function (obj2) {
                this._super();
            }),
            obj2: busybody.disposable.extend(function (obj1) {
                this._super();
            })
        };
    
    var subject = new wipeout.di.ioc(services);
    
    // act
    // assert
    throws(function () {
        subject.get("obj1");
    });
});