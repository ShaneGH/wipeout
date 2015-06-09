(function () {
    
    //wipeout.profile.profile();
    aRoutedEvent = "rev";
    
    initializeView = wipeout.viewModels.content.extend(function initializeView() {
        this._super();
        
        this.setTemplate = "<div id='theDiv'>If this text is still here something went wrong</div>\
<wo.content id='thecontent' set-template--s='If this text is still here something went wrong'></wo.content>";
    });
    
    initializeView.prototype.onRendered = function() {
        this._super();
        
        this.templateItems.theDiv.innerHTML = this.item1 + " " + this.item2;
        this.templateItems.thecontent.setTemplate = this.item1 + " " + this.item2;
    };
    
    childView = wipeout.viewModels.content.extend(function childView() {
        this._super();
        this.value = "initial";
    });
    
    rootView = wipeout.viewModels.content.extend(function rootView() {
        this._super("STPTemplates/rootView.html");
        
        this.justDone = "";
        
        this.registerRoutedEvent(aRoutedEvent, function() { this.templateItems.routedEvent.innerHTML = "routed event caught"; }, this);
        
        this.childView = new wo.content();
        this.childView.setTemplate = "<div>Child view</div>";
    });
    
    rootView.prototype.next = function() {
        this.current = this.current || 0;
        
        if(actions.length - 1 < this.current) {
            this.justDone = "FINISHED";
            return;
        }
        
        this.justDone = actions[this.current++](this);
    };
    
    rootView.prototype.profile = function() {
        wipeout.profile.profile();
    };
            
    var model = new busybody.observable();
    model.rootTitle = "People";
    model.items = new busybody.array([busybody.makeObservable({itemId: 22, itemName: "John"}), busybody.makeObservable({itemId: 25, itemName: "Barry"})]);
    model.deepItem = busybody.makeObservable({
        item: busybody.makeObservable({
            value: "the value"
        })
    });
    
    theModel = model;
        
    model.computed("totalOfIds", function() {
        var total = 0;
        for(var i = 0, ii = this.items.length; i < ii; i++)
            total += this.items[i].itemId;
        
        return total;
    });
})();

var actions = [
    /**/function(view) {
        view.templateItems.listTest.templateItems.theInnerlist1.getItemViewModel(0).triggerRoutedEvent(aRoutedEvent, {});
        return "Triggered routed event";
    }, function(view) {
        view.templateItems.NestedDiv.innerHTML = "this is the nested div";
        return "Added text to nested div";
    }, function(view) {
        view.model.rootTitle = "Persons";
        return "Changed title";
    }, function(view) {
        theModel.items.push(busybody.makeObservable({itemId: 66, itemName: "Mycroft"}));
        return "Added person (Mycroft)";
    }, function(view) {
        view.templateItems.listTest.templateItems.theInnerlist1.items.splice(0, 1);
        return "Removed from one item source \"items\" (John). Expect the other to follow suit.";
    }, function(view) {
        view.templateItems.listTest.templateItems.theInnerlist1.getItemViewModel(0).templateItems.stampMe.innerHTML = "stamped template";
        view.templateItems.listTest.templateItems.theInnerlist2.getItemViewModel(0).templateItems.stampMe.innerHTML = "stamped template";
        return "Stamp a person view template.";
    },/**/ function(view) {
        view.model.items.reverse()
        return "Reordered people";
    }, function(view) {
        view.model.items.splice(1, 1);
        return "Removed person";
    }, function(view) {
        view.model.items[0].itemId = 78;
        return "Changed first person id, total ids should also be updated";
    }, function(view) {
        view.model.items.replace(0, busybody.makeObservable({itemId: 54, itemName: "LJBLKJB"}));
        return "Changed first person.";
    }, function(view) {
        view.model.items[0].itemId = 896;
        return "Changed first person id, total ids should also be updated";
    }, function(view) {
        view.model.items.replace(0, {itemId: 434, itemName: "someone else"});
        return "Changed first person, destroyed observables";
    }, function(view) {
        view.model.deepItem.item.value = "value 1";
        return "Changed value 1";
    }, function(view) {
        view.model.deepItem.item = { value: "value 2" };
        return "Changed value 2";
    }, function(view) {
        view.model.deepItem = busybody.makeObservable({item: busybody.makeObservable({ value: "value 3" })});
        return "Changed value 3";
    }, function(view) {
        view.model.deepItem.item.value = "value 4";
        return "Changed value 4";
    }, function(view) {
        view.model = {deepItem:{item:{value:"newModel"}}};
        return "Swapped out root model";
    }, function(view) {
        view.setTemplate = "<div>Cleared down</div>";
        return "Clear down view";
    }, 
];