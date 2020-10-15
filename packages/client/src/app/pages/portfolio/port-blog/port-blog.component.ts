import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../services/auth';
import { PortfolioService } from '../../../services/content';
import { FrontendUser } from '@pulp-fiction/models/users';
import { Blog } from '@pulp-fiction/models/blogs';
import { PaginateResult } from '@pulp-fiction/models/util';
import { PortBlogs } from '../../../models/site';

@Component({
  selector: 'app-port-blog',
  templateUrl: './port-blog.component.html',
  styleUrls: ['./port-blog.component.less']
})
export class PortBlogComponent implements OnInit {
  currentUser: FrontendUser; // The currently logged-in user
  portUserId: string; // The ID of the user whose portfolio this is
  portUserName: string; // The username associated with this portfolio
  portBlogsData: PaginateResult<Blog>; // The list of published blogs
  loading = false; // Loading check for fetching data

  pageNum = 1;

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) {
    this.authService.currUser.subscribe(x => {this.currentUser = x;});
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      const feedData = data.feedData as PortBlogs;
      this.portUserId = feedData.userId;
      this.portBlogsData = feedData.blogs;
    });
  }

  /**
   * Handles page changing
   * 
   * @param event The new page
   */
  onPageChange(event: number) {
    this.router.navigate([], {relativeTo: this.route, queryParams: {page: event}, queryParamsHandling: 'merge'});
    this.pageNum = event;
  }

  /**
   * Checks to see if the portBlogsData array contains blogs. Returns true if there's blogs,
   * but false otherwise.
   */
  blogsArePresent() {
    if (this.portBlogsData) {
      if (this.portBlogsData.docs.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Truncates the body text of the blog in order to fit within the specified blog list
   * size parameters.
   * 
   * @param body The body text of the blog
   */
  truncateBody(body: string) {
    return body.substr(0, 200) + '...';
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
}
