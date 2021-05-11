import { Component } from '@angular/core';
import { PopupModel } from '@dragonfish/shared/models/util';
import { PopupComponent } from '@dragonfish/client/ui';
import { AuthService } from '@dragonfish/client/repository/auth/services';
import { MatDialog } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FrontendUser } from '@dragonfish/shared/models/users';
import { UserState } from '@dragonfish/client/repository/user';
import { SidenavService } from '../../../services';

enum UserTabs {
    Friends,
    Notifications,
    History,
}

@Component({
    selector: 'dragonfish-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
    @Select(UserState.currUser) currentUser$: Observable<FrontendUser>;
    moreMenuOpened = false;
    userTabs = UserTabs;
    selectedTab = UserTabs.Notifications;

    constructor(private auth: AuthService, private dialog: MatDialog, private sidenavService: SidenavService) {}

    toggleMoreMenu() {
        this.moreMenuOpened = !this.moreMenuOpened;
    }

    switchUserTab(newTab: UserTabs) {
        this.selectedTab = newTab;
    }

    logout() {
        const alertData: PopupModel = {
            message: 'Are you sure you want to log out?',
            confirm: true,
        };
        const dialogRef = this.dialog.open(PopupComponent, { data: alertData });
        dialogRef.afterClosed().subscribe((wantsToLogOut: boolean) => {
            if (wantsToLogOut) {
                this.auth.logout();
                this.sidenavService.close();
            }
        });
    }
}
