import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { User } from 'src/app/models/users';
import { AuthService } from 'src/app/services/auth';
import { PortfolioService } from 'src/app/services/content';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.less']
})
export class PortfolioComponent implements OnInit {
  portUser: User; // The user whose portfolio this is
  portUserId: string; // Their ID, fetched from the route parameters

  currentUser: User; // The currently logged-in user
  loading = false; // Loading check for fetching data

  constructor(private authService: AuthService, private router: Router, public route: ActivatedRoute, private portService: PortfolioService) {
    this.authService.currUser.subscribe(x => {
      this.currentUser = x;
    });
    this.fetchData();
  }

  ngOnInit(): void {
  }

  /**
   * Fetches the data for this portfolio
   */
  private fetchData() {
    this.loading = true;
    this.route.paramMap.subscribe(params => {
      this.portUserId = params.get('id');
      this.portService.getUserInfo(this.portUserId).subscribe(x => {
        this.portUser = x;
        this.loading = false;
      });
    });
  }

  /**
   * Checks to see if the currently logged in user is the same as the user who owns this portfolio.
   */
  currentUserIsSame() {
    if (this.currentUser) {
      if (this.currentUser._id === this.portUser._id) {
        return true;
      } else {
        return false;
      }
    }
  }

}
