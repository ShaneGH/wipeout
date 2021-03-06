module("integration: wipeout.template.initialization.htmlAttributes.wo-attr", {
    setup: integrationTestSetup,
    teardown: integrationTestTeardown
});

test("smoke test", function() {
	
	// arrange
	application.val = "checkbox";
	
	// act
	application.setTemplate = '<input id="element" wo-attr-type="$this.val" />';
	
	// assert
	application.onRendered = function () {
		strictEqual(application.templateItems.element.type, "checkbox");
		start();
	};
	
	stop();
});

test("existing attribute", function() {
	clearIntegrationStuff();
	
	$("#qunit-fixture").html("<div id='hello' style='display: block'></div>")
	var input = document.getElementById("hello");
	var model = busybody.makeObservable({visible: "display: none"});
	var attribute = new wipeout.template.rendering.htmlPropertyValue("wo-attr-style", "$this.visible", null, "wo-attr");
	
	// act
	wipeout.template.rendering.builder.applyToElement(attribute, input, new wipeout.template.context(model));
	
	// assert
	strictEqual(input.style.display, "none");
	
	var d2 = busybody.observe(model, "visible", function () {
		d2.dispose();
		
		setTimeout(function () {
			
			strictEqual(input.style.display, "block");
			start();
		});
	});
	
	model.visible = "display: block";
	stop();
});

test("non existing attribute", function() {
	clearIntegrationStuff();
	
	$("#qunit-fixture").html("<div id='hello'></div>")
	var input = document.getElementById("hello");
	var model = busybody.makeObservable({visible: "display: none"});
	var attribute = new wipeout.template.rendering.htmlPropertyValue("wo-attr-style", "$this.visible", null, "wo-attr");
	
	// act
	wipeout.template.rendering.builder.applyToElement(attribute, input, new wipeout.template.context(model));
	
	// assert
	strictEqual(input.style.display, "none");
	
	var d2 = busybody.observe(model, "visible", function () {
		d2.dispose();
		
		setTimeout(function () {
			
			strictEqual(input.style.display, "block");
			start();
		});
	});
	
	model.visible = "display: block";
	stop();
});

test("disposal", function() {
	clearIntegrationStuff();
	
	$("#qunit-fixture").html("<div id='hello' style='display: block'></div>")
	var input = document.getElementById("hello");
	var model = busybody.makeObservable({visible: "display: none"});
	var attribute = new wipeout.template.rendering.htmlPropertyValue("wo-attr-style", "$this.visible", null, "wo-attr");
	
	// act
	var disp = wipeout.template.rendering.builder.applyToElement(attribute, input, new wipeout.template.context(model));
	
	// assert
	strictEqual(input.style.display, "none");
	
	wipeout.utils.obj.enumerateArr(disp, function (d) {
		d.dispose();
	});
	
	var d2 = busybody.observe(model, "visible", function () {
		d2.dispose();
		
		setTimeout(function () {
			
			strictEqual(input.style.display, "none");
			start();
		});
	});
	
	model.visible = "display: block";
	stop();
});