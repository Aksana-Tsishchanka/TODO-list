/*global $,Handlebars*/
var TemplateManager = (function () {
    "use strict";

    var itemTemplate,
        noteDisplayTemplate;

    return {
        init: function () {
            var itemTemplateSource = $('#item-partial').html();
            itemTemplate = Handlebars.compile(itemTemplateSource);
            Handlebars.registerPartial('item', itemTemplateSource);
            noteDisplayTemplate = Handlebars.compile($("#note-template").html());
        },
        applyNoteTemplate: function (noteContext) {
            return noteDisplayTemplate(noteContext);
        },
        applyItemTemplate: function (itemContext) {
            return itemTemplate(itemContext);
        }
    };
}());