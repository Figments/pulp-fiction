import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { AuthState } from '../../shared/auth';

import { CarouselOptionsManager } from './carousel-options-manager';
import { FrontendUser } from '@pulp-fiction/models/users';
import { Constants } from '../../shared/constants';
import { Title } from '../../shared';
import { NewsContentModel } from '@pulp-fiction/models/content';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
  @Select(AuthState.user) currentUser$: Observable<FrontendUser>;
  currentUserSubscription: Subscription;
  currentUser: FrontendUser;

  siteVersion = Constants.siteVersion;

  initialPosts: NewsContentModel[];

  // Carousel Options
  newsOptions = this.carouselOptions.newsCarouselConfig;

  constructor(public route: ActivatedRoute, private carouselOptions: CarouselOptionsManager) {
    this.currentUserSubscription = this.currentUser$.subscribe(x => {
      this.currentUser = x;
    });
  }
  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.initialPosts = data.homeData as NewsContentModel[];
    });

    Title.setTwoPartTitle(Constants.HOME);
  }
}
