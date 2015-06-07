(function () {
    
    var formTemplate, divTemplate;    
    // execute after wipeout is initialized
    setup.push(function () {
        //TODM: style and class attributes
        formTemplate = wipeout.viewModels.content.createAnonymousTemplate('<form wo-submit="$this.submit(element)" wo-attr-class="$this.class" wo-attr-style="$this.style">\
            <wo.view template-id="$this.formTemplateId" share-parent-scope="true"></wo.view>\
        </form>');
        divTemplate = wipeout.viewModels.content.createAnonymousTemplate('<div wo-attr-class="$this.class" wo-attr-style="$this.style">\
            <wo.view template-id="$this.formTemplateId" share-parent-scope="true"></wo.view>\
        </div>');
    });
    
    var restForm = viewModel("wipeout.viewModels.restForm")
        .value("class", "")
        .value("style", "")
        .templateProperty("formTemplate")
        .rendered(function () {
            if (this.$hasBeenRendered)
                return;
            
            this.$hasBeenRendered = true;
            var current = this.$domRoot.openingTag;
            while (current) {
                if (current.nodeType === 1 && current.localName === "form") {
                    this.synchronusTemplateChange(divTemplate);
                    return;
                }
                    
                current = current.parentElement;
            }
            
            this.synchronusTemplateChange(formTemplate);
        })
        .build();
    
    restForm.submit = function (element) {
        
        // form might be a child vm
        //TODM document.activeElement
        var form = wipeout.utils.viewModels.getViewModel(document.activeElement);
        if (form instanceof wipeout.viewModels.restForm)
            form.submitForm();
        else
            this.submitForm();
    };
    
    restForm.submitForm = function () {
        
        if (!this.model)
            return;
        
        if (this.url)
            wipeout.services.url(this.model, this.url);
        
        //TODO: non standard
        if (!this.model.$urlBuilder && !this.url) {
            warn("Cannot submit form, there is no url defined on the model or the form");
            return;
        }
        
    //    if (this.urlRelative)
            
    };
}());