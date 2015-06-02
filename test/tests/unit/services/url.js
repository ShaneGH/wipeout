module("wipeout.services.url", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("add and remove", null, false, function(methods, classes, subject, invoker) {
    
    // arrange
    // act
    // assert
    wipeout.services.url(subject, "dasd");
    ok(subject.$urlBuilder);
    wipeout.services.url(subject);
    ok(!subject.$urlBuilder);
    
});

testUtils.testWithUtils("invalid url", null, false, function(methods, classes, subject, invoker) {
    
    // arrange
    // act
    // assert
    throws(function () {
        wipeout.services.url(subject, "dasd{asd");
    });
});

testUtils.testWithUtils("build url", null, false, function(methods, classes, subject, invoker) {
    
    // arrange
    // act
    wipeout.services.url(subject, "blabla/{item1}/lalala/{item2}{itemX}");
    subject.item1 = "something";
    subject.item2 = "another thing";

    //assert
    strictEqual(subject.$urlBuilder(subject), "blabla/something/lalala/another%20thingnull");
});

testUtils.testWithUtils("build url and hydrate", null, false, function(methods, classes, subject, invoker) {
    
    // arrange
    classes.mock("wipeout.services.url.hydrate", function () {
        strictEqual(arguments[0], subject);
    }, 1)
    
    // act
    wipeout.services.url(subject, "blabla", true);

    //assert
});

testUtils.testWithUtils("test cache", null, false, function(methods, classes, subject, invoker) {
    
    // arrange
    // act
    //assert
    strictEqual(wipeout.services.url(subject, "asdasdasdsa"), wipeout.services.url(subject, "asdasdasdsa"));
    
});

testUtils.testWithUtils("stringify", null, false, function(methods, classes, subject, invoker) {
    
    // arrange
    // act
    //assert
    strictEqual(wipeout.services.url.stringify({
        "\" \\":3,
        a:1, 
        b: '"xxx\\',
        c: {
            d: true,
            e: new Date(10000000),
            f: null,
            g: undefined
        },
        h: busybody.array([1, "2", true, {i: "4"}])
    }), '{"\\" \\\\":3,"a":1,"b":"\\"xxx\\\\","c":{"d":true,"e":"1970-01-01T02:46:40.000Z","f":{},"g":undefined},"h":[1,"2",true,{"i":"4"}]}');
    
});

testUtils.testWithUtils("hydrate", null, true, function(methods, classes, subject, invoker) {
    
    function asdsad(object) {
        if (!object.$urlBuilder)
            return;
        
        wipeout.utils.obj.ajax({
            url: object.$urlBuilder(object),
            success: function (result) {
                var r = result.response;
                result = convertArrays(JSON.parse(result.response));
                for (var i in object)
                    if (object.hasOwnProperty(i) && !result.hasOwnProperty(i))
                        delete object[i];
                
                for (var i in result)
                    object[i] = result[i];
            }
        });
    }
    
    // arrange
    subject.$urlBuilder = methods.method([subject], "aXaXaX");
    classes.mock("wipeout.utils.obj.ajax", function () {
        strictEqual(arguments[0].url, "aXaXaX");
        arguments[0].success({response: JSON.stringify({a: true, b: "kjbkjb", c: [1,2,[3,4,5]], d:{e:7}})});
    }, 1);
    
    // act
    invoker(subject);
    
    // assert
    ok(!subject.hasOwnProperty("$urlBuilder"));
    strictEqual(subject.a, true);
    strictEqual(subject.b, "kjbkjb");
    strictEqual(subject.c.constructor, busybody.array);
    strictEqual(subject.c[0], 1);
    strictEqual(subject.c[1], 2);
    strictEqual(subject.c[2].constructor, busybody.array);
    strictEqual(subject.c[2][0], 3);
    strictEqual(subject.c[2][1], 4);
    strictEqual(subject.c[2][2], 5);
    strictEqual(subject.d.e, 7);
});