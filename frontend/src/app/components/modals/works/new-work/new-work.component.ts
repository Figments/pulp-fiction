import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import * as models from 'src/app/models/works';
import { dividerHandler } from 'src/app/util/quill';
import { WorksService } from 'src/app/services/content';
import { AlertsService } from 'src/app/modules/alerts';

@Component({
  selector: 'app-new-work',
  templateUrl: './new-work.component.html',
  styleUrls: ['./new-work.component.less']
})
export class NewWorkComponent implements OnInit {
  close: any; // Alias for Toppy
  loading = false; // Loading check for submission

  categories = models.Categories; // Alias for categories
  fandoms = models.Fandoms; // Alias for fandoms
  genresFiction = models.GenresFiction; // Alias for fiction genres
  genresPoetry = models.GenresPoetry; // Alias for poetry genres
  rating = models.ContentRating; // Alias for content ratings
  status = models.WorkStatus; // Alias for work statuses

  editorFormats = [
    'bold', 'italic', 'underline', 'strike',
    'divider', 'link', 'blockquote', 'code',
    'align', 'center', 'right', 'justify',
    'list', 'bullet', 'ordered'
  ];

  newWorkForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
    shortDesc: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(250)]),
    longDesc: new FormControl('', [Validators.required, Validators.minLength(3)]),
    thisCategory: new FormControl(null, Validators.required),
    theseFandoms: new FormControl([]),
    theseGenres: new FormControl([], Validators.required),
    rating: new FormControl(null, Validators.required),
    status: new FormControl(null, Validators.required)
  });

  constructor(private worksService: WorksService, private cdr: ChangeDetectorRef, private alertsService: AlertsService) { }

  ngOnInit(): void {
  }

  /**
   * Getter for the new work form.
   */
  get fields() { return this.newWorkForm.controls; }

  /**
   * Required for the QuillJS editor.
   */
  triggerChangeDetection() {
    this.cdr.detectChanges();
  }

  /**
   * Gets the Quill Editor object after the editor's creation in the template HTML
   * 
   * @param event The editor object
   */
  onEditorCreated(event: any) {
    let toolbar = event.getModule('toolbar');
    toolbar.addHandler('divider', dividerHandler);
  }

  /**
   * Checks to see if the selected category is one of the two fiction categories.
   */
  isFiction() {
    if (this.fields.thisCategory.value === 'OriginalFiction' ||
        this.fields.thisCategory.value === 'Fanfiction') {
          return true;
        } else {
          return false;
        }
  }

  /**
   * Checks to see if the selected category is poetry
   */
  isPoetry() {
    if (this.fields.thisCategory.value === 'Poetry') {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Checks to see if the selected category is fanfiction.
   */
  isFanfiction() {
    if (this.fields.thisCategory.value === 'Fanfiction') {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Asks if the users actually wants to close the form if its contents have already been changed.
   * 
   * Otherwise, it closes the form immediately.
   */
  askCancel() {
    if (this.newWorkForm.dirty) {
      if (confirm('Are you sure? Any unsaved changes will be lost.')) {
        this.close();
      } else {
        return;
      }
    } else {
      this.close();
      return;
    }
  }

  /**
   * Submits the work to the backend.
   */
  submitWork() {
    this.loading = true;
    const newWork: models.CreateWork = {
      title: this.fields.title.value,
      shortDesc: this.fields.shortDesc.value,
      longDesc: this.fields.longDesc.value,
      category: this.fields.thisCategory.value,
      fandoms: this.fields.theseFandoms.value,
      genres: this.fields.theseGenres.value,
      rating: this.fields.rating.value,
      status: this.fields.status.value,
    };

    this.worksService.createWork(newWork).subscribe(() => {
      this.loading = false;
      this.close();
    }, err => {
      this.loading = false;
      this.alertsService.error('Something went wrong! Try again in a little bit.');
    });
  }
}
