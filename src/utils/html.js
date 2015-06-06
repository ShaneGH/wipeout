
Class("wipeout.utils.html", function () {
    
    var createTemplatePlaceholder = function(forViewModel) {
        ///<summary>Create a html node so serve as a temporary template while the template loads asynchronously</summary>
        ///<param name="forViewModel" type="wo.view">The view to which this temp template will be applied. May be null</param>
        ///<returns type="HTMLElement">A new html element to use as a placeholder template</returns>
        
        var el = document.createElement("span");
        el.innerHTML = "Loading template";
        return el;
    };
    
    function html() {
    };
    
    html.createTemplatePlaceholder = createTemplatePlaceholder;
    
    return html;    
});