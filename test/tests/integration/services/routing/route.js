module("integration: wipeout.services.routing.route", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("exactMatch, route and routePart", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.services.routing.route("http{protocol}://www.{subdomain}.something.com:2{portNo}/entity/{id}?entityName={entityName}#{hash}", true);
    
    // act
    var op = route.parse({
        protocol: "httpptc:",
        host: "www.sdm.something.com",
        port: "2345",
        pathname: "/entity/234",
        search: "?entityName=ten",
        hash: "#thsh"
    });
    
    // assert
    strictEqual(op.protocol, "ptc");
    strictEqual(op.subdomain, "sdm");
    strictEqual(op.portNo, "345");
    strictEqual(op.id, "234");
    strictEqual(op.entityName, "ten");
    strictEqual(op.hash, "thsh");
});

testUtils.testWithUtils("non exactMatch", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.services.routing.route("http{protocol}://www.{subdomain}.something.com:2{portNo}/entity/{id}");
    
    // act
    var op = route.parse({
        protocol: "httpptc:",
        host: "www.sdm.something.com",
        port: "2345",
        pathname: "/entity/234",
        search: "?entityName=ten",
        hash: "#thsh"
    });
    
    // assert
    strictEqual(op.protocol, "ptc");
    strictEqual(op.subdomain, "sdm");
    strictEqual(op.portNo, "345");
    strictEqual(op.id, "234");
});

testUtils.testWithUtils("exactMatch, missing port", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.services.routing.route("http{protocol}://www.{subdomain}.something.com/entity/{id}?entityName={entityName}#{hash}", true);
    
    // act
    var op = route.parse({
        protocol: "httpptc:",
        host: "www.sdm.something.com",
        port: "2345",
        pathname: "/entity/234",
        search: "?entityName=ten",
        hash: "#thsh"
    });
    
    // assert
    ok(!op);
});

testUtils.testWithUtils("exactMatch, missing pathname", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.services.routing.route("http{protocol}://www.{subdomain}.something.com:2{portNo}?entityName={entityName}#{hash}", true);
    
    // act
    var op = route.parse({
        protocol: "httpptc:",
        host: "www.sdm.something.com",
        port: "2345",
        pathname: "/entity/234",
        search: "?entityName=ten",
        hash: "#thsh"
    });
    
    // assert
    ok(!op);
});

testUtils.testWithUtils("exactMatch, missing search", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.services.routing.route("http{protocol}://www.{subdomain}.something.com:2{portNo}/entity/{id}#{hash}", true);
    
    // act
    var op = route.parse({
        protocol: "httpptc:",
        host: "www.sdm.something.com",
        port: "2345",
        pathname: "/entity/234",
        search: "?entityName=ten",
        hash: "#thsh"
    });
    
    // assert
    ok(!op);
});

testUtils.testWithUtils("exactMatch, missing hash", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var route = new wipeout.services.routing.route("http{protocol}://www.{subdomain}.something.com:2{portNo}/entity/{id}?entityName={entityName}", true);
    
    // act
    var op = route.parse({
        protocol: "httpptc:",
        host: "www.sdm.something.com",
        port: "2345",
        pathname: "/entity/234",
        search: "?entityName=ten",
        hash: "#thsh"
    });
    
    // assert
    ok(!op);
});
