module("integration: wipeout.template.rendering.compiledTemplate", {
    setup: function() {
    },
    teardown: function() {
    }
});

test("parser", function() {
	
	try {
		integrationTestSetup();
		
		// arrange
		application.setTemplate = '<div id="theDiv1" wo-content--s="Something"></div><div id="theDiv2" wo-content="$this.something"></div>'
		application.something = "Something else";
		
		// act
		application.onRendered = function () {
			strictEqual($("#theDiv1")[0].innerHTML, "Something");
			strictEqual($("#theDiv2")[0].innerHTML, "Something else");
			start();
			integrationTestTeardown();
		};

		// assert
		stop();
	} finally {
	}
});

test("success", function() {
	
	// arrange
	var template = wipeout.wml.wmlParser(
"<!-- hello -->\
hello\
{{$this.hello}}\
<wo.content hello--s='bellbo' set-template--s='not hello'></wo.content>\
<div style='display: block' wo-content='$this.hello'></div>");
	var subject = new wipeout.template.rendering.compiledTemplate(template).getBuilder();
	
	// act
	$("#qunit-fixture").html(subject.html);
	var html = $("#qunit-fixture")[0];
	
	function assert (index, nodeType, attrs) {
		strictEqual(html.childNodes[index].nodeType, nodeType);
		for (var i in attrs)
			strictEqual(html.childNodes[index][i], attrs[i]);
	}
	
	// assert
	assert(0, 8, {textContent: " hello "});
	assert(1, 3, {textContent: "hello"});
	assert(2, 1, {localName: "script"});
	assert(3, 1, {localName: "script"});
	assert(4, 1, {localName: "div", innerHTML: ""});
	strictEqual(html.childNodes[4].style.display, "block");
	ok(html.childNodes[4].id);
	
	
	// act
	subject.execute(new wipeout.template.context({ hello: "anotherHello"}));
	
	// assert
	assert(0, 8, {textContent: " hello "});
	assert(1, 3, {textContent: "hello"});
	assert(2, 8, {textContent: " $this.hello "});
	assert(3, 3, {textContent: "anotherHello"});
	assert(4, 8, {textContent: " /$this.hello "});
	assert(5, 8, {textContent: " wo.content "});
	assert(6, 3, {textContent: "not hello"});
	assert(7, 8, {textContent: " /wo.content "});
	assert(8, 1, {localName: "div", innerHTML: "anotherHello"});
	ok(!html.childNodes[8].id);
	
	strictEqual(wipeout.utils.viewModels.getViewModel(html.childNodes[5]).hello, "bellbo");
});