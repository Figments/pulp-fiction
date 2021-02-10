import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxsModule } from '@ngxs/store';
import { AlertsModule } from '@dragonfish/alerts';
import { IconsModule } from '@dragonfish/icons';
import { MaterialModule } from '@dragonfish/material';
import { DashboardRoutingModule } from './dashboard-routing.module';

/* Pages */
import { DashboardComponent } from './dashboard.component';
import { ApprovalQueuePages } from './pages/approval-queue';
import { AuditLogPages } from './pages/audit-log';
import { GroupQueuePages } from './pages/group-queue';
import { OverviewPages } from './pages/overview';
import { ReportsPages } from './pages/reports';
import { UsersManagementPages } from './pages/users-management';

/* Components */

/* State */
import { ApprovalQueueState } from './shared/approval-queue';

/* Services */
import { ApprovalQueueService } from './shared/approval-queue/services';

@NgModule({
    declarations: [
        DashboardComponent,
        ...ApprovalQueuePages,
        ...AuditLogPages,
        ...GroupQueuePages,
        ...OverviewPages,
        ...ReportsPages,
        ...UsersManagementPages,
    ],
    imports: [
        CommonModule,
        DashboardRoutingModule,
        AlertsModule,
        IconsModule,
        MaterialModule,
        NgxsModule.forFeature([
            ApprovalQueueState,
        ]),
    ],
    providers: [
        ApprovalQueueService,
    ],
})
export class DashboardModule {}
