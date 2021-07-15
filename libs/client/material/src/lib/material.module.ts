import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
    imports: [
        FlexLayoutModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatRippleModule,
        MatBadgeModule,
        MatDialogModule,
        MatSnackBarModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatExpansionModule,
    ],
    exports: [
        FlexLayoutModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatRippleModule,
        MatBadgeModule,
        MatDialogModule,
        MatSnackBarModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatExpansionModule,
    ],
})
export class MaterialModule {}
