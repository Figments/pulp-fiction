import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { FrontendUser } from '@pulp-fiction/models/users';
import { NewsContentModel } from '@pulp-fiction/models/content';
import { PaginateResult } from '@pulp-fiction/models/util';
import { AuthService } from '../../services/auth';
import { NewsService } from '../../services/contrib/news';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.less']
})
export class NewsComponent implements OnInit {
  currentUser: FrontendUser;

  posts: PaginateResult<NewsContentModel>;
  pageNum: number = 1;

  searchForm = new FormGroup({
    query: new FormControl('')
  });

  constructor(private newsService: NewsService, private authService: AuthService, public route: ActivatedRoute, private router: Router) {
    this.authService.currUser.subscribe(x => {
      this.currentUser = x;
    });
    
    this.router.events.pipe(filter(event => event instanceof NavigationEnd && event.urlAfterRedirects === '/news'))
      .subscribe(() => { this.fetchData(this.pageNum) });
  }

  ngOnInit(): void {}

  fetchData(pageNum: number) {
    this.newsService.fetchAll(pageNum).subscribe(data => {
      this.posts = data;
    });
  }
}
