import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FrontendUser, Roles } from '@pulp-fiction/models/users';
import { Doc, EditDoc } from '@pulp-fiction/models/docs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth';
import { DocsService } from '../../../../services/admin';
import { AlertsService } from '../../../../modules/alerts';
import { Router, ActivatedRoute } from '@angular/router';
import { imageHandler, dividerHandler } from '../../../../util/quill';

@Component({
  selector: 'app-edit-doc',
  templateUrl: './edit-doc.component.html',
  styleUrls: ['./edit-doc.component.less']
})
export class EditDocComponent implements OnInit {
  currentUser: FrontendUser;
  docId: string;
  docToEdit: Doc;
  rolesList = Roles;
  loading = false;
  submitting = false;

  editorFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'divider', 'link', 'blockquote', 'code', 'image',
    'align', 'center', 'right', 'justify',
    'list', 'bullet', 'ordered'
  ];

  editDocForm = new FormGroup({
    docName: new FormControl('', [Validators.required]),
    docBody: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  constructor(private authService: AuthService, private docsService: DocsService,
    private cdr: ChangeDetectorRef, private alertsService: AlertsService, private router: Router,
    private route: ActivatedRoute) {
      this.authService.currUser.subscribe(x => { this.currentUser = x; });
      this.fetchData();
    }

  ngOnInit(): void {
  }

  /**
   * Fetches the relevant data from the database.
   */
  private fetchData() {
    this.loading = true;
    this.route.paramMap.subscribe(params => {
      this.docId = params.get('docId');
      this.docsService.fetchForEdit(this.docId).subscribe(doc => {
        this.docToEdit = doc;
        this.editDocForm.setValue({
          docName: doc.docName,
          docBody: doc.docBody
        });
        this.loading = false;
      });
    });
  }

  /**
   * Edit doc form getter.
   */
  get fields() { return this.editDocForm.controls; }

  /**
   * Required for Quill
   */
  triggerChangeDetection() {
    return this.cdr.detectChanges();
  }

  /**
   * Gets the Quill Editor object after the editor's creation in the template HTML
   * 
   * @param event The editor object
   */
  onEditorCreated(event: any) {
    let toolbar = event.getModule('toolbar');
    toolbar.addHandler('divider', dividerHandler);
    toolbar.addHandler('image', imageHandler);
  }

  /**
   * Submits document edits to the database.
   */
  submitDocEdits() {
    if (this.fields.docName.invalid) {
      this.alertsService.warn(`Document name cannot be empty.`);
      return;
    }

    if (this.fields.docBody.invalid) {
      this.alertsService.warn(`Document body cannot be empty.`);
      return;
    }
    this.submitting = true;
    if (!this.docToEdit.usesFroala) {
      // TODO: Instead of sending up Quill stuff, get body HTML and send it up
      throw new Error("Not implemented. This is a developer error and should be FIXED, YOU SLOPPY MUPPETS");
    }
    const docToEdit: EditDoc = {
      _id: this.docId,
      docTitle: this.fields.docName.value,
      docBody: this.fields.docBody.value,
      usesFroala: true
    };

    this.docsService.editDoc(docToEdit).subscribe(() => {
      this.submitting = false;
      this.router.navigate(['/dashboard/docs']);
    })
  }
}
