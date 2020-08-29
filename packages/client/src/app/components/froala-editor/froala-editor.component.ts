import 'froala-editor/js/plugins/align.min.js'; // import the alignment plugin
import 'froala-editor/js/plugins/code_view.min.js' // allow user to view (and edit) the HTML directly
import 'froala-editor/js/plugins/colors.min.js'; // import custom colors
import 'froala-editor/js/plugins/font_size.min.js'; // import custom font sizes
import 'froala-editor/js/plugins/fullscreen.min.js' // import the fullscreen mode plugin
import 'froala-editor/js/plugins/lists.min.js' // import the fullscreen mode plugin
import 'froala-editor/js/plugins/paragraph_format.min.js' // import the header styles formatter
import 'froala-editor/js/plugins/quote.min.js' // Adds the "quote" option
//import 'froala-editor/js/third_party/spell_checker.min'
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'froala-pulp-fiction-editor',
    templateUrl: './froala-editor.component.html',
    styleUrls: [ './froala-editor.component.less' ],
    encapsulation: ViewEncapsulation.None, // Disable CSS encapsulation so the .less file can affect the child froala-editor component
})

export class FroalaEditorComponent implements OnInit {

    options: Object = {
        attribution: false,
        htmlAllowComments: false,
        htmlRemoveTags: ['script', 'style', 'base'],    
        pasteDeniedAttrs: [ 'class', 'id', 'contenteditable' ],
        htmlAllowedStyleProps: ['text-align'],
        events: {
          'paste.beforeCleanup': this.pasteBeforeCleanup
        },        
        theme: "offprint",
        toolbarButtons: {
          moreText: {
            buttons: [ 'paragraphFormat', 'bold', 'italic', 'underline',  'strikeThrough', 'fontSize' ],
            align: 'left',
            buttonsVisible: 6
          },
          moreParagraph: {
            buttons: [ 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'formatUL', 'formatOL' ],
            align: 'left',
            buttonsVisible: 3
          },
          moreRich: {
            buttons: [ 'insertHR', 'insertLink', 'insertImage', 'quote', 'clearFormatting' ],
            align: 'left',
            buttonsVisible: 3,
          },
          moreMisc: {
            buttons: [ 'undo', 'redo', 'fullscreen', 'html'],
            align: 'right',
            buttonsVisible: 2
          }
        }
      }
    
      pasteBeforeCleanup(pastedHtml: string): string {    
        // Strip out spurious newline characters. <br> or bust, baby
        return pastedHtml.replace(/(?:\r\n|\r|\n)/g, '');
      }

    constructor() {}

    ngOnInit(): void {

    }
}
