import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

import { WorkKind, CreatePoetry, PoetryForm, Genres, ContentRating, WorkStatus } from '@pulp-fiction/models/content';
import { PoetryService } from '../../../services/user';

@Component({
  selector: 'poetry-form',
  templateUrl: './poetry-form.component.html',
  styleUrls: ['./poetry-form.component.less']
})
export class PoetryFormComponent implements OnInit {
    formTitle = `Create New Poetry`;

    categories = WorkKind;
    forms = PoetryForm;
    genres = Genres;
    ratings = ContentRating;
    statuses = WorkStatus;
    isCollection = false;

    poetryForm = new FormGroup({
        title: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
        desc: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
        body: new FormControl('', [Validators.required, Validators.minLength(3)]),
        category: new FormControl(null, [Validators.required]),
        form: new FormControl(null, [Validators.required]),
        genres: new FormControl([], [Validators.required, Validators.minLength(1), Validators.maxLength(3)]),
        rating: new FormControl(null, [Validators.required]),
        status: new FormControl(null, [Validators.required])
    });

    constructor(private poetryService: PoetryService, private snackBar: MatSnackBar, private location: Location) {}

    ngOnInit(): void {}

    get fields() { return this.poetryForm.controls; }

    goBack() {
        if (this.poetryForm.dirty && this.poetryForm.touched) {
          if (confirm(`Are you sure you want to go back? Any unsaved changes will be lost.`)) {
            this.location.back();
          } else {
            return;
          }
        } else {
          this.location.back();
        }
      }

    submitForm() {
      if (this.poetryForm.invalid) {
          this.snackBar.open(`Looks like something's wrong with the stuff you've entered.`);
          return;
      }

      const poetryInfo: CreatePoetry ={
          title: this.fields.title.value,
          desc: this.fields.desc.value,
          body: this.fields.body.value,
          category: this.fields.category.value,
          collection: this.isCollection,
          form: this.fields.form.value,
          genres: this.fields.genres.value,
          rating: this.fields.rating.value,
          status: this.fields.status.value
      };

      this.poetryService.createPoetry(poetryInfo).subscribe(() => {
          this.location.back();
      });
  }
}
