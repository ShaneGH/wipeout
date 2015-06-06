
Class("wipeout.debug", function () { 
    var jQ = function() {
        if(!window.jQuery)
            throw "This debug tool requires jQuery";
    };
    
    return {
        renderedItems: function(rootNode /*optional*/, renderedItemType /*optional*/) {
            
            var values = [], vm;
            var recursive = function(node) {
                if(node) {
                    switch(node.nodeType) {
                        case 1:
                            enumerateArr(node.childNodes, recursive);
                        case 8:
                            if((vm = wipeout.utils.viewModels.getViewModel(node)) &&
                               values.indexOf(vm) === -1 &&
                              (!renderedItemType || vm.constructor === renderedItemType)) {
                                values.push(vm);
                            }
                    }
                }
            };
            
            recursive(rootNode || document.getElementsByTagName("body")[0]);
            return values;
        }
    }
});