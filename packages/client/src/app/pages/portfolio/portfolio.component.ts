import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as lodash from 'lodash';

import { FrontendUser, Roles } from '@pulp-fiction/models/users';
import { AuthService } from '../../services/auth';
import { PortfolioService } from '../../services/content';
import { StartConversationComponent } from '../../components/portfolio/start-conversation/start-conversation.component';

import { Title } from '../../shared';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.less']
})
export class PortfolioComponent implements OnInit {
  portUser: FrontendUser; // The user whose portfolio this is
  portUserId: string; // Their ID, fetched from the route parameters

  currentUser: FrontendUser; // The currently logged-in user

  constructor(private authService: AuthService, public route: ActivatedRoute, public dialog: MatDialog) {
    this.authService.currUser.subscribe(x => {
      this.currentUser = x;
    });
  }

  ngOnInit(): void {
    this.portUser = this.route.snapshot.data.portData as FrontendUser;
    Title.setTwoPartTitle(this.portUser.username);
  }

  /**
   * Checks to see if the currently logged in user is the same as the user who owns this portfolio.
   */
  currentUserIsSame() {
    if (this.currentUser) {
      if (this.portUser) {
        if (this.currentUser._id === this.portUser._id) {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  /**
   * Checks to see what the prominent role for this user is so it can be displayed.
   * 
   * @param roles The roles to check
   */
  determineProminentRole(roles: Roles[]) {
    // this will totally need retooling to figure out a much better way to verify what the top-level
    // role is
    const hasAdmin = lodash.intersection([Roles.Admin], roles);
    const hasModerator = lodash.intersection([Roles.Moderator], roles);
    const hasChatModerator = lodash.intersection([Roles.ChatModerator], roles);
    const hasContributor = lodash.intersection([Roles.Contributor], roles);
    const hasWorkApprover = lodash.intersection([Roles.WorkApprover], roles);
    const hasVIP = lodash.intersection([Roles.VIP], roles);
    const hasSupporter = lodash.intersection([Roles.Supporter], roles);

    if (hasAdmin.length > 0) {
      return Roles.Admin;
    } else if (hasModerator.length > 0) {
      return Roles.Moderator;
    } else if (hasChatModerator.length > 0) {
      return Roles.ChatModerator;
    } else if (hasContributor.length > 0) {
      return Roles.Contributor;
    } else if (hasWorkApprover.length > 0) {
      return Roles.WorkApprover;
    } else if (hasVIP.length > 0) {
      return Roles.VIP;
    } else if (hasSupporter.length > 0) {
      return Roles.Supporter;
    } else {
      return Roles.User;
    }
  }


  /**
   * Opens the new message dialog
   */
  startNewConversation() {
    if (this.portUserId) {
      this.dialog.open(StartConversationComponent, {data: {userId: this.portUserId}});
    }
  }
}
