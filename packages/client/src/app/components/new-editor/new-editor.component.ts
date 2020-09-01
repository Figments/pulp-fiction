import * as CKEditor from './ckeditor.js';

import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { ControlContainer, FormGroupDirective, FormGroup } from '@angular/forms';

@Component({
  selector: 'new-pulp-fiction-editor',
  templateUrl: './new-editor.component.html',
  styleUrls: ['./new-editor.component.less'],
  encapsulation: ViewEncapsulation.None, // Disable CSS encapsulation so the .less file can affect the child editor component  
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})

export class NewEditorComponent implements OnInit {
  @Input() minHeight: string;
  @Input() maxHeight: string;
  @Input() parentForm: FormGroup;
  @Input() controlName: string;

  editor = CKEditor;
  config: Object = {
    // Todo: configure toolbar properly
    // https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/configuration.html for details
    toolbar: [ 'heading', '|', 'bold', 'italic' ]
  };

  pasteBeforeCleanup(pastedHtml: string): string {
    // Strip out spurious newline characters. <br> or bust, baby
    return pastedHtml.replace(/(?:\r\n|\r|\n)/g, '');
  }

  constructor() { }

  ngOnInit() {
    if (this.minHeight) {
      document.documentElement.style.setProperty('--editor-min-height', this.minHeight);
    } else {
      document.documentElement.style.setProperty('--editor-min-height', '300px');
    }

    if (this.maxHeight) {
      document.documentElement.style.setProperty('--editor-max-height', this.maxHeight);
    } else {
      document.documentElement.style.setProperty('--editor-max-height', '500px');
    }
  }

}
