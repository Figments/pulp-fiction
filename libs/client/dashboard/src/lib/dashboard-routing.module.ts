import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
import { UsersManagementComponent } from './pages/users-management';
import { QuillMigratorComponent } from './pages/quill-migrator/quill-migrator.component';
import { QuillMigratorResolver } from './pages/quill-migrator/quill-migrator-resolver';
import { CaseFilesComponent, ViewFileComponent } from './pages/case-files';

/* Util */
import { ApprovalQueueResolver, ApproveContentResolver } from './resolvers/approval-queue';
import { Roles } from '@dragonfish/shared/models/users';
import { AuthGuard } from '@dragonfish/client/repository/session/services';

const routes: Routes = [
    {
        path: '',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { roles: [Roles.WorkApprover, Roles.Moderator, Roles.Admin] },
        children: [
            {
                path: 'overview',
                component: OverviewComponent,
                canActivate: [AuthGuard],
                data: { roles: [Roles.WorkApprover, Roles.Moderator, Roles.Admin] },
            },
            {
                path: 'approval-queue',
                component: ApprovalQueueComponent,
                resolve: {
                    queueData: ApprovalQueueResolver,
                },
                runGuardsAndResolvers: 'always',
                canActivate: [AuthGuard],
                data: { roles: [Roles.WorkApprover, Roles.Moderator, Roles.Admin] },
                children: [
                    {
                        path: 'view-prose',
                        component: ApproveProseComponent,
                        canActivate: [AuthGuard],
                        data: { roles: [Roles.WorkApprover, Roles.Moderator, Roles.Admin] },
                        runGuardsAndResolvers: 'always',
                        children: [
                            {
                                path: ':sectionNum/:sectionTitle',
                                component: SectionViewComponent,
                                canActivate: [AuthGuard],
                                data: { roles: [Roles.WorkApprover, Roles.Moderator, Roles.Admin] },
                            },
                        ],
                    },
                    {
                        path: 'view-poetry',
                        component: ApprovePoetryComponent,
                        canActivate: [AuthGuard],
                        data: { roles: [Roles.WorkApprover, Roles.Moderator, Roles.Admin] },
                        runGuardsAndResolvers: 'always',
                        children: [
                            {
                                path: ':sectionNum/:sectionTitle',
                                component: SectionViewComponent,
                                canActivate: [AuthGuard],
                                data: { roles: [Roles.WorkApprover, Roles.Moderator, Roles.Admin] },
                            },
                        ],
                    },
                ],
            },
            {
                path: 'group-queue',
                component: GroupQueueComponent,
                canActivate: [AuthGuard],
                data: { roles: [Roles.Moderator, Roles.Admin] },
            },
            {
                path: 'case-files',
                component: CaseFilesComponent,
                canActivate: [AuthGuard],
                data: { roles: [Roles.Moderator, Roles.Admin] },
                children: [
                    {
                        path: 'view-file',
                        component: ViewFileComponent,
                        canActivate: [AuthGuard],
                        data: { roles: [Roles.Moderator, Roles.Admin] },
                    },
                ],
            },
            {
                path: 'users-management',
                component: UsersManagementComponent,
                canActivate: [AuthGuard],
                data: { roles: [Roles.Moderator, Roles.Admin] },
            },
            {
                path: 'audit-log',
                component: AuditLogComponent,
                canActivate: [AuthGuard],
                data: { roles: [Roles.Moderator, Roles.Admin] },
            },
            {
                path: 'quill-migrator',
                component: QuillMigratorComponent,
                resolve: {
                    workData: QuillMigratorResolver,
                },
                runGuardsAndResolvers: 'always',
                canActivate: [AuthGuard],
                data: { roles: [Roles.Moderator, Roles.Admin] },
            },
            { path: '', redirectTo: '/dashboard/overview', pathMatch: 'full' },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [ApprovalQueueResolver, ApproveContentResolver, QuillMigratorResolver],
})
export class DashboardRoutingModule {}
