import { Injectable } from '@angular/core';
import {
    CanActivate,
    CanActivateChild,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    CanLoad,
    Route,
    UrlSegment,
} from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Store } from '@ngxs/store';

import { AuthState } from '../auth.state';
import { JwtPayload } from '@dragonfish/models/auth';
import { Roles } from '@dragonfish/models/users';
import { isAllowed, isNullOrUndefined } from '@dragonfish/utilities/functions';
import { AlertsService } from '@dragonfish/alerts';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
    helper = new JwtHelperService();

    constructor(private store: Store, private alerts: AlertsService) {}

    /**
     * Verifies that a user can access a protected route. If their JWT is expired, it makes a request to the backend to
     * verify that an active session is still present. If one is, the route request is approved. If one isn't, then the
     * request is denied.
     *
     * @param next The next route requested
     * @param state Current state of the router
     */
    canActivate(next: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
        const token = this.store.selectSnapshot<string>(AuthState.token);
        const decodedToken: JwtPayload = this.helper.decodeToken(token);

        if (token) {
            if (next.data.roles) {
                if (isAllowed(decodedToken.roles as Roles[], next.data.roles)) {
                    return true;
                } else {
                    this.alerts.error(`You don't have permission to do that.`);
                    return false;
                }
            } else {
                return true;
            }
        } else {
            this.alerts.error(`You don't have permission to do that.`);
            return false;
        }
    }

    /**
     * Does the same thing as the above, but on any child routes that must be protected. This one is declared on
     * the route parent.
     *
     * @param next The next route requested
     * @param state Current state of the router
     */
    canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const token = this.store.selectSnapshot<string>(AuthState.token);
        const decodedToken: JwtPayload = this.helper.decodeToken(token);

        if (token) {
            if (next.data.roles) {
                if (isAllowed(decodedToken.roles as Roles[], next.data.roles)) {
                    return true;
                } else {
                    this.alerts.error(`You don't have permission to do that.`);
                    return false;
                }
            } else {
                return true;
            }
        } else {
            this.alerts.error(`You don't have permission to do that.`);
            return false;
        }
    }

    canLoad(route: Route, segments: UrlSegment[]) {
        const token = this.store.selectSnapshot<string>(AuthState.token);
        const decodedToken: JwtPayload = this.helper.decodeToken(token);

        if (token) {
            if (!isNullOrUndefined(route.data)) {
                if (!isNullOrUndefined(route.data.roles)) {
                    console.log(`something is present...`);
                    if (isAllowed(decodedToken.roles as Roles[], route.data.roles)) {
                        return true;
                    } else {
                        this.alerts.error(`You don't have permission to do that.`);
                        return false;
                    }
                } else {
                    return true;
                }
            } else {
                return true;
            }
        } else {
            this.alerts.error(`You don't have permission to do that.`);
            return false;
        }
    }
}
