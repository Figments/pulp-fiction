import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { NewsFeedComponent } from './news-feed/news-feed.component';
import { NewsResolver } from '../../resolvers/home';

export const HomePages = [HomeComponent, NewsFeedComponent];

export const HomeRoutes: Routes = [
    {
        path: '',
        component: HomeComponent,
        pathMatch: 'full',
    },
    { 
        path: 'home',
        redirectTo: '',
        pathMatch: 'full',
    },
    {
        path: 'news',
        component: NewsFeedComponent,
        resolve: { feedData: NewsResolver },
        runGuardsAndResolvers: 'paramsChange',
    },
];
