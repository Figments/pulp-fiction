import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../services/auth';
import { DocsService } from '../../../../services/admin';
import { AlertsService } from '../../../../modules/alerts';
import { FrontendUser, Roles } from '@pulp-fiction/models/users';
import { CreateDoc } from '@pulp-fiction/models/docs';

@Component({
  selector: 'app-create-doc',
  templateUrl: './create-doc.component.html',
  styleUrls: ['./create-doc.component.less']
})
export class CreateDocComponent implements OnInit {
  currentUser: FrontendUser;
  rolesList = Roles;
  loading = false;

  createDocForm = new FormGroup({
    id: new FormControl('', [Validators.required]),
    docName: new FormControl('', [Validators.required]),
    docDesc: new FormControl('', [Validators.required]),
    docBody: new FormControl('', [Validators.required]),
    approvedRoles: new FormControl([], [Validators.required]),
  });

  constructor(private authService: AuthService, private docsService: DocsService,
    private alertsService: AlertsService, private router: Router) {
      this.authService.currUser.subscribe(x => { this.currentUser = x; });
    }

  ngOnInit(): void {
  }

  /**
   * Create doc form getter.
   */
  get fields() { return this.createDocForm.controls; }

  /**
   * Submits document to the database.
   */
  submitDoc() {
    if (this.fields.id.invalid) {
      this.alertsService.warn(`ID field cannot be empty.`);
      return;
    }

    if (this.fields.docName.invalid) {
      this.alertsService.warn(`Document name cannot be empty.`);
      return;
    }

    if (this.fields.docDesc.invalid) {
      this.alertsService.warn(`Document description cannot be empty.`);
      return;
    }

    if (this.fields.docBody.invalid) {
      this.alertsService.warn(`Document body cannot be empty.`);
      return;
    }

    if (this.fields.approvedRoles.invalid || this.fields.approvedRoles.value.length === 0) {
      this.alertsService.warn(`Approved roles cannot be empty.`);
      return;
    }

    this.loading = true;
    const docToCreate: CreateDoc = {
      _id: this.fields.id.value,
      docName: this.fields.docName.value,
      docDescription: this.fields.docDesc.value,
      docBody: this.fields.docBody.value,
      approvedRoles: this.fields.approvedRoles.value,
      usesFroala: true
    };

    this.docsService.createDoc(this.currentUser.roles as Roles[], docToCreate).subscribe(() => {
      this.loading = false;
      this.router.navigate(['/dashboard/docs']);
    })
  }
}
