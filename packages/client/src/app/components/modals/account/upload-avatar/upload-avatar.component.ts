import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImageCroppedEvent, Dimensions } from 'ngx-image-cropper';
import { FileUploader } from 'ng2-file-upload';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { AuthState } from '../../../../shared/auth';

import { AlertsService } from '../../../../modules/alerts';
import { AuthService } from '../../../../services/auth';
import { HttpError } from '../../../../models/site';
import { FrontendUser } from '@pulp-fiction/models/users';

@Component({
  selector: 'app-upload-avatar',
  templateUrl: './upload-avatar.component.html',
  styleUrls: ['./upload-avatar.component.less']
})
export class UploadAvatarComponent implements OnInit {
  @Select(AuthState.user) currentUser$: Observable<FrontendUser>;
  currentUserSubscription: Subscription;
  currentUser: FrontendUser;

  imageChangedEvent: Event;
  croppedImage: any = '';

  fileToReturn: File;

  showCropper = false;
  
  uploading = false;
  uploader: FileUploader = new FileUploader({
    url: '/api/auth/upload-avatar',
    itemAlias: 'avatar'
  });

  constructor(private authService: AuthService, private dialogRef: MatDialogRef<UploadAvatarComponent>, private snackbar: MatSnackBar) {
    this.currentUserSubscription = this.currentUser$.subscribe(x => {
      this.currentUser = x;
    });
  }

  ngOnInit(): void {
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent): File {
    this.croppedImage = event.base64;

    this.fileToReturn = this.base64ToFile(event.base64, 'avatar');

    console.log(this.fileToReturn);
    return this.fileToReturn;
  }

  imageLoaded(): void {
    this.showCropper = true;
  }

  cropperReady(sourceImageDimensions: Dimensions): void {
    console.log('Cropper Ready!', sourceImageDimensions);
  }

  loadImageFailed(): void {
    this.snackbar.open(`Uh-oh! Seems like we can't load the image. Is something wrong with it?`);
  }

  base64ToFile(data: any, filename: string): File {
    const arr = data.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);

    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  cancel() {
    this.dialogRef.close();
  }

  uploadAvatar() {
    this.uploader.authToken = `Bearer ${this.currentUser.token}`;
    this.uploading = true;
    this.uploader.clearQueue();
    this.uploader.addToQueue([this.fileToReturn]);
    this.authService.changeAvatar(this.uploader).subscribe(
      () => {
        this.uploading = false;
        this.snackbar.open('Avatar uploaded successfully!');
        this.dialogRef.close();
      },
      (error: HttpError) => {
        this.uploading = false;
        this.snackbar.open(`Uh-oh! Failed to upload your avatar. ${error.message} (HTTP ${error.statusCode} ${error.error})`);
      },
    );
  }
}
