module("integration: wipeout.di.services.$router", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("route", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.services.$router({
        protocol: "httpptc:",
        hostname: "www.sdm.something.com",
        port: "2345",
        pathname: "/entity/234",
        search: "?entityName=ten",
        hash: "#thsh"
    }), _ok = false;
    route.addRoute("http{protocol}://www.{subdomain}.something.com:2{portNo}/entity/{id}?entityName={entityName}#{hash}", function (hash, protocol, subdomain, id, entityName, portNo, $allValues) {
        _ok = true;
        
        strictEqual(protocol, "ptc");
        strictEqual(subdomain, "sdm");
        strictEqual(portNo, "345");
        strictEqual(id, "234");
        strictEqual(entityName, "ten");
        strictEqual(hash, "thsh");
        
        strictEqual($allValues.protocol, "ptc");
        strictEqual($allValues.subdomain, "sdm");
        strictEqual($allValues.portNo, "345");
        strictEqual($allValues.id, "234");
        strictEqual($allValues.entityName, "ten");
        strictEqual($allValues.hash, "thsh");
        
    });
    
    // act
    route.parse();
    
    // assert
    ok(_ok);
});

testUtils.testWithUtils("route", "minimal", true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.services.$router({
        protocol: "httpptc:",
        hostname: "www.sdm.something.com",
        pathname: "/entity/234",
        search: "?entityName=ten",
        hash: "#thsh"
    }), _ok = false;
    route.addRoute("/entity/{id}", function (id) {
        _ok = true;
        strictEqual(id, "234");
    });
    
    // act
    route.parse();
    
    // assert
    ok(_ok);
});

testUtils.testWithUtils("route", "minimal, dispose", true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.di.services.$router({
        protocol: "httpptc:",
        hostname: "www.sdm.something.com",
        pathname: "/entity/234",
        search: "?entityName=ten",
        hash: "#thsh"
    });
    route.addRoute("/entity/{id}", function (id) {
        ok(false);
    }).dispose();
    
    // act
    route.parse();
    
    ok(true);
});

testUtils.testWithUtils("route", "get, then loose control", true, function(methods, classes, subject, invoker) {
    // arrange
    var location = {
        protocol: "httpptc:",
        hostname: "www.sdm.something.com",
        pathname: "/entity/234",
        search: "?entityName=ten",
        hash: "#thsh"
    };
    var route = new wipeout.di.services.$router(location), after;
    route.addRoute("/entity/{id}", function (id) { }, {unRoutedCallback: function () {after();}});
    
    route.parse();
    
    after = methods.method();
    
    // act
    location.pathname = "/";
    route.parse();
});