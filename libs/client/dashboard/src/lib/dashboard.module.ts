import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { AlertsModule } from '@dragonfish/client/alerts';
import { IconsModule } from '@dragonfish/client/icons';
import { MaterialModule } from '@dragonfish/client/material';
import { UiModule } from '@dragonfish/client/ui';
import { PipesModule } from '@dragonfish/client/pipes';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { MomentModule } from 'ngx-moment';
import { NgScrollbarModule } from 'ngx-scrollbar';

/* Pages */
import { DashboardComponent } from './dashboard.component';
import {
    ApprovalQueueComponent,
    ApprovePoetryComponent,
    ApproveProseComponent,
    SectionViewComponent,
} from './pages/approval-queue';
import { AuditLogComponent } from './pages/audit-log';
import { GroupQueueComponent } from './pages/group-queue';
import { OverviewComponent } from './pages/overview';
import { ReportsComponent } from './pages/reports';
import { UsersManagementComponent } from './pages/users-management';
import { CaseFilesComponent, ViewFileComponent } from './pages/case-files';

/* Components */
import { ApprovalQueueToolbarComponent, ContentPreviewComponent } from './components/approval-queue';

// Delete this once done migrating: Quill stuff
import { OldDataService } from './pages/quill-migrator/old-data-service';
import { Divider, dividerHandler } from './pages/quill-migrator/quill-divider-blot';
import { QuillModule } from 'ngx-quill';
import { QuillMigratorComponent } from './pages/quill-migrator/quill-migrator.component';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
Quill.register(Divider);

@NgModule({
    declarations: [
        DashboardComponent,
        ApprovalQueueComponent,
        ApprovePoetryComponent,
        ApproveProseComponent,
        SectionViewComponent,
        AuditLogComponent,
        GroupQueueComponent,
        OverviewComponent,
        ReportsComponent,
        UsersManagementComponent,
        ApprovalQueueToolbarComponent,
        ContentPreviewComponent,
        QuillMigratorComponent,
        CaseFilesComponent,
        ViewFileComponent,
    ],
    imports: [
        CommonModule,
        DashboardRoutingModule,
        AlertsModule,
        IconsModule,
        MaterialModule,
        UiModule,
        NgxPaginationModule,
        PipesModule,
        MomentModule,
        QuillModule.forRoot({
            format: 'json',
            modules: {
                toolbar: {
                    handlers: {
                        divider: dividerHandler,
                    },
                },
            },
        }),
        NgScrollbarModule.withConfig({
            appearance: 'standard',
        }),
    ],
    providers: [OldDataService],
})
export class DashboardModule {}
