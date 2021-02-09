import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { NgxsModule } from '@ngxs/store';
import { MaterialModule } from '@dragonfish/material';
import { IconsModule } from '@dragonfish/icons';
import { AlertsModule } from '@dragonfish/alerts';
import { PipesModule } from '@dragonfish/pipes';
import { EditorModule } from '@dragonfish/editor';
import { ComponentsModule } from '@dragonfish/components';

import { MyStuffRoutingModule } from './my-stuff-routing.module';
import { MyStuffState } from './shared/my-stuff.state';
import { SectionsState } from './shared/sections';
import { MyStuffComponents } from './components';
import { MyStuffViews } from './views';
import { MyStuffFacade } from './facades';
import { MyStuffService } from './shared/services';
import { MyStuffComponent } from './my-stuff.component';

@NgModule({
    declarations: [
        MyStuffComponent,
        ...MyStuffComponents,
        ...MyStuffViews,
    ],
    imports: [
        CommonModule,
        MyStuffRoutingModule,
        NgxsModule.forFeature([MyStuffState, SectionsState]),
        MaterialModule,
        IconsModule,
        AlertsModule,
        FormsModule,
        ReactiveFormsModule,
        PipesModule,
        EditorModule,
        ComponentsModule,
        FileUploadModule,
    ],
    providers: [
        MyStuffFacade,
        MyStuffService,
    ]
})
export class MyStuffModule {}
