import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { User } from 'src/app/models/users';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less']
})
export class SettingsComponent implements OnInit {
  currentUser: User;
  uploading = false;

  themePrefOptions = [
    {name: 'crimson', displayName: 'Crimson' },
    {name: 'dark-crimson', displayName: 'Dark Crimson' },
    {name: 'aqua', displayName: 'Aqua'},
    {name: 'dark-aqua', displayName: 'Dark Aqua'},
    {name: 'royal', displayName: 'Royal'},
    {name: 'dark-royal', displayName: 'Dark Royal'},
    {name: 'steel', displayName: 'Steel'},
    {name: 'midnight-field', displayName: 'Midnight Field'},
    {name: 'autumn', displayName: 'Autumn'},
    {name: 'dusk-autumn', displayName: 'Autumn at Dusk'}
  ];

  changeUsernameAndEmailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [Validators.required]),
    currPassword: new FormControl('', [Validators.required])
  });

  changePasswordForm = new FormGroup({
    newPassword: new FormControl('', Validators.required),
    confirmNewPassword: new FormControl('', Validators.required),
    currPassword: new FormControl('', Validators.required)
  });

  changeProfileForm = new FormGroup({
    newThemePref: new FormControl(this.themePrefOptions[0]),
    newBio: new FormControl('')
  });

  constructor(private authService: AuthService) {
    this.authService.currUser.subscribe(x => {
      let themePrefIndex = 0;

      switch (x.profile.themePref) {
        case 'crimson':
          themePrefIndex = 0;
          break;
        case 'dark-crimson':
          themePrefIndex = 1;
          break;
        case 'aqua':
          themePrefIndex = 2;
          break;
        case 'dark-aqua':
          themePrefIndex = 3;
          break;
        case 'royal':
          themePrefIndex = 4;
          break;
        case 'dark-royal':
          themePrefIndex = 5;
          break;
        case 'steel':
          themePrefIndex = 6;
          break;
        case 'midnight-field':
          themePrefIndex = 7;
          break;
        case 'autumn':
          themePrefIndex = 8;
          break;
        case 'dusk-autumn':
          themePrefIndex = 9;
          break;
      }

      this.changeUsernameAndEmailForm.setValue({
        email: x.email,
        username: x.username,
        currPassword: ''
      });

      this.changeProfileForm.setValue({
        newThemePref: this.themePrefOptions[themePrefIndex],
        newBio: x.profile.bio
      });

      this.currentUser = x;
    });
  }

  ngOnInit(): void {
  }

  get usernameAndEmailFields() { return this.changeUsernameAndEmailForm.controls; }
  get passwordFields() { return this.changePasswordForm.controls; }
  get changeProfileFields() { return this.changeProfileForm.controls; }

  submitUsernameAndEmailForm() {

  }

  submitChangePasswordForm() {

  }

  submitProfileForm() {

  }

  changeAvatar() {
    
  }
}
