module("integration: wipeout.services.routing.routePart", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("test 1", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.services.routing.routePart("x{val}x");
    
    // act
    // assert
    strictEqual(route.parse("xYYYx").val, "YYY");
    ok(!route.parse("YYYx"));
    ok(!route.parse("xYYY"));
    ok(!route.parse("zxYYYx"));
    ok(!route.parse("xYYYxz"));
});

testUtils.testWithUtils("test 2", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.services.routing.routePart("{val}x");
    
    // act
    // assert
    strictEqual(route.parse("YYYx").val, "YYY");
    ok(!route.parse("YYY"));
    strictEqual(route.parse("zYYYx").val, "zYYY");
    ok(!route.parse("YYYxz"));
});

testUtils.testWithUtils("test 3", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.services.routing.routePart("x{val}");
    
    // act
    // assert
    strictEqual(route.parse("xYYY").val, "YYY");
    ok(!route.parse("YYY"));
    ok(!route.parse("zxYYY"));
    strictEqual(route.parse("xYYYz").val, "YYYz");
});

testUtils.testWithUtils("test 4", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.services.routing.routePart("{val}");
    
    // act
    // assert
    strictEqual(route.parse("YYY").val, "YYY");
    strictEqual(route.parse("YYYz").val, "YYYz");
    strictEqual(route.parse("zYYY").val, "zYYY");
});