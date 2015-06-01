wo.viewModel("wipeoutDocs.viewModels.components.versioned")
.templateId(wo.content.createAnonymousTemplate('<div class="well">\
    <fieldset>\
        <legend>From version {{$this.version}}</legend>\
        <wo.view template-id="$this.contentTemplateId" share-parent-scope="true"></wo.view>\
    </fieldset>\
</div>'))
.initialize(function () {
    wipeout.viewModels.content.createTemplatePropertyFor(this, "contentTemplateId", "contentTemplate");
})
.parser("version", "float")
.parser("contentTemplate", "template")
.binding("contentTemplate", "templateProperty")
.build();