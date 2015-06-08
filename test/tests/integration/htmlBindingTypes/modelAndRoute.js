
module("integration: wipeout.htmlBindingTypes.modelAndRoute", {
    setup: integrationTestSetup,
    teardown: integrationTestTeardown
});

test("binding", function () {
	// arrange
    wo.viewModel("vms.test")
        .binding("mar", "modelAndRoute")
        .build();
    
    var model;
    application.model = {inner1:{inner2:{inner3:model = {}}}};
		
	// act
    application.synchronusTemplateChange(wo.content.createAnonymousTemplate(
        '<vms.test binding-strategy="createObservables" id="innerItem" mar="~/inner1.inner2/inner3"></vms.test>'));
	
	// assert
	strictEqual(application.templateItems.innerItem.model, model);
	strictEqual(application.templateItems.innerItem.route, "~/inner1/inner2/inner3");
    application.observe("model.inner1.inner2.inner3", function (oldVal, newVal) {
        strictEqual(newVal, newModel);
        start();
    }, {forceObserve: true});
    
    stop();
    var newModel = application.templateItems.innerItem.model = {};
});