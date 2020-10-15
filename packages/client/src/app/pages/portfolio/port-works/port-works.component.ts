import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../services/auth';
import { PortfolioService } from '../../../services/content';
import { FrontendUser } from '@pulp-fiction/models/users';
import { Work } from '@pulp-fiction/models/works';
import { PaginateResult } from '@pulp-fiction/models/util';
import { calculateApprovalRating } from '../../../util/functions';

import { GlobalConstants } from '../../../shared';
import { GlobalMethods } from '../../../shared/global-methods';

@Component({
  selector: 'app-port-works',
  templateUrl: './port-works.component.html',
  styleUrls: ['./port-works.component.less']
})
export class PortWorksComponent implements OnInit {
  currentUser: FrontendUser; // The currently logged-in user
  portUserId: string; // The ID of the user whose portfolio this is
  portUserName: string; // The username associated with this portfolio
  portWorksData: PaginateResult<Work>; // The list of published works
  loading = false; // Loading check for fetching data

  pageNum = 1;

  constructor(private route: ActivatedRoute, private portService: PortfolioService,
    private authService: AuthService) {
      this.authService.currUser.subscribe(x => { this.currentUser = x; });
      this.fetchData(this.pageNum);
    }

  ngOnInit(): void {
    GlobalMethods.setThreePartTitle(this.portUserName, GlobalConstants.WORKS);
  }

  /**
   * Fetches the data for this user's published works list.
   */
  fetchData(pageNum: number) {
    this.loading = true;
    this.route.parent.paramMap.subscribe(params => {
      this.portUserId = params.get('id');
      this.portUserName = params.get('username');
      this.portService.getWorksList(this.portUserId, pageNum).subscribe(works => {
        this.portWorksData = works;
        this.pageNum = pageNum;
        this.loading = false;
      });
    });
  }

  /**
   * Checks to see if the portWorksData array contains works. Returns true if there's works,
   * but false otherwise.
   */
  worksArePresent() {
    if (this.portWorksData) {
      if (this.portWorksData.docs.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Checks to see if the currently logged in user is the same as the one that owns this
   * portfolio.
   */
  currentUserIsSame() {
    if (this.currentUser) {
      if (this.currentUser._id === this.portUserId) {
        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * Calculates a work's approval rating.
   * 
   * @param likes Number of likes
   * @param dislikes Number of dislikes
   */
  calcApprovalRating(likes: number, dislikes: number) {
    return calculateApprovalRating(likes, dislikes);
  }
}
