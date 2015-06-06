module("integration: wipeout.template.rendering.renderedContent", {
    setup: integrationTestSetup,
    teardown: integrationTestTeardown
});

test("constructor", function() {
	clearIntegrationStuff();
	
	// arrange
	$("#qunit-fixture").html("<div id='hello'></div>");
	
	// act
	var rc = new wipeout.template.rendering.renderedContent(document.getElementById("hello"), "blabla");
	
	// assert
	ok(!document.getElementById("hello"));
	strictEqual($("#qunit-fixture")[0].childNodes.length, 2);
	strictEqual($("#qunit-fixture")[0].childNodes[0].nodeType, 8);
	strictEqual($("#qunit-fixture")[0].childNodes[0].textContent, " blabla ");
	strictEqual($("#qunit-fixture")[0].childNodes[0].wipeoutOpening, rc);
	
	strictEqual($("#qunit-fixture")[0].childNodes[1].nodeType, 8);
	strictEqual($("#qunit-fixture")[0].childNodes[1].textContent, " /blabla ");
	strictEqual($("#qunit-fixture")[0].childNodes[1].wipeoutClosing, rc);
	
	rc.dispose();
});
	
test("rename", function() {
	clearIntegrationStuff();
	
	// arrange
	$("#qunit-fixture").html("<div id='hello'></div>");
	
	// act
	var rc = new wipeout.template.rendering.renderedContent(document.getElementById("hello"), "blabla");
	rc.rename("lablab")
	
	// assert
	strictEqual($("#qunit-fixture")[0].childNodes[0].textContent, " lablab ");
	strictEqual($("#qunit-fixture")[0].childNodes[1].textContent, " /lablab ");
	
	rc.dispose();
});
	
test("renderArray", function() {
	
	clearIntegrationStuff();
	
	// arrange
	$("#qunit-fixture").html("<div id='hello'></div>");
	var rc = new wipeout.template.rendering.renderedContent(document.getElementById("hello"), "blabla");
	var array = new busybody.array([1, 2, 3]);
	
	// act
	rc.renderArray(array);
	
	// assert
	function assert() {
		strictEqual($("#qunit-fixture")[0].childNodes.length, (array.length * 3) + 2);
		
		for (var j = 0, i = 1, ii = $("#qunit-fixture")[0].childNodes.length - 1; i < ii; i += 3, j++) {
			strictEqual($("#qunit-fixture")[0].childNodes[i].textContent, " item: " + j + " ");
			strictEqual($("#qunit-fixture")[0].childNodes[i + 1].textContent, array[j].toString());
			strictEqual($("#qunit-fixture")[0].childNodes[i + 2].textContent, " /item: " + j + " ");
		}
	}
	
	assert();
	
	var disp = array.observe(function () {
		disp.dispose();
		
		setTimeout(function () {
			assert();
	
			rc.disposeOfBindings();
			array = [];
			assert();
			
			rc.dispose();
			start();
		});
	});
	
	array.replace(0, 2);
	array.replace(1, 1);
	array.push(55);
	
	stop();
});
	
test("renderArray, list", function() {
	
	clearIntegrationStuff();
	
	// arrange
	$("#qunit-fixture").html("<div id='hello'></div>");
	var rendered = [], removed = [];
	var ic = new wo.list();
	ic.items.push(1);
	ic.items.push(2);
	ic.items.push(3);
	var rc = new wipeout.template.rendering.renderedContent(document.getElementById("hello"), "blabla", new wipeout.template.context(ic));
	ic.onItemRendered = function (item) { rendered.push(item) };
	ic.onItemRemoved = function (item) { removed.push(item) };
	
	// act
	rc.renderArray(ic.items);
	
	// assert		
	strictEqual($("#qunit-fixture")[0].childNodes.length, (ic.items.length * 5) + 2);

	for (var j = 0, i = 1, ii = $("#qunit-fixture")[0].childNodes.length - 1; i < ii; i += 5, j++) {
		strictEqual($("#qunit-fixture")[0].childNodes[i].textContent, " item: " + j + " ");
		strictEqual($("#qunit-fixture")[0].childNodes[i + 1].textContent, " $this.model ");
		strictEqual($("#qunit-fixture")[0].childNodes[i + 2].textContent, ic.items[j].toString());
		strictEqual($("#qunit-fixture")[0].childNodes[i + 3].textContent, " /$this.model ");
		strictEqual($("#qunit-fixture")[0].childNodes[i + 4].textContent, " /item: " + j + " ");
	}
	
	strictEqual(ic.getItemViewModels().length, 3);
	wipeout.utils.obj.enumerateArr(ic.getItemViewModels(), function (val, i) {
		strictEqual(val.model, ic.items[i]);
	});
	
	strictEqual(rendered.length, 3);
	wipeout.utils.obj.enumerateArr(rendered, function (val, i) {
		strictEqual(val.model, ic.items[i]);
	});
	
	rc.dispose();
	strictEqual(removed.length, 3);
	wipeout.utils.obj.enumerateArr(removed, function (val, i) {
		strictEqual(val.model, ic.items[i]);
	});
});
	
test("render, non vm", function() {
	
	clearIntegrationStuff();
	
	// arrange
	$("#qunit-fixture").html("<div id='hello'></div>");
	var rc = new wipeout.template.rendering.renderedContent(document.getElementById("hello"), "blabla");
	var vm = {toString: function () {return "something";}};
	
	// act
	rc.render(vm);
	
	// assert
	strictEqual(rc.viewModel, vm);
	strictEqual(rc.renderContext.$this, vm);
	strictEqual($("#qunit-fixture")[0].childNodes.length, 3);
	strictEqual($("#qunit-fixture")[0].childNodes[1].textContent, "something");
	
	rc.dispose();
});
	
test("render, is vm", function() {
	
	clearIntegrationStuff();
	
	// arrange
	$("#qunit-fixture").html("<div id='hello'></div>");
	var rc = new wipeout.template.rendering.renderedContent(document.getElementById("hello"), "blabla");
	var tid = wipeout.viewModels.content.createAnonymousTemplate("something");
	var vm = new wo.view(tid);
	
	// act
	rc.render(vm);
	
	// assert
	ok(rc.templateObserved);
	strictEqual(rc.viewModel, vm);
	strictEqual(rc.renderContext.$this, vm);
	strictEqual($("#qunit-fixture")[0].childNodes.length, 3);
	strictEqual($("#qunit-fixture")[0].childNodes[1].textContent, "something");
	
	rc.dispose();
});
	
test("render, template change", function() {
	
	clearIntegrationStuff();
	
	// arrange
	$("#qunit-fixture").html("<div id='hello'></div>");
	var rc = new wipeout.template.rendering.renderedContent(document.getElementById("hello"), "blabla");
	var tid = wipeout.viewModels.content.createAnonymousTemplate("something");
	var vm = new wo.view(wipeout.viewModels.content.createAnonymousTemplate("not something"));
	vm.onRendered = function () {
		
		if (vm.templateId !== tid) {
			vm.templateId = tid;
			return;
		}
		
		ok(rc.templateObserved);
		strictEqual(rc.viewModel, vm);
		strictEqual(rc.renderContext.$this, vm);
		strictEqual($("#qunit-fixture")[0].childNodes.length, 3);
		strictEqual($("#qunit-fixture")[0].childNodes[1].textContent, "something");

		rc.dispose();
		
		start();
	}
	
	// act
	rc.render(vm);
	
	// assert
	stop();
});
	
test("un render", function() {
	
    // arrange
	var vms = [application, new wo.content(), new wo.content()];
    
    application.hello = vms[1];
    application.hello.helloAgain = vms[2];
    application.hello.helloAgain.setTemplate = 
"<wo.content id=\"cc1\">\
	</wo.content>\
		<div>Hi</div>\
	<wo.content id=\"cc2\">\
</wo.content>";
    application.hello.setTemplate = "<div wo-render='$this.helloAgain'></div>";
    
    application.setTemplate = "<div wo-render='$this.hello'></div>";
	
	application.onRendered = function () {
		vms.push(application.hello.helloAgain.templateItems.cc1);
		vms.push(application.hello.helloAgain.templateItems.cc2);

		// act
		wipeout.utils.obj.enumerateArr(vms, function(item) {
			ok(item.$domRoot);
		});
		
		application.$domRoot.unRender();

		// assert
		wipeout.utils.obj.enumerateArr(vms, function(item) {
			ok(!item.$domRoot);
		});
		
		start();
	};
	
	stop();
});

function disposeTest (act) {
    function disposeFunc() { this.isDisposed = true; this.constructor.prototype.dispose.call(this); };
    application.setTemplate = '<wo.view id="i0"></wo.view>\
<div id="a" something something1=\'aaa\' something2=wer345>\
    <wo.content id="i1">\
        <set-template>\
            <div id="b">\
                <div id="c">\
                    <wo.view inner="true" id="i2"></wo.view>\
                </div>\
            </div>\
        </set-template>\
    </wo.content>\
    <div id="d">\
        <div id="e">\
            <wo.list id="i3" items="[{},{}]">\
                <set-template>\
                    <div id="f">\
						{{$this.items}}\
                    </div>\
                </set-template>\
            </wo.list>\
        </div\>\
    </div\>\
</div>';
    
	application.onRendered  = function () {
		var i0, i1, i2, i3, i4, i5;
		ok(i0 = application.templateItems.i0);
		ok(i1 = application.templateItems.i1);
		ok(i2 = i1.templateItems.i2);
		ok(i3 = application.templateItems.i3);
		ok(i4 = i3.getItemViewModel(0));
		ok(i5 = i3.getItemViewModel(1));

		i0.dispose = disposeFunc;
		i1.dispose = disposeFunc;
		i2.dispose = disposeFunc;
		i3.dispose = disposeFunc;
		i4.dispose = disposeFunc;
		i5.dispose = disposeFunc;

		// act
		act();

		// assert
		setTimeout(function() {
			ok(i0.isDisposed);
			ok(i1.isDisposed);
			ok(i2.isDisposed);
			ok(i3.isDisposed);
			ok(i4.isDisposed);
			ok(i5.isDisposed);
			start();
		}, 150);
	};
	
	stop();
}

test("dispose", function() {
    disposeTest(function() {
		clearIntegrationStuff();
    });
});
	
test("template and untemplate, with click attribute", function() {
	
	clearIntegrationStuff();
	var methods = new testUtils.methodMock(), first = true;
	
	// arrange
	$("#qunit-fixture").html("<div id='hello'></div>");
	var rc = new wipeout.template.rendering.renderedContent(document.getElementById("hello"), "blabla");
	rc.renderContext = new wipeout.template.context({
		doSomething: function () {
			ok(first);
			first = false;
			methods.verifyAllExpectations();
			
			setTimeout(function () {
				rc.unTemplate(true);
				document.getElementById("theButton").click();
				start();
			});
		}
	});
	
	rc.viewModel = new wipeout.viewModels.view();
    rc.viewModel.onRendered = methods.method();
	
	var tid = wipeout.viewModels.content.createAnonymousTemplate('<button id="theButton" wo-click="$this.doSomething()"></button>');
	
	// act
	stop();
	rc.template(tid);
	document.getElementById("theButton").click();
});
	
test("appendHtml", function() {
	
	clearIntegrationStuff();
	
	// arrange
	$("#qunit-fixture").html('<div id="hello"></div><div id="goodbye"></div>');
	
	// act
	wipeout.template.rendering.renderedContent.prototype.appendHtml.call({
		closingTag: document.getElementById("goodbye")
	}, "asdsadsadsadasd<span></span>");
	
	// assert
	strictEqual($("#qunit-fixture").html(), '<div id="hello"></div>asdsadsadsadasd<span></span><div id="goodbye"></div>');
});
	
test("getParentElement, sibling parent", function() {
	
	clearIntegrationStuff();
	
	// arrange
	$("#qunit-fixture").html('<div id="hello"></div><div id="goodbye"></div>');
	document.getElementById("hello").wipeoutOpening = {};
	
	// act
	var result = wipeout.template.rendering.renderedContent.getParentElement(document.getElementById("goodbye"));
	
	// assert
	strictEqual(result, document.getElementById("hello"));
});
	
test("getParentElement, parent parent", function() {
	
	clearIntegrationStuff();
	
	// arrange
	$("#qunit-fixture").html('<div id="parent"><div id="hello"></div><div id="goodbye"></div></div>');
	
	// act
	var result = wipeout.template.rendering.renderedContent.getParentElement(document.getElementById("goodbye"));
	
	// assert
	strictEqual(result, document.getElementById("parent"));
});

/*
test("remove view model from dom", function() {
    disposeTest(function() {  
        wo.html(function() {
            $("#qunit-fixture").html("");
        });
    });  
});*/

test("prepend", function() {
	
	// arrange
	var subject = application.$domRoot;
	var el1 = document.createElement("div"), el2 = document.createElement("div");
	
	// act
	subject.prepend(el1);
	subject.prepend(el2);
	
	// assert
	strictEqual(subject.openingTag.nextSibling, el2);	
	strictEqual(el2.nextSibling, el1);
});

test("insertBefore", function() {
	
	// arrange
	var subject = application.$domRoot;
	var el1 = document.createElement("div"), el2 = document.createElement("div");
	
	// act
	subject.insertBefore(el1);
	subject.insertBefore(el2);
	
	// assert
	strictEqual(subject.openingTag.previousSibling, el2);	
	strictEqual(el2.previousSibling, el1);
});

test("insertAfter", function() {
	
	// arrange
	var subject = application.$domRoot;
	var el1 = document.createElement("div"), el2 = document.createElement("div");
	
	// act
	subject.insertAfter(el1);
	subject.insertAfter(el2);
	
	// assert
	strictEqual(subject.closingTag.nextSibling, el2);	
	strictEqual(el2.nextSibling, el1);
});

test("detatch", function() {
	
	// arrange
	var subject = application.$domRoot;
	var el1 = document.createElement("div"), el2 = document.createElement("div");
	subject.prepend(el1);
	subject.prepend(el2);
	
	// act
	var op1 = subject.detatch();
	var op2 = subject.detatch();
	
	// assert
	deepEqual(op1, op2);
	strictEqual(op1.length, 4);
	strictEqual(op1[0], subject.openingTag);
	strictEqual(op1[1], el2);
	strictEqual(op1[2], el1);
	strictEqual(op1[3], subject.closingTag);
});

test("allHtml", function() {
	
	// arrange
	var subject = application.$domRoot;
	var el1 = document.createElement("div"), el2 = document.createElement("div");
	subject.prepend(el1);
	subject.prepend(el2);
	
	// act
	var result1 = subject.allHtml();
	var result2 = subject.allHtml();
	
	// assert
	deepEqual(result1, result2);
	strictEqual(result1.length, 4);
	strictEqual(result1[0], subject.openingTag);
	strictEqual(result1[1], el2);
	strictEqual(result1[2], el1);
	strictEqual(result1[3], subject.closingTag);
});

test("allHtml, is detatched", function() {
	
	// arrange
	var subject = application.$domRoot;
	var el1 = document.createElement("div"), el2 = document.createElement("div");
	subject.prepend(el1);
	subject.prepend(el2);
	var detatched = subject.detatch();
	
	// act
	var result1 = subject.allHtml();
	var result2 = subject.allHtml();
	
	// assert
	deepEqual(result1, detatched);
	deepEqual(result1, result2);
	strictEqual(result1.length, 4);
	strictEqual(result1[0], subject.openingTag);
	strictEqual(result1[1], el2);
	strictEqual(result1[2], el1);
	strictEqual(result1[3], subject.closingTag);
});