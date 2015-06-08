
module("integration: wipeout.htmlBindingTypes.getter", {
    setup: integrationTestSetup,
    teardown: integrationTestTeardown
});

test("binding", function () {
    
	// arrange
    wo.viewModel("vms.test2")
        .binding("get", "getter")
        .build();
    
    var model;
    application.model = {inner1:{inner2:{inner3:model = {}}}};
		
	// act
    application.synchronusTemplateChange(wo.content.createAnonymousTemplate(
        '<vms.test2 binding-strategy="createObservables" id="innerItem" get="$model.inner1.inner2.inner3"></vms.test2>'));
	
	// assert
	strictEqual(application.templateItems.innerItem.get(), model);
});