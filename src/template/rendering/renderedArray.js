
Class("wipeout.template.rendering.renderedArray", function () {
    
	var renderedArray = busybody.disposable.extend(function renderedArray (array, parent) {
		///<summary>Helper for rendering arrays</summary>
        ///<param name="array" type="Array">The array</param>
        ///<param name="parent" type="wipeout.template.rendering.renderedContent">The renderedContent to help</param>
				
		this._super();
		
		///<summary type="wipeout.template.rendering.renderedContent">The parent to help</summary>
		this.parent = parent;
		
		///<summary type="Array">The array</summary>
		this.array = array;
		if (this.parent.parentRenderContext && this.parent.parentRenderContext.$this instanceof wipeout.viewModels.list && array === this.parent.parentRenderContext.$this.items)
			///<summary type="wo.list">The list if the array belongs to one</summary>
			this.list = this.parent.parentRenderContext.$this;
		
		///<summary type="Array">Cache the child renderedContents </summary>
		this.children = [];
        
        if (this.list) {
			if (this.list.$getChild) throw "These items are being rendered already.";
			
            this.list.$getChild = (function (i) {
				if (arguments.length === 0) {
					var op = this.children.slice();
					for (var i = 0, ii = op.length; i < ii; i++)
						op[i] = op[i].renderedChild;
						
					return op;
				}
				
				return this.children[i] ? this.children[i].renderedChild : undefined; 
			}).bind(this);
		}
	});
	
	renderedArray.prototype.remove = function (item) {
		///<summary>Clean up item before removal</summary>
        ///<param name="item" type="wipeout.template.rendering.renderedContent">The item</param>
		
		if (this.list)
			this.list.removedItem(item.renderedChild);

		delete item.renderedChild;
		delete item.forItem;

		item.dispose();
	};
	
	var mysteryItem = {};
	renderedArray.prototype.render = function (changes) {
		///<summary>Alter the DOM based on array changes</summary>
        ///<param name="changes" type="Array">The array changes</param>
		
		var removed = [];
		enumerateArr(changes, function (change) {
			if (change.type === "splice") {
				var args = new Array(change.addedCount);
				for (var i = 0; i < change.addedCount; i++) args[i] = mysteryItem;
				args.splice(0, 0, change.index, change.removed.length);

				removed.push.apply(removed, this.children.slice(change.index, change.index + change.removed.length));
				this.children.splice.apply(this.children, args);
			} else if (!isNaN(parseInt(change.name))) {
				if (this.children[change.name] !== mysteryItem)
					removed.push(this.children[change.name]);

				this.children[change.name] = mysteryItem;
			}
		}, this);

		// ignore items which were added and then removed
		for (var k = removed.length - 1; k >= 0; k--)
			if (removed[k] === mysteryItem)
				removed.splice(1, k);

		// find added items
		for (var i = 0, ii = this.children.length; i < ii; i++) {
			if (this.children[i] !== mysteryItem) continue;

			// find if added item had been previously removed
			for (var k = 0, kk = removed.length; k < kk; k++) {
				if (removed[k].forItem === this.array[i]) {
					var item = removed.splice(k, 1)[0];
					if (i === 0)
						this.parent.prepend(item);
					else
						this.children[i - 1].insertAfter(item);

					item.renderContext.$index.value = i;
					item.rename("item: " + i);
					this.children[i] = item;

					break;
				}
			}

			// item was moved
			if (k != kk) 
				continue;

			var placeholder = document.createElement("script");
			if (i === 0)
				this.parent.prepend(placeholder);
			else
				this.children[i - 1].insertAfter(placeholder);

			this.children[i] = new wipeout.template.rendering.renderedContent(placeholder, "item: " + i, this.parent.parentRenderContext);
			var vm = this.list ? this.list._createItem(this.array[i]) : this.array[i];
			this.children[i].render(vm, i);
			this.children[i].forItem = this.array[i];
			if (this.list) {
				this.children[i].renderedChild = vm;
				this.list.onItemRendered(vm);
			}
		};

		enumerateArr(removed, this.remove, this);
	};
	
	renderedArray.prototype.dispose = function () {
		///<summary>Dispose of this helper</summary>
		
		this._super();

		enumerateArr(this.children, this.remove, this);
		this.children.length = 0;

		if (this.list) {
			delete this.list.$getChild;
			delete this.list;
		}
		
		delete this.array;
	};
	
	return renderedArray;
});