import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FrontendUser, ThemePref } from '@dragonfish/shared/models/users';
import { ElectronService } from 'ngx-electron';
import { GlobalState } from '@dragonfish/client/repository/global';
import { SidenavService } from './services';
import { NavigationStart, Router } from '@angular/router';
import { SessionQuery } from '@dragonfish/client/repository/session';

@UntilDestroy()
@Component({
    selector: 'dragonfish-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
    @ViewChild('sidenav') public sidenav: MatSidenav;
    @Select(GlobalState.theme) theme$: Observable<ThemePref>;

    constructor(
        public electron: ElectronService,
        public sidenavService: SidenavService,
        private router: Router,
        public sessionQuery: SessionQuery,
    ) {}

    ngOnInit(): void {
        this.theme$.pipe(untilDestroyed(this)).subscribe(theme => {
            const body = document.getElementsByTagName('body')[0];
            const currTheme = body.classList.item(0);
            const html = document.getElementsByTagName('html')[0];
            console.log(typeof ThemePref[theme]);
            if (ThemePref[theme] !== null && ThemePref[theme] !== undefined) {
                if (
                    ThemePref[theme] == 'dark-aqua' ||
                    ThemePref[theme] == 'dark-crimson' ||
                    ThemePref[theme] == 'dark-field' ||
                    ThemePref[theme] == 'dark-royal' ||
                    ThemePref[theme] === 'dusk-autumn'
                ) {
                    body.classList.replace(currTheme, ThemePref[theme]);
                    html.classList.add('dark');
                } else {
                    body.classList.replace(currTheme, ThemePref[theme]);
                    html.classList.remove('dark');
                }
            } else {
                body.classList.replace(currTheme, 'crimson');
            }
        });

        this.router.events.pipe(untilDestroyed(this)).subscribe(event => {
            if (this.sidenav) {
                if (event instanceof NavigationStart) {
                    this.sidenavService.close();
                }
            }
        });
    }

    ngAfterViewInit() {
        this.sessionQuery.currentUser$.pipe(untilDestroyed(this)).subscribe(user => {
            if (user || !this.electron.isElectronApp) {
                this.sidenavService.setSidenav(this.sidenav);
            }
        });
    }
}
