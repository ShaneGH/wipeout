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
    strictEqual(route.parts[7].toString(), "/$/");
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
    strictEqual(route.parts[4].toString(), "/$/");
    strictEqual(route.variables.val1.compulsary, true);
    strictEqual(route.variables.val2.compulsary, false);
});

testUtils.testWithUtils("test 1", "with caps and non caps", true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("x{val}X");
    
    // act
    // assert
    strictEqual(route.parse("xYYYx").val, "YYY");
    ok(!route.parse("YYYx"));
    ok(!route.parse("xYYY"));
    ok(!route.parse("zxYYYx"));
    ok(!route.parse("xYYYxz"));
});

testUtils.testWithUtils("test 2", "with regexp special characters", true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("{val}^");
    
    // act
    // assert
    strictEqual(route.parse("YYY^").val, "YYY");
    ok(!route.parse("YYY"));
    strictEqual(route.parse("!YYY^").val, "!YYY");
    ok(!route.parse("YYY^!"));
});

testUtils.testWithUtils("test 3, with url encoded chars", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("x{val}");
    
    // act
    // assert
    strictEqual(route.parse("xYY%20Y").val, "YY Y");
    ok(!route.parse("YY%20Y"));
    ok(!route.parse("zxYY%20Y"));
    strictEqual(route.parse("xYY%20Yz").val, "YY Yz");
});

testUtils.testWithUtils("test 4", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("{val}");
    
    // act
    // assert
    strictEqual(route.parse("YYY").val, "YYY");
    strictEqual(route.parse("YYYz").val, "YYYz");
    strictEqual(route.parse("zYYY").val, "zYYY");
});

testUtils.testWithUtils("no route val 1", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("x{val}x");
    
    // act
    // assert
    ok(!route.parse("xx"));
});

testUtils.testWithUtils("no route val 2", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("x{val}");
    
    // act
    // assert
    ok(!route.parse("x"));
});

testUtils.testWithUtils("no route val 3", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("{val}x");
    
    // act
    // assert
    ok(!route.parse("x"));
});

testUtils.testWithUtils("no route val 3", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("{val}");
    
    // act
    // assert
    ok(!route.parse(""));
});

testUtils.testWithUtils("Duplicate url value", null, true, function(methods, classes, subject, invoker) {
    // arrange
    // act
    // assert
    throws(function () {
        new wipeout.di.utils.routing.routePart("/{val}/").parse("/xxx/", {val: true});
    });
});

testUtils.testWithUtils("Compulsary and Non compulsary value", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.utils.routing.routePart("/{val1}/{*val2}/");
    
    // act
    // assert
    strictEqual(route.parse("/xxx//").val1, "xxx");
    strictEqual(route.parse("/xxx//").val2, null);
    strictEqual(route.parse("/xxx/xxx/").val2, "xxx");
    strictEqual(route.parse("//xxx/"), null);
});

testUtils.testWithUtils("Exact and non exact match (beginning)", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route1 = new wipeout.di.utils.routing.routePart("xyxyxy");
    var route2 = new wipeout.di.utils.routing.routePart("*xyxyxy");
    var route3 = new wipeout.di.utils.routing.routePart("");
    var route4 = new wipeout.di.utils.routing.routePart("*");
    
    // act
    // assert
    ok(!route1.parse("zxyxyxy"));
    ok(route2.parse("zxyxyxy"));
    ok(!route3.parse("zxyxyxy"));
    ok(route4.parse("zxyxyxy"));
});

testUtils.testWithUtils("Exact and non exact match (end)", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route1 = new wipeout.di.utils.routing.routePart("xyxyxy");
    var route2 = new wipeout.di.utils.routing.routePart("xyxyxy*");
    var route3 = new wipeout.di.utils.routing.routePart("");
    var route4 = new wipeout.di.utils.routing.routePart("*");
    
    // act
    // assert
    ok(!route1.parse("xyxyxyz"));
    ok(route2.parse("xyxyxyz"));
    ok(!route3.parse("xyxyxyz"));
    ok(route4.parse("xyxyxyz"));
});

testUtils.testWithUtils("Exact and non exact match (beginning and end)", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route1 = new wipeout.di.utils.routing.routePart("xyxyxy");
    var route2 = new wipeout.di.utils.routing.routePart("*xyxyxy*");
    var route3 = new wipeout.di.utils.routing.routePart("");
    var route4 = new wipeout.di.utils.routing.routePart("**");
    
    // act
    // assert
    ok(!route1.parse("zxyxyxyz"));
    ok(route2.parse("zxyxyxyz"));
    ok(!route3.parse("zxyxyxyz"));
    ok(route4.parse("zxyxyxyz"));
});