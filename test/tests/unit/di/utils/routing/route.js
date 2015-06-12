module("wipeout.di.utils.routing.route", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("compileSearchValues", null, true, function(methods, classes, subject, invoker) {
    // arrange
    // act
    var op = invoker({search: "?val1=val2&val%203=val%204&val5=&&val6&val7=val8"});
    
    // assert
    strictEqual(op["val1"], "val2");
    strictEqual(op["val 3"], "val 4");
    strictEqual(op["val5"], "");
    ok(op.hasOwnProperty("val6"));
    strictEqual(op["val6"], undefined);
    strictEqual(op["val7"], "val8");

});

testUtils.testWithUtils("constructor", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var uri, rs = {}, parts = {x: {}, uri: uri = {}};
    classes.mock("wipeout.di.utils.routing.route.splitRoute", function () {
        strictEqual(arguments[0], rs);
        return parts;
    }, 1);
    
    var rp = classes.mock("wipeout.di.utils.routing.routePart", function () {
        strictEqual(arguments[0], parts.x);
    }, 1);

    // act
    invoker(rs);
    
    // assert
    strictEqual(parts, subject.parts);
    strictEqual(uri, subject.uri);
    ok(!parts.uri);
    ok(parts.x instanceof rp);

});

testUtils.testWithUtils("parse", "parts ok", false, function(methods, classes, subject, invoker) {
    // arrange
    var location = {x: {}};
    subject.parts = {
        x: {
            parse: methods.customMethod(function (a1, a2) {
                strictEqual(a1, location.x);
                return a2;
            })
        }
    };
    
    // act
    // assert
    ok(invoker(location));
});

testUtils.testWithUtils("parse", "parts not ok", false, function(methods, classes, subject, invoker) {
    // arrange
    var location = {x: {}};
    subject.parts = {
        x: {
            parse: methods.customMethod(function (a1, a2) {
                strictEqual(a1, location.x);
                return false;
            })
        }
    };
    
    // act
    // assert
    ok(!invoker(location));
});

testUtils.testWithUtils("splitRoute", null, true, function(methods, classes, subject, invoker) {
    
    // arrange
    var vals = {
        protocol: "a+-fr.{asd}dD:",
        hostname: "LKJBLKJB&*&T*&T",
        port: "lkashdlk",
        pathname: "/askjbdkjasd/asijdaskj",
        search: "?akjshjahdopiayd09",
        hash: "#piasbopahsdopahsd"
    };
    
    // act
    assert("host");
    assert("host", "pathname");
    assert("pathname");
    assert("pathname", "search");
    
    assert("protocol", "///", "host");
    assert("protocol", "///", "host", ":", "port");
    assert("protocol", "///", "host", "pathname");
    assert("protocol", "///", "host", ":", "port", "pathname");
    assert("protocol", "///", "host", "pathname", "search");
    assert("protocol", "///", "host", ":", "port", "pathname", "search");
    assert("protocol", "///", "host", "pathname", "search", "hash");
    assert("protocol", "///", "host", ":", "port", "pathname", "search", "hash");
    
    assert("protocol", "///", "host", "pathname", "hash");
    assert("protocol", "///", "host", "hash");
    assert("protocol", "///", "host", "search", "hash");
    assert("protocol", "///", "host", "search");
    
    // assert
    function assert () {
        var url = "";
        for (var i = 0, ii = arguments.length; i < ii; i++)
            if (vals[arguments[i]])
                url += vals[arguments[i]];
            else
                url += arguments[i];
        
        var op = invoker(url);
        for (var i = 0, ii = arguments.length; i < ii; i++)
            strictEqual(op[arguments[i]], vals[arguments[i]]);
    }
});

testUtils.testWithUtils("splitRoute", "~ in path", true, function(methods, classes, subject, invoker) {
    
    // arrange
    var aru = wipeout.settings.applicationRootUrl;
    try {
        wipeout.settings.applicationRootUrl = "asdasdads";
    
        // act
        var op = invoker("~/askjbdkjasd/asijdaskj");

        // assert
        strictEqual(op.pathname, "/asdasdads/askjbdkjasd/asijdaskj");
    } finally {
        wipeout.settings.applicationRootUrl = aru;
    }
});

testUtils.testWithUtils("splitRoute", "~ in path but with host", true, function(methods, classes, subject, invoker) {
    
    // arrange
    var aru = wipeout.settings.applicationRootUrl;
    try {
        wipeout.settings.applicationRootUrl = "asdasdads";
    
        // act
        var op = invoker("www.something.com~/askjbdkjasd/asijdaskj");

        // assert
        strictEqual(op.pathname, "~/askjbdkjasd/asijdaskj");
    } finally {
        wipeout.settings.applicationRootUrl = aru;
    }
});