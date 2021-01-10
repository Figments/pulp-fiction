import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent, WatchingPageComponent } from './pages/home';
  
import { PortfolioComponent, PortHomeComponent, PortBlogPageComponent,
  WorksComponent, SettingsComponent, BlogsComponent, CollectionsComponent, 
  NotificationsComponent, ConversationsComponent, HistoryComponent } from './pages/portfolio';

import { MyStuffComponent, ProseFormComponent, BlogFormComponent, PoetryFormComponent,
  ViewProseComponent, ViewPoetryComponent } from './pages/my-stuff';
  
import { BrowseComponent, GroupsComponent, NewsComponent, PostPageComponent } from './pages';
  
import { DocsPageComponent, SiteStaffComponent } from './pages/docs-page';
  
import { RegisterComponent } from './pages/account';
  
import { AuthGuard } from './services/auth';
import { SearchComponent, FindUsersComponent, FindBlogsComponent, FindWorksComponent } from './pages/search';

import { BlogPageResolver, PortfolioResolver, PostPageResolver, NewsFeedResolver, 
  BrowseFeedResolver, MyWorksResolver, MyBlogsResolver, PortBlogsResolver,
  PortWorksResolver, MyStuffResolver, ViewContentResolver, ViewProseResolver, 
  SectionResolver, ViewPoetryResolver } from './resolvers';

import { HistoryResolver } from './pages/portfolio/history';

import { CollectionsResolver, CollectionPageResolver, CollectionPageComponent } from './pages/portfolio/collections';

import { PoetryPageComponent, ProsePageComponent, SectionViewComponent } from './pages/content-views';

import { MigrateBlogComponent, MigrateBlogResolver, MigrateWorkComponent, MigrateWorkResolver, MigrationComponent, MigrationResolver } from './pages/migration';

const routes: Routes = [
    {path: '', redirectTo: '/home/latest', pathMatch: 'full'},
    {path: 'home', component: HomeComponent, children: []},
    {path: 'browse', component: BrowseComponent, resolve: {feedData: BrowseFeedResolver}, runGuardsAndResolvers: 'always'},
    {path: 'groups', component: GroupsComponent},
    {path: 'news', component: NewsComponent, resolve: {feedData: NewsFeedResolver }, runGuardsAndResolvers: 'paramsChange'},
    {path: 'post/:postId/:postTitle', resolve: {postData: PostPageResolver}, runGuardsAndResolvers: 'paramsChange', component: PostPageComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'my-stuff', component: MyStuffComponent, canActivate: [AuthGuard], resolve: {stuffData: MyStuffResolver}, runGuardsAndResolvers: 'always', children: [
      {path: 'new-blog', component: BlogFormComponent, canActivate: [AuthGuard]},
      {path: 'new-prose', component: ProseFormComponent, canActivate: [AuthGuard]},
      {path: 'new-poetry', component: PoetryFormComponent, canActivate: [AuthGuard]},
      {path: 'view-blog', component: BlogFormComponent, canActivate: [AuthGuard], resolve: {blogData: ViewContentResolver}, runGuardsAndResolvers: 'always'},
      {path: 'view-prose', component: ViewProseComponent, canActivate: [AuthGuard], resolve: {proseData: ViewContentResolver}, runGuardsAndResolvers: 'always'},
      {path: 'view-poetry', component: ViewPoetryComponent, canActivate: [AuthGuard], resolve: {poetryData: ViewContentResolver}, runGuardsAndResolvers: 'always'},
      {path: 'edit-prose', component: ProseFormComponent, canActivate: [AuthGuard], resolve: {proseData: ViewContentResolver}, runGuardsAndResolvers: 'always'},
      {path: 'edit-poetry', component: PoetryFormComponent, canActivate: [AuthGuard], resolve: {poetryData: ViewContentResolver}, runGuardsAndResolvers: 'always'}
    ]},
    {path: 'portfolio/:id/:username', resolve: {portData: PortfolioResolver}, runGuardsAndResolvers: 'always', component: PortfolioComponent, children: [
      {path: 'blogs', component: BlogsComponent, resolve: {feedData: PortBlogsResolver}, runGuardsAndResolvers: 'always'},
      {path: 'blog/:blogId', resolve: {blogData: BlogPageResolver}, runGuardsAndResolvers: 'paramsChange', component: PortBlogPageComponent},
      {path: 'works', component: WorksComponent, resolve: {feedData: PortWorksResolver}, runGuardsAndResolvers: 'always'},
      {path: 'collections', component: CollectionsComponent, resolve: {feedData: CollectionsResolver}, runGuardsAndResolvers: 'always'},
      {path: 'collection/:collId', component: CollectionPageComponent, resolve: {collData: CollectionPageResolver}, runGuardsAndResolvers: 'always'},
      {path: 'history', component: HistoryComponent, canActivate: [AuthGuard], resolve: {histData: HistoryResolver}, runGuardsAndResolvers: 'always'},
      {path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard]},
      {path: 'conversations', component: ConversationsComponent, canActivate: [AuthGuard]},
      {path: 'settings', component: SettingsComponent, canActivate: [AuthGuard]},
      {path: 'home', component: PortHomeComponent},
      {path: '', redirectTo: 'home', pathMatch: 'full'}
    ]},
    {path: 'prose/:proseId/:proseTitle', component: ProsePageComponent, resolve: {proseData: ViewProseResolver}, runGuardsAndResolvers: 'paramsChange', children: [
      {path: ':sectionNum/:sectionTitle', component: SectionViewComponent}
    ]},
    {path: 'poetry/:poetryId/:poetryTitle', component: PoetryPageComponent, resolve: {poetryData: ViewPoetryResolver}, runGuardsAndResolvers: 'paramsChange', children: [
      {path: ':sectionNum/sectionTitle', component: SectionViewComponent}
    ]},
    {path: 'search', component: SearchComponent, children: [
      {path: 'users', component: FindUsersComponent},
      {path: 'blogs', component: FindBlogsComponent},
      {path: 'works', component: FindWorksComponent},
    ]},
    {path: 'site-staff', component: SiteStaffComponent},
    {path: 'docs/:docId', component: DocsPageComponent},
    {path: 'migration', component: MigrationComponent, canActivate: [AuthGuard], resolve: {contentData: MigrationResolver}, runGuardsAndResolvers: 'always', children: [
      {path: 'work/:workId', component: MigrateWorkComponent, canActivate: [AuthGuard], resolve: {workData: MigrateWorkResolver}, runGuardsAndResolvers: 'always'},
      {path: 'blog/:blogId', component: MigrateBlogComponent, canActivate: [AuthGuard], resolve: {blogData: MigrateBlogResolver}, runGuardsAndResolvers: 'always'}
    ]}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {anchorScrolling: 'enabled', onSameUrlNavigation: 'reload', scrollPositionRestoration: 'enabled'})],
    exports: [RouterModule],
    providers: [
      BlogPageResolver, PortfolioResolver, PostPageResolver, NewsFeedResolver, BrowseFeedResolver,
      MyWorksResolver, MyBlogsResolver, PortWorksResolver, PortBlogsResolver,
      CollectionPageResolver, MyStuffResolver, ViewContentResolver, ViewProseResolver, SectionResolver, ViewPoetryResolver,
      MigrationResolver, MigrateWorkResolver, MigrateBlogResolver, CollectionsResolver, HistoryResolver
    ]
})
export class AppRoutingModule {}