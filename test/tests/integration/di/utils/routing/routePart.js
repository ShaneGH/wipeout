module("integration: wipeout.di.utils.routing.routePart", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("constructor, invalid routes", null, true, function(methods, classes, subject, invoker) {
    // arrange
    // act
    // assert
    throws(function () {
        new wipeout.di.utils.routing.routePart("x{something");
    });
    
    throws(function () {
        new wipeout.di.utils.routing.routePart("x{something}f{something}");
    });
    
    throws(function () {
        new wipeout.di.utils.routing.routePart("x{something}f{*something}");
    });
});

testUtils.testWithUtils("constructor, parser and parts", null, true, function(methods, classes, subject, invoker) {
    // arrange
    // act
    var route = new wipeout.di.utils.routing.routePart("x{val1}y{*val2}z{val3--i}a");
    
    // assert
    strictEqual(route.parts.length, 8);
    strictEqual(route.parts[0].toString(), "/x/i");
    strictEqual(route.parts[1], "val1");
    strictEqual(route.parts[2].toString(), "/y/i");
    strictEqual(route.parts[3], "val2");
    strictEqual(route.parts[4].toString(), "/z/i");
    strictEqual(route.parts[5], "val3");
    strictEqual(route.parts[6].toString(), "/a/i");
    strictEqual(route.parts[7].toString(), "/(\\/?)$/i");
    strictEqual(route.variables.val1.compulsary, true);
    strictEqual(route.variables.val1.parser, wo.parsers.string);
    strictEqual(route.variables.val2.compulsary, false);
    strictEqual(route.variables.val2.parser, wo.parsers.string);
    strictEqual(route.variables.val3.compulsary, true);
    strictEqual(route.variables.val3.parser, wo.parsers.int);
});

testUtils.testWithUtils("constructor beginning and ending with variable", null, true, function(methods, classes, subject, invoker) {
    // arrange
    // act
    var route = new wipeout.di.utils.routing.routePart("{val1}y{*val2}");
    
    // assert
    strictEqual(route.parts.length, 5);
    strictEqual(route.parts[0].toString(), "/(?:)/i");
    strictEqual(route.parts[1], "val1");
    strictEqual(route.parts[2].toString(), "/y/i");
    strictEqual(route.parts[3], "val2");
    strictEqual(route.parts[4].toString(), "/(\\/?)$/i");
    strictEqual(route.variables.val1.compulsary, true);
    strictEqual(route.variables.val2.compulsary, false);
});

testUtils.testWithUtils("test 1", "with caps and non caps", true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("x{val}X");
    
    // act
    // assert
    strictEqual(route.parse("xYYYx", "oahdad").val, "YYY");
    ok(!route.parse("YYYx", "oahdad"));
    ok(!route.parse("xYYY", "oahdad"));
    ok(!route.parse("zxYYYx", "oahdad"));
    ok(!route.parse("xYYYxz", "oahdad"));
});

testUtils.testWithUtils("test 2", "with regexp special characters", true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("{val}^");
    
    // act
    // assert
    strictEqual(route.parse("YYY^", "oahdad").val, "YYY");
    ok(!route.parse("YYY", "oahdad"));
    strictEqual(route.parse("!YYY^", "oahdad").val, "!YYY");
    ok(!route.parse("YYY^!", "oahdad"));
});

testUtils.testWithUtils("test 3, with url encoded chars", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("x{val}");
    
    // act
    // assert
    strictEqual(route.parse("xYY%20Y", "oahdad").val, "YY Y");
    ok(!route.parse("YY%20Y", "oahdad"));
    ok(!route.parse("zxYY%20Y", "oahdad"));
    strictEqual(route.parse("xYY%20Yz", "oahdad").val, "YY Yz");
});

testUtils.testWithUtils("test 4", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("{val}");
    
    // act
    // assert
    strictEqual(route.parse("YYY", "oahdad").val, "YYY");
    strictEqual(route.parse("YYYz", "oahdad").val, "YYYz");
    strictEqual(route.parse("zYYY", "oahdad").val, "zYYY");
});

testUtils.testWithUtils("no route val 1", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("x{val}x");
    
    // act
    // assert
    ok(!route.parse("xx", "oahdad"));
});

testUtils.testWithUtils("no route val 2", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("x{val}");
    
    // act
    // assert
    ok(!route.parse("x", "oahdad"));
});

testUtils.testWithUtils("no route val 3", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("{val}x");
    
    // act
    // assert
    ok(!route.parse("x", "oahdad"));
});

testUtils.testWithUtils("no route val 3", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("{val}");
    
    // act
    // assert
    ok(!route.parse("", "oahdad"));
});

testUtils.testWithUtils("Duplicate url value", null, true, function(methods, classes, subject, invoker) {
    // arrange
    // act
    // assert
    throws(function () {
        new wipeout.di.utils.routing.routePart("/{val}/").parse("/xxx/", "adasd", {val: true});
    });
});

testUtils.testWithUtils("Compulsary and Non compulsary value", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("/{val1}/{*val2}/");
    
    // act
    // assert
    strictEqual(route.parse("/xxx//", "oahdad").val1, "xxx");
    strictEqual(route.parse("/xxx//", "oahdad").val2, null);
    strictEqual(route.parse("/xxx/xxx/", "oahdad").val2, "xxx");
    strictEqual(route.parse("//xxx/", "oahdad"), null);
});

testUtils.testWithUtils("Exact and non exact match (beginning)", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route1 = new wipeout.di.utils.routing.routePart("xyxyxy");
    var route2 = new wipeout.di.utils.routing.routePart("*xyxyxy");
    var route3 = new wipeout.di.utils.routing.routePart("");
    var route4 = new wipeout.di.utils.routing.routePart("*");
    
    // act
    // assert
    ok(!route1.parse("zxyxyxy", "oahdad"));
    ok(route2.parse("zxyxyxy", "oahdad"));
    ok(!route3.parse("zxyxyxy", "oahdad"));
    ok(route4.parse("zxyxyxy", "oahdad"));
});

testUtils.testWithUtils("Exact and non exact match (end)", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route1 = new wipeout.di.utils.routing.routePart("xyxyxy");
    var route2 = new wipeout.di.utils.routing.routePart("xyxyxy*");
    var route3 = new wipeout.di.utils.routing.routePart("");
    var route4 = new wipeout.di.utils.routing.routePart("*");
    
    // act
    // assert
    ok(!route1.parse("xyxyxyz", "oahdad"));
    ok(route2.parse("xyxyxyz", "oahdad"));
    ok(!route3.parse("xyxyxyz", "oahdad"));
    ok(route4.parse("xyxyxyz", "oahdad"));
});

testUtils.testWithUtils("Exact and non exact match (beginning and end)", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route1 = new wipeout.di.utils.routing.routePart("xyxyxy");
    var route2 = new wipeout.di.utils.routing.routePart("*xyxyxy*");
    var route3 = new wipeout.di.utils.routing.routePart("");
    var route4 = new wipeout.di.utils.routing.routePart("**");
    
    // act
    // assert
    ok(!route1.parse("zxyxyxyz", "oahdad"));
    ok(route2.parse("zxyxyxyz", "oahdad"));
    ok(!route3.parse("zxyxyxyz", "oahdad"));
    ok(route4.parse("zxyxyxyz", "oahdad"));
});