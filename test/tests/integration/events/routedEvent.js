
module("wipeout.events.routedEvent, integration", {
    setup: integrationTestSetup,
    teardown: integrationTestTeardown
});
	
test("routed event", function() {
    // arrange
    var aRoutedEvent = new wo.routedEvent();
    var open = "<wo.content-control id='item'><template>", close = "</template></wo.content-control>";
    application.template = open + open + open + "<div>hi</div>" + close + close + close;
    
	application.onRendered = function () {
		// arrange
		application.registerRoutedEvent(aRoutedEvent, function() { this.__caught = true; }, application);
		application.templateItems.item.registerRoutedEvent(aRoutedEvent, function() { this.__caught = true; }, application.templateItems.item);
		
		// act
		application.templateItems.item.templateItems.item.templateItems.item.triggerRoutedEvent(aRoutedEvent, {});

		// assert
		ok(application.__caught);
		ok(application.templateItems.item.__caught);
		
		start();
	};
	
	stop();
});
	
test("routed event, handled", function() {
    // arrange
    var aRoutedEvent = new wo.routedEvent();
    var open = "<wo.content-control id='item'><template>", close = "</template></wo.content-control>";
    application.template = open + open + open + "<div>hi</div>" + close + close + close;
	
	application.onRendered = function () {
	
		// arrange
		application.registerRoutedEvent(aRoutedEvent, function() { this.__caught = true; }, application);
		application.templateItems.item.registerRoutedEvent(aRoutedEvent, function() { 
			this.__caught = true; 
			arguments[0].handled = true;
		}, application.templateItems.item);

		// act
		application.templateItems.item.templateItems.item.templateItems.item.triggerRoutedEvent(aRoutedEvent, {});

		// assert
		ok(!application.__caught);
		ok(application.templateItems.item.__caught);
		
		start();
	};
	
	stop();
});