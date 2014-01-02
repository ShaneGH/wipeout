
var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};

(function () {    

    var contentControl = wpfko.base.view.extend(function (templateId) {
        this._super(templateId || wpfko.base.visual.getBlankTemplateId());

        this.template = contentControl.createTemplatePropertyFor(this.templateId, this);
    });
    
    contentControl.createTemplatePropertyFor = function(templateIdObservable, owner) {
        return ko.dependentObservable({
            read: function () {
                var script = document.getElementById(templateIdObservable());
                return script ? script.textContent : "";
            },
            write: function (newValue) {
                templateIdObservable(wpfko.base.contentControl.createAnonymousTemplate(newValue));
            },
            owner: owner
        });
    };
    
    var dataTemplateHash = "data-templatehash";    
    contentControl.createAnonymousTemplate = (function () {
        var templateArea = null;
        var i = Math.floor(Math.random() * 1000000000);

        return function (templateString) {

            // lazy create div to place anonymous templates
            if (!templateArea) {
                templateArea = wpfko.util.html.createElement("<div style='display: none'></div>");
                document.body.appendChild(templateArea);
            }

            templateString = templateString.replace(/^\s+|\s+$/g, '');
            var hash = contentControl.hashCode(templateString).toString();

            // if we can, reuse an existing anonymous template
            for (var j = 0, jj = templateArea.childNodes.length; j < jj; j++) {
                if (templateArea.childNodes[j].nodeType === 1 &&
                templateArea.childNodes[j].nodeName === "SCRIPT" &&
                templateArea.childNodes[j].id &&
                // first use a hash to avoid computationally expensive string compare if possible
                templateArea.childNodes[j].attributes[dataTemplateHash] &&
                templateArea.childNodes[j].attributes[dataTemplateHash].nodeValue === hash &&
                templateArea.childNodes[j].innerHTML === templateString) {
                    return templateArea.childNodes[j].id;
                }
            }

            var id = "AnonymousTemplate" + (++i);
            templateArea.innerHTML += '<script type="text/xml" id="' + id + '" ' + dataTemplateHash + '="' + hash + '">' + templateString + '</script>';
            return id;
        };
    })();

    //http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
    contentControl.hashCode = function (str) {        
        var hash = 0;
        for (var i = 0, ii = str.length; i < ii; i++) {
            var ch = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + ch;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return hash;
    };
    
    wpfko.base.contentControl = contentControl;
})();