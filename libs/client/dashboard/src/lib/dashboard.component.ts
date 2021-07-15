import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

enum DashboardRoutes {
    Overview,
    ApprovalQueue,
    CaseFiles,
    AuditLog,
    Users,
    Groups,
}

@UntilDestroy()
@Component({
    selector: 'dragonfish-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [
        trigger('inOutAnimation', [
            transition(':enter', [
                style({ height: 0, opacity: 0 }),
                animate('.250s ease-in-out', style({ height: 160, opacity: 1 })),
            ]),
            transition(':leave', [
                style({ height: 160, opacity: 1 }),
                animate('.250s ease-in-out', style({ height: 0, opacity: 0 })),
            ]),
        ]),
    ],
})
export class DashboardComponent {
    showModTools = false;
    pages = DashboardRoutes;
    selectedPage = DashboardRoutes.Overview;

    constructor(private router: Router) {
        this.router.events.pipe(untilDestroyed(this)).subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.switchSelectedPage(this.router.url);
            }
            if (event instanceof NavigationEnd) {
                this.switchSelectedPage(this.router.url);
            }
        });
    }

    switchSelectedPage(url: string) {
        switch (url) {
            case '/dashboard/overview':
                this.selectedPage = DashboardRoutes.Overview;
                break;
            case '/dashboard/approval-queue':
                this.selectedPage = DashboardRoutes.ApprovalQueue;
                break;
            case '/dashboard/case-files':
                this.selectedPage = DashboardRoutes.CaseFiles;
                break;
            case '/dashboard/audit-log':
                this.selectedPage = DashboardRoutes.AuditLog;
                break;
            case '/dashboard/users-management':
                this.selectedPage = DashboardRoutes.Users;
                break;
            case 'dashboard/group-queue':
                this.selectedPage = DashboardRoutes.Groups;
                break;
        }
    }
}
