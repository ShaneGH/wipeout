module("integration: wipeout.template.initialization.htmlAttributes.wo-content", {
    setup: function() {
    },
    teardown: function() {
    }
});

test("success", function() {
	$("#qunit-fixture").html("<div id='hello'></div>")
	var div = document.getElementById("hello");
	var model = busybody.makeObservable({theVal: 234});
	var attribute = new wipeout.template.rendering.htmlPropertyValue("wo-content", "$this.theVal");
	
	// act
	var disp = wipeout.template.rendering.builder.applyToElement(attribute, div, new wipeout.template.context(model));
	
	// assert
	strictEqual(div.innerHTML, "234");
	
	
	busybody.observe(model, "theVal", function () {
		setTimeout(function () {
			strictEqual(div.innerHTML, "456");
			disp[0].dispose();
			start();
			
			model.theVal = 567;	// should not trigger change in element		
		});
	});
	
	model.theVal = 456;
	stop(2);
});