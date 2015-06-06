(function () {
    
    var t1, t2;    
    // execute after wipeout is initialized
    setup.push(function () {
        t1 = wipeout.viewModels.content.createAnonymousTemplate('<form wo-submit="$this.submit(element)" wo-attr-class="$this.class" wo-attr-style="$this.style">\
            <wo.view id="$this.formTemplateId" share-parent-scope="true"></wo.view>\
        </form>');
        t2 = wipeout.viewModels.content.createAnonymousTemplate('<div wo-attr-class="$this.class" wo-attr-style="$this.style">\
            <wo.view id="$this.formTemplateId" share-parent-scope="true"></wo.view>\
        </div>');
    });
    
    var restForm = viewModel("wipeout.viewModels.restForm")
        .value("class", "")
        .value("style", "")
        .templateProperty("formTemplate")
        .rendered(function () {
            var t = t1;
            debugger;
        })
        .build();
    
    restForm.submit = function (element) {
        
        // form might be a child vm
        var form = wipeout.utils.html.getViewModel(element);
        if (form instanceof wipeout.viewModels.restForm)
            form.submitForm();
    };
    
    restForm.submitForm = function () {
        if (!this.model)
            return;
        
        //TODO: non standard
        if (!this.model.$urlBuilder && !this.url) {
            warn("Cannot submit form, there is no url defined on the model or the form");
            return;
        }
        
    //    if (this.urlRelative)
            
    };
}());