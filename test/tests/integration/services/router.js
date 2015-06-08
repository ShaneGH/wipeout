module("integration: wipeout.services.router", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("route", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.services.router(false), _ok = false;
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
    route.parse({
        protocol: "httpptc:",
        host: "www.sdm.something.com",
        port: "2345",
        pathname: "/entity/234",
        search: "?entityName=ten",
        hash: "#thsh"
    });
    
    // assert
    ok(_ok);
});

testUtils.testWithUtils("route", "minimal", true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.services.router(false), _ok = false;
    route.addRoute("/entity/{id}", function (id) {
        _ok = true;
        strictEqual(id, "234");
    });
    
    // act
    route.parse({
        protocol: "httpptc:",
        host: "www.sdm.something.com",
        pathname: "/entity/234",
        search: "?entityName=ten",
        hash: "#thsh"
    });
    
    // assert
    ok(_ok);
});

testUtils.testWithUtils("route", "minimal, dispose", true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.services.router(false);
    route.addRoute("/entity/{id}", function (id) {
        ok(false);
    }).dispose();
    
    // act
    route.parse({
        protocol: "httpptc:",
        host: "www.sdm.something.com",
        pathname: "/entity/234",
        search: "?entityName=ten",
        hash: "#thsh"
    });
    
    ok(true);
});

testUtils.testWithUtils("route", "get, then loose control", true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.services.router(false), after;
    route.addRoute("/entity/{id}", function (id) { }, {unRoutedCallback: function () {after();}});
    
    route.parse({
        protocol: "httpptc:",
        host: "www.sdm.something.com",
        pathname: "/entity/234",
        search: "?entityName=ten",
        hash: "#thsh"
    });
    
    after = methods.method();
    
    // act
    route.parse({
        protocol: "",
        host: "",
        pathname: "",
        search: "",
        hash: ""
    });
});