module("integration: wipeout.di.ioc", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("get", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var disp1 = false, disp2 = false, disp3 = false, 
        services = {
            obj1: busybody.disposable.extend(function (obj2) {
                this._super(function () {
                    disp1 = true;
                });

                ok(obj2 instanceof services.obj2);
            }),
            obj2: busybody.disposable.extend(function (obj3) {
                this._super(function () {
                    disp2 = true;
                });

                ok(obj3 instanceof services.obj3);
            }),
            obj3: busybody.disposable.extend(function () {
                this._super(function () {
                    disp3 = true;
                });
            })
        };
    
    var subject = new wipeout.di.ioc(services);
    
    // act
    var item = subject.get("obj1");
    
    // assert
    ok(!disp1);
    ok(!disp2);
    ok(!disp3);
    item.dispose();
    
    ok(disp1);
    ok(disp2);
    ok(disp3);
});