 
Class("wipeout.viewModels.list", function () {
    
	var deafaultTemplateId;
	var defaultItemTemplateId;
    var list = wipeout.viewModels.content.extend(function list(templateId, itemTemplateId, model) {
        ///<summary>Bind a list of models (items) to a list of view models and render accordingly</summary>
        ///<param name="templateId" type="String" optional="true">The template id. If not set, defaults to a div to render items</param>
        ///<param name="itemTemplateId" type="String" optional="true">The initial template id for each item</param>
        ///<param name="model" type="Any" optional="true">The initial model to use</param>
        
        this._super(templateId || 
					deafaultTemplateId ||
					(deafaultTemplateId = wipeout.viewModels.content.createAnonymousTemplate('{{$this.items}}')), model);

        ///<Summary type="ko.observable" generic0="String">The id of the template to render for each item</Summary>
        this.itemTemplateId = itemTemplateId;

        ///<Summary type="ko.observable" generic0="String">The template which corresponds to the itemTemplateId for this object</Summary>
        this.itemTemplate = "";
        
        wipeout.viewModels.content.createTemplatePropertyFor(this, "itemTemplateId", "itemTemplate");
        
        ///<Summary type="busybody.array">An array of models to render</Summary>
        this.items = new busybody.array();
        this.registerDisposable(this.items);
        
        this.registerRoutedEvent(list.removeItem, this._removeItem, this);
        
        this.observe("itemTemplateId", function (oldVal, newVal) {
			enumerateArr(this.getItemViewModels(), function (vm) {
				if (vm.__createdBylist)
					vm.templateId = newVal;
			});
        }, {context: this});
    });
    
    list.addGlobalParser("itemTemplate", "template");
    list.addGlobalBindingType("itemTemplate", "templateProperty");
        
    list.removeItem = {};
	
    list.prototype._removeItem = function(e) {
        ///<summary>Remove an item from the item source</summary>
        ///<param name="e" type="ObjectArgs" optional="false">The item to remove</param>
    
        if(this.items.indexOf(e.data) !== -1) {
            this.removeItem(e.data);
            e.handled = true;
        }
    };
    
    list.prototype.getItemViewModels = function() {
        ///<summary>Get the child view models if any</summary>
        ///<returns type="Array">The items</returns>
    
        return this.$getChild ?
            this.$getChild() :
			[];
	};
    
    list.prototype.getItemViewModel = function(index) {
        ///<summary>Get the child view model at a given index</summary>
        ///<param name="index" type="Number" optional="false">The index of the view model to get</param>
        ///<returns type="Any">The view model</returns>
    
        return this.$getChild ?
            this.$getChild(index) :
            undefined;
    };
    
    list.prototype.removeItem = function(item) {
        ///<summary>Remove an item from the item source</summary>
        ///<param name="item" type="Any" optional="false">The item to remove</param>
    
        this.items.remove(item);
    };
    
    list.prototype.removedItem = function (item) {
        ///<summary>Disposes of deleted items</summary> 
        ///<param name="item" type="Any" optional="false">The item deleted</param>  
        
        this.onItemRemoved(item);
        
        if (item instanceof busybody.disposable)
            item.dispose();
    };
    
    //virtual
    list.prototype.onItemRemoved = function (item) {
        ///<summary>Disposes of deleted items</summary> 
        ///<param name="item" type="Any" optional="false">The item deleted</param>  
    };
    
    //virtual
    list.prototype.onItemRendered = function (item) {
        ///<summary>Called after a new item list is rendered</summary>
        ///<param name="item" type="wo.view" optional="false">The item rendered</param>
    };

    list.prototype._createItem = function (model) {
        ///<summary>Defines how a view model should be created given a model. The default is to create a view and give it the itemTemplateId</summary>
        ///<param name="model" type="Any" optional="false">The model for the view to create</param>
        ///<returns type="wo.view">The newly created item</returns>
        
        var item = this.createItem(model);
        return item;
    };

    // virtual
    list.prototype.createItem = function (model) {
        ///<summary>Defines how a view model should be created given a model. The default is to create a view and give it the itemTemplateId</summary>
        ///<param name="model" type="Any" optional="false">The model for the view to create</param>
        ///<returns type="wo.view">The newly created item</returns>
		
        var vm = new wipeout.viewModels.view(this.itemTemplateId || defaultItemTemplateId || (defaultItemTemplateId = wipeout.viewModels.content.createAnonymousTemplate("{{$this.model}}")), model);
		vm.__createdBylist = true;
		return vm;
    };

    return list;
});