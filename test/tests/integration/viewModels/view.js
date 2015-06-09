module("integration: wipeout.viewModels.view", {
    setup: integrationTestSetup,
    teardown: integrationTestTeardown
});
	
test("xml parser", function() {
	
    // arrange
	// act
    application.setTemplate = '<wo.view id="item">\
		<xml parser="template">\
			<hello></hello>\
		</xml>\
    </wo.view>';
	
	application.onRendered = function () {
		var item = application.templateItems.item;
		
		strictEqual(item.xml.constructor, wipeout.wml.wmlElement);
		strictEqual(item.xml[1].name, "hello");
		
		start();
	};
	
	stop();
});
	
test("nb", function() {
	
    // arrange
	var nb = application.nb = {};
	        
    // act
    application.setTemplate = '<wo.view id="item"\
		nb--nb="$this.nb" nbs--nb-s="$this.nb"\
    </wo.view>';
	
	application.onRendered = function () {
		var item = application.templateItems.item;
		
		strictEqual(application.nb, nb);
		strictEqual(application.nb, item.nb);
		strictEqual("$this.nb", item.nbs);
		
		start();
	};
	
	stop();
});
	
test("ow", function() {
	
    // arrange
	var ow = application.ow = {}, ow2 = {};
	        
    // act
    application.setTemplate = '<wo.view id="item"\
		ow--ow="$this.ow" ows--ow-s="$this.ow">\
    </wo.view>';
	
	application.onRendered = function () {
		var item = application.templateItems.item;
		
		strictEqual(application.ow, ow);
		strictEqual(application.ow, item.ow);
		strictEqual("$this.ow", item.ows);
		
		var d1 = item.observe("ow", function () {
			d1.dispose();
			
			strictEqual(application.ow, ow2);
			strictEqual(application.ow, item.ow);
			start();
		});
		
		application.ow = ow2;
	};
	
	stop();
});
	
test("tw", function() {
	
    // arrange
	var tw = application.tw = {val: 1}, tw2 = {val: 2};
	        
    // act
    application.setTemplate = '<wo.view id="item" tw--tw="$this.tw"></wo.view>';
	
	application.onRendered = function () {
		var item = application.templateItems.item;
		
		strictEqual(application.tw, tw);
		strictEqual(application.tw, item.tw);
		
		var d2 = item.observe("tw", function () {
			d2.dispose();
			
			strictEqual(application.tw, tw2);
			strictEqual(application.tw, item.tw);
			
			d2 = application.observe("tw", function () {
				d2.dispose();

				strictEqual(application.tw, tw);
				strictEqual(application.tw, item.tw);
				start();
			});

			item.tw = tw;
		});
		
		application.tw = tw2;
	};
	
	stop();
});
	
test("owts", function() {
	
    // arrange
	var owts = application.owts = {};
	        
    // act
    application.setTemplate = '<wo.view id="item"\
		owts--owts="$this.owts">\
    </wo.view>';
	
	application.onRendered = function () {
		var item = application.templateItems.item;
		
		strictEqual(application.owts, undefined);
		strictEqual(application.owts, item.owts);
		
		var d3 = application.observe("owts", function () {
			d3.dispose();
			
			strictEqual(application.owts, owts);
			strictEqual(application.owts, item.owts);
			start();
		});
		
		item.owts = owts;
	};
	
	stop();
});

test("parent child views", function() {
	
    // arrange
    var parent1 = "p1", child1 = "c1", child2 = "c2";
    var parent2 = "p2", child3 = "c3", child4 = "c4";
    var parent3 = "p3", child5 = "c5", child6 = "c6";
    
    // act
    application.setTemplate = '<wo.content share-parent-scope="true" id="' + parent1 + '">\
        <set-template>\
            <wo.view share-parent-scope="true" id="' + child1 + '"></wo.view>\
            <wo.view id="' + child2 + '"></wo.view>\
        </set-template>\
    </wo.content>\
    <wo.content id="' + parent2 + '">\
        <set-template>\
            <wo.view share-parent-scope="true" id="' + child3 + '"></wo.view>\
            <wo.view id="' + child4 + '"></wo.view>\
        </set-template>\
    </wo.content>\
    <wo.list items="[{},{}]" id="' + parent3 + '">\
    </wo.list>';
	
	application.onRendered = function () {
    
		ok(parent1 = application.templateItems[parent1]);
		ok(child1 = application.templateItems[child1]);
		ok(child2 = application.templateItems[child2]);

		ok(parent2 = application.templateItems[parent2]);
		ok(child3 = parent2.templateItems[child3]);
		ok(child4 = parent2.templateItems[child4]);

		ok(parent3 = application.templateItems[parent3]);
		ok(child5 = parent3.getItemViewModels()[0]);
		ok(child6 = parent3.getItemViewModels()[1]);

		// assert
		strictEqual(child1.getParent(), application);
		strictEqual(child2.getParent(), application);
		strictEqual(child3.getParent(), parent2);
		strictEqual(child4.getParent(), parent2);
		strictEqual(child5.getParent(), parent3);
		strictEqual(child6.getParent(), parent3);
		
		start();
	};
	
	stop();
});

test("camel casing and synchronus rendering of <set-template>", function() {
    
    // arrange
    // act
    application.setTemplate = '<wo.content a-property-1="true" id="item" >\
        <a-property-2>true</a-property-2>\
		<set-template>\
			<wo.content a-property-1="true" id="item" >\
				<a-property-2>true</a-property-2>\
			</wo.content>\
		</set-template>\
    </wo.content>';
    
    // assert
	application.onRendered = function () {
		ok(application.templateItems.item.aProperty1);
		ok(application.templateItems.item.aProperty2);
		ok(application.templateItems.item.templateItems.item.aProperty1);
		ok(application.templateItems.item.templateItems.item.aProperty2);
		start();
	};
	
	stop();
});

test("templateItems", function() {
    // arrange
    var id1 = "IBYIBOIYHOUUBOH", id2 = "asdasdsad";
    
    // act
    application.setTemplate = "<div id='" + id1 + "'><wo.view id='" + id2 + "'></wo.view></div>";
    
	application.onRendered = function () {
		// assert
		var item = $("#" + id1);
		strictEqual(item.length, 1);
		strictEqual(application.templateItems[id1], item[0]);
		ok(application.templateItems[id2] instanceof wo.view);
		start();
	};
	
	stop();
});

test("basic html binding, non observable", function() {
    // arrange
    var val = "LIB:OIPHJKB:OIYHJB";
    var id = "dsfbisdfb";
    application.model.value = val;
    
    // act
    application.setTemplate = "<div id='" + id + "' wo-content='$this.model.value'></div>";
    
    // assert
	application.onRendered = function () {
    	strictEqual($("#" + id).html(), val);
		start();
	};
	
	stop();
});

test("basic html binding", function() {
    // arrange
    var val = "LIB:OIPHJKB:OIYHJB";
    var id = "dsfbisdfb";
    busybody.makeObservable(application.model);
	application.model.value = val;
    
    // act
    application.setTemplate = "<div id='" + id + "' wo-content='$this.model.value'></div>";
    
	application.onRendered = function () {
			
		// assert
		strictEqual($("#" + id).html(), val);


		// re-act
		var val2 = "NP(UNN{  JPIUNIIN";

		busybody.observe(application.model, "value", function () {
			// re-assert
			setTimeout(function () {
				strictEqual($("#" + id).html(), val2);
				start();
			});
		});
		
		application.model.value = val2;
	};
	
	stop();
		
});

test("multi-dimentional binding", function() {
    // arrange
    var val;
    var model = busybody.makeObservable({ inner: busybody.makeObservable({ inner: busybody.makeObservable({ inner: busybody.makeObservable({ val: "" }) }) }) });
    var id1 = "asdhasjdkjbasd", id2 = "asdhasjdkjbasdasdwetsdf";
    var open = "<wo.content id='" + id1 + "' model='$this.model.inner'><set-template>", close = "</set-template></wo.content>";
    application.model = model;
    application.setTemplate = open + open + open + "<div id='" + id2 + "' wo-content='$this.model.val'></div>" + close + close + close;
    
    // act
	application.onRendered = function () {
		
		var i1, i2, i3;
		ok(i1 = application.templateItems[id1]);
		ok(i2 = i1.templateItems[id1]);
		ok(i3 = i2.templateItems[id1]);
		
		model.inner.inner.inner.val = val = "KVKJGVMNGMV";
		busybody.observable.afterNextObserveCycle(function () {
		busybody.observable.afterNextObserveCycle(function () {
			strictEqual($("#" + id2).html(), val);
			
			model.inner.inner.inner = {val: val = "asdasdasd" };
			busybody.observable.afterNextObserveCycle(function () {
			busybody.observable.afterNextObserveCycle(function () {
				strictEqual($("#" + id2).html(), val);
				
				model.inner.inner = {inner: {val: val = "fghgfhgfh" } };
				busybody.observable.afterNextObserveCycle(function () {
				busybody.observable.afterNextObserveCycle(function () {
				busybody.observable.afterNextObserveCycle(function () {
					strictEqual($("#" + id2).html(), val);
					
					model.inner = {inner: {inner: {val: val = "q3w34" } } };
					busybody.observable.afterNextObserveCycle(function () {
					busybody.observable.afterNextObserveCycle(function () {
					busybody.observable.afterNextObserveCycle(function () {
					busybody.observable.afterNextObserveCycle(function () {
						strictEqual($("#" + id2).html(), val);
					
						application.model = {inner: {inner: {inner: {val: val = "KJBKJGKJKJB" } } } };
						busybody.observable.afterNextObserveCycle(function () {
						busybody.observable.afterNextObserveCycle(function () {
						busybody.observable.afterNextObserveCycle(function () {
						busybody.observable.afterNextObserveCycle(function () {
							strictEqual($("#" + id2).html(), val);
							start();
						}, true);
						}, true);
						}, true);
						}, true);
					}, true);
					}, true);
					}, true);
					}, true);
				}, true);
				}, true);
				}, true);
			}, true);
			}, true);
		}, true);
		}, true);
	};
	
	stop();
});

test("shareParentScope", function() {
    
    // arrange
    var container = "LKHLHKLH", val = "LKJGB*(PYGUBOPY", child = "LKGKJHFF", childNode = "ghgfhfg";
    
    // act
    application.setTemplate = '<wo.content id="' + container + '" an-item--s="' + val + '" depth="1">\
    <set-template>\
        <wo.content share-parent-scope="true" depth="2">\
            <set-template>\
                <wo.view id="' + child + '" an-item="$this.anItem" depth="3"></wo.view>\
				<div id="' + childNode + '"></div>\
            </set-template>\
        </wo.content>\
    </set-template>\
</wo.content>';
	
	application.onRendered = function () {
    
		var subject = application.templateItems[container];
		ok(subject);

		// assert
		ok(subject.templateItems[child]);
		strictEqual(subject.templateItems[child].anItem, val);
		ok(subject.templateItems[childNode]);
		
		start();
	};
	
	
	stop();
});

testUtils.testWithUtils("registerEvent", null, false, function(methods, classes, subject, invoker) {
	// arrange
    var view = new wo.view();
    view.yyy = {zzz:{}};
    var args = {}, ctxt = {};
    view.registerEvent("yyy.zzz", "www", function () { ok(false); });
    view.registerEvent("yyy", "xxx", function () { ok(false); });
    view.registerEvent("yyy.zzz", "xxx", function () { 
        strictEqual(arguments[0], args); 
        strictEqual(arguments[1], view.yyy.zzz);
        strictEqual(this, ctxt);
        start();
    }, ctxt);
    
    stop();
    
	// act
    // assert
    wo.triggerEvent(view.yyy.zzz, "xxx", args);
    
    view.dispose();
});

testUtils.testWithUtils("registerEvent", "dispose", false, function(methods, classes, subject, invoker) {
	// arrange
    var view = new wo.view();
    view.yyy = {zzz:{}};
    view.registerEvent("yyy.zzz", "xxx", function () { ok(false); }).dispose();
    
	// act
    // assert
    wo.triggerEvent(view.yyy.zzz, "xxx");
    
    view.dispose();
    ok(true);
});

testUtils.testWithUtils("registerEvent", "dispose of view", false, function(methods, classes, subject, invoker) {
	// arrange
    var view = new wo.view();
    view.yyy = {zzz:{}};
    view.registerEvent("yyy.zzz", "xxx", function () { ok(false); });
    view.dispose();
    
	// act
    // assert
    wo.triggerEvent(view.yyy.zzz, "xxx");
    
    ok(true);
});

test("all convenience methods", function() {
    
    clearIntegrationStuff();
    
    wipeout.di.services.temp = {};
	
    // arrange	
    var init, rend, unrend, disp, initApp;
	wo.viewModel("vms.test1")
		.initialize(function (temp) { 
            init = true; 
            strictEqual(temp, wipeout.di.services.temp);
        })
		.rendered(function () { rend = true; })
		.unRendered(function () { unrend = true; })
		.dispose(function () { disp = true; assert(); })
		.initializeApplication(function () { initApp = true; })
        .build();
        
	// act
    $("#qunit-fixture").html("<vms.test1 id='vmstest' template-id='wo.content.createAnonymousTemplate(" + '"aa"' + ")'></vms.test1><js-object id='jsobj'></js-object>");
    wo(null, "vmstest").dispose();

	// assert
    function assert() {
        ok(init);
        ok(rend);
        ok(unrend);
        ok(disp);
        ok(initApp);
    }
    
    // smoke test for non vms, ensure no exceptions
    wo(null, "jsobj").dispose();
    
    delete wipeout.di.services.temp;
});

test("convenience methods on view model property", function() {
    
    clearIntegrationStuff();
    
    wipeout.di.services.temp = {};
    
	// arrange	
    var init, rend, unrend, disp;
	wo.viewModel("vms.test3")
		.initialize(function (temp) {
            init = true; 
            strictEqual(temp, wipeout.di.services.temp);
        })
		.rendered(function () { rend = true; })
		.unRendered(function () { unrend = true; })
		.dispose(function () { disp = true; assert(); })
        .build();
        
	// act
    $("#qunit-fixture").html("<wo.content id='vmstest'>\
    <a-prop>\
        <vms.test3 template-id='wo.content.createAnonymousTemplate(" + '"aa"' + ")'></vms.test3>\
    </a-prop>\
    <set-template>\
        {{$this.aProp}}\
    </set-template>\
</wo.content>");
    var disp = wo(null, "vmstest");
    disp.dispose();
    
	// assert
    function assert() {
        ok(init);
        ok(rend);
        ok(unrend);
        ok(disp);
    }
    
    delete wipeout.di.services.temp;
});

/*test("move view model", function() {
    // arrange
    application.template('<wo.content id="toMove">\
    <set-template>\
        <span></span>\
    </set-template>\
</wo.content>\
<wo.content id="moveToParent1" share-parent-scope="true">\
    <set-template>\
        <div id="moveToPosition1"></div>\
    </set-template>\
</wo.content>\
<wo.content id="moveToParent2">\
    <set-template>\
        <div id="moveToPosition2"></div>\
    </set-template>\
</wo.content>');
    
    var toMove = application.templateItems.toMove;
    var moveToParent2 = application.templateItems.moveToParent2;
    strictEqual(toMove.getParent(), application);
    strictEqual(moveToParent2.getParent(), application);
    
    // act
    wo.move(function() {
        $(toMove.entireViewModelHtml()).appendTo("#moveToPosition1");
    });
    stop();
    
    // assert
    setTimeout(function() {
        strictEqual(toMove.getParent(true), application.templateItems.moveToParent1);
        strictEqual(toMove, application.templateItems.toMove);
        
        $(toMove.entireViewModelHtml()).appendTo("#moveToPosition2");        
        setTimeout(function() {
            strictEqual(toMove.getParent(), application.templateItems.moveToParent2);
            
            // test template items have changed
            ok(!application.templateItems.toMove);
            strictEqual(toMove, application.templateItems.moveToParent2.templateItems.toMove);
            
            start();
        }, 150);
    }, 150);    
});*/