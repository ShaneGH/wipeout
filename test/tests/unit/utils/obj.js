module("wipeout.utils.obj", {
    setup: function() {
    },
    teardown: function() {
    }
});

var obj = wipeout.utils.obj;

testUtils.testWithUtils("enumerateArr", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var subject = [];
    
    // act    
    invoker([1,2,3,4], function(i, j){this.push({val:i, name:j});}, subject);
    
    // assert    
    strictEqual(subject.length, 4);
    strictEqual(subject[0].name, 0);
    strictEqual(subject[0].val, 1);
    strictEqual(subject[1].name, 1);
    strictEqual(subject[1].val, 2);
    strictEqual(subject[2].name, 2);
    strictEqual(subject[2].val, 3);
    strictEqual(subject[3].name, 3);
    strictEqual(subject[3].val, 4);
});

testUtils.testWithUtils("enumerateObj", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var subject = [];
    
    // act    
    invoker({"a":1,"b": 2,"c": 3,"d": 4}, function(i, j){this.push({val:i, name:j});}, subject);
    
    // assert    
    strictEqual(subject.length, 4);
    strictEqual(subject[0].name, "a");
    strictEqual(subject[0].val, 1);
    strictEqual(subject[1].name, "b");
    strictEqual(subject[1].val, 2);
    strictEqual(subject[2].name, "c");
    strictEqual(subject[2].val, 3);
    strictEqual(subject[3].name, "d");
    strictEqual(subject[3].val, 4);
});

testUtils.testWithUtils("trim", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var string = "JKHVJKHVJKHVH";
    
    // act    
    // assert
    strictEqual(invoker("   \n\r\t" + string + "   \n\r\t"), string);
});

testUtils.testWithUtils("trimToLower", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var string = "JKHVJKHVJKHVH";
    
    // act    
    // assert
    strictEqual(invoker("   \n\r\t" + string + "   \n\r\t"), string.toLowerCase());
});

testUtils.testWithUtils("camelCase", "", true, function(methods, classes, subject, invoker) {
    // arrange    
    // act    
    // assert
    strictEqual(invoker("hello-one"), "helloOne");
    strictEqual(invoker("-hello-one"), "HelloOne");
    strictEqual(invoker("hello-one-"), "helloOne");
    strictEqual(invoker(null), null);
});

testUtils.testWithUtils("parseBool", "", true, function(methods, classes, subject, invoker) {
    // arrange    
    // act    
    // assert    
    strictEqual(invoker("sdasd"), true);    
    strictEqual(invoker("true"), true);      
    strictEqual(invoker("0"), false);  
    strictEqual(invoker(0), false);      
    strictEqual(invoker(""), false);    
    strictEqual(invoker("FalSe"), false);    
});

testUtils.testWithUtils("getObject", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var ctxt = {a:{b:{c:{d:{}}}}};
    
    // act    
    // assert    
    strictEqual(invoker("a.b.c.d", ctxt), ctxt.a.b.c.d);
});

testUtils.testWithUtils("setObject", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var ctxt = {a:{b:{c:{d:{}}}}}, obj = {};
    
    // act
	invoker("a.b.c.d", ctxt, obj);
	
    // assert    
    strictEqual(obj, ctxt.a.b.c.d);
});

testUtils.testWithUtils("splitPropertyName", "", true, function(methods, classes, subject, invoker) {
    // arrange    
    // act	
    // assert    
    deepEqual(invoker("a.b.c[3].t"), ["a", "b", "c", 3, "t"]);
});

testUtils.testWithUtils("joinPropertyName", "", true, function(methods, classes, subject, invoker) {
    // arrange    
    // act	
    // assert    
    deepEqual(invoker(["a", "b", "c", 3, "t"]), "a.b.c[3].t");
});

testUtils.testWithUtils("copyArray", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var expected = [{}, {}, {}];
    
    // act    
    var actual = invoker(expected);
    
    // assert    
    strictEqual(actual.length, expected.length);
    for(var i = 0, ii = actual.length; i < ii; i++)
        strictEqual(actual[i], expected[i]);        
});

testUtils.testWithUtils("extend", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var obj1 = {};
    var obj2 = {aaa:{}};
    
    // act
    var out = invoker(obj1, obj2);
    
    // assert    
    strictEqual(out, obj1);
    strictEqual(out.aaa, obj2.aaa);
});

testUtils.testWithUtils("asRegExp.convert", "", true, function(methods, classes, subject, invoker) {
    // arrange
    strictEqual(wipeout.utils.obj.asRegExp.convert("-/\\^$*+?.()|[]{}"), "\\-\\/\\\\\\^\\$\\*\\+\\?\\.\\(\\)\\|\\[\\]\\{\\}");
});

testUtils.testWithUtils("asRegExp", "", true, function(methods, classes, subject, invoker) {
    // arrange
    strictEqual(wipeout.utils.obj.asRegExp("-/\\^$*+?.()|[]{}").toString(), "/\\-\\/\\\\\\^\\$\\*\\+\\?\\.\\(\\)\\|\\[\\]\\{\\}/");
});

testUtils.testWithUtils("g", "", true, function(methods, classes, subject, invoker) {
    // arrange
    strictEqual(wipeout.utils.obj.asRegExp.g("-/\\^$*+?.()|[]{}").toString(), "/\\-\\/\\\\\\^\\$\\*\\+\\?\\.\\(\\)\\|\\[\\]\\{\\}/g");
});

testUtils.testWithUtils("i", "", true, function(methods, classes, subject, invoker) {
    // arrange
    strictEqual(wipeout.utils.obj.asRegExp.i("-/\\^$*+?.()|[]{}").toString(), "/\\-\\/\\\\\\^\\$\\*\\+\\?\\.\\(\\)\\|\\[\\]\\{\\}/i");
});

testUtils.testWithUtils("ig", "", true, function(methods, classes, subject, invoker) {
    // arrange
    strictEqual(wipeout.utils.obj.asRegExp.ig("-/\\^$*+?.()|[]{}").toString(), "/\\-\\/\\\\\\^\\$\\*\\+\\?\\.\\(\\)\\|\\[\\]\\{\\}/gi");
});

testUtils.testWithUtils("isNullOrWhiteSpace", "", true, function(methods, classes, subject, invoker) {
    // arrange    
    // act    
    // assert    
    ok(invoker());
    ok(invoker(""));
    ok(invoker("      "));
    ok(invoker("\n\t\n "));
    ok(!invoker(" a"));
});