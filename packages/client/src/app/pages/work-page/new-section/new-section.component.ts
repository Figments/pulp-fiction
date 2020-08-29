import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { dividerHandler, imageHandler } from '../../../util/quill';
import { WorksService, SectionsService } from '../../../services/content';
import { AlertsService } from '../../../modules/alerts';
import { CreateSection } from '@pulp-fiction/models/works';
import { SlugifyPipe } from '../../../pipes';

@Component({
  selector: 'app-new-section',
  templateUrl: './new-section.component.html',
  styleUrls: ['./new-section.component.less']
})
export class NewSectionComponent implements OnInit {
  loading = false; // Loading check for submission
  workId: string; // The work's ID
  workName: string; // The work's name
  latestSectionIndex: number; // The index of the current last section

  newSectionForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
    body: new FormControl('', [Validators.required, Validators.minLength(5)]),
    authorsNote: new FormControl('', [Validators.minLength(5), Validators.maxLength(2000)]),
  });

  constructor(private worksService: WorksService, private route: ActivatedRoute, 
    private alertsService: AlertsService, private router: Router, private cdr: ChangeDetectorRef,
    private sectionsService: SectionsService, private slugify: SlugifyPipe) {
    // Getting the parameters from the parent component
    this.latestSectionIndex = sectionsService.allSections.length - 1;
    this.route.parent.paramMap.subscribe(params => {
      this.workId = params.get('workId');
      this.workName = params.get('title');
    });
  }

  ngOnInit(): void {
  }

  /**
   * New section form getter.
   */
  get fields() { return this.newSectionForm.controls; }


  /**
   * Sends the new section info to the database.
   */
  submitSection() {
    this.loading = true;
    if (this.fields.title.invalid) {
      this.alertsService.warn(`Titles must be between 3 and 100 characters.`);
      this.loading = false;
      return;
    }

    if (this.fields.body.invalid) {
      this.alertsService.warn(`Body text must be greater than 5 characters.`);
      this.loading = false;
      return;
    }

    if (this.fields.authorsNote.value !== null || this.fields.authorsNote.value !== undefined) {
      if (this.fields.authorsNote.invalid) {
        this.alertsService.warn(`Author's notes must be between 5 and 2000 characters.`);
        this.loading = false;
        return;
      }
    }

    const newSection: CreateSection = {
      title: this.fields.title.value,
      body: this.fields.body.value,
      authorsNote: this.fields.authorsNote.value,
      usesFroala: true
    };
    
    this.worksService.createSection(this.workId, newSection).subscribe(section => {
      this.router.navigate([`/work/${this.workId}/${this.workName}/${this.latestSectionIndex + 1}/${this.slugify.transform(section.title)}`]);
    }, () => {
      this.loading = false;
    });
  }
}
