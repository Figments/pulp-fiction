import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Toppy, ToppyControl, GlobalPosition, InsidePlacement } from 'toppy';

import { BlogsService } from 'src/app/services/content';
import { AuthService } from 'src/app/services/auth';
import { CreateBlogComponent } from 'src/app/components/modals';
import { User } from 'src/app/models/users';
import { Blog, SetPublishStatus } from 'src/app/models/blogs';
import { AlertsService } from 'src/app/modules/alerts';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.less']
})
export class BlogsComponent implements OnInit {
  currentUser: User;
  blogs: Blog[];
  loading = false;

  searchBlogs = new FormGroup({
    query: new FormControl('', Validators.required),
  });

  filterOptions: ToppyControl;
  createBlog: ToppyControl;
  previewBlog: ToppyControl;

  constructor(private blogsService: BlogsService, private authService: AuthService, private toppy: Toppy, private alertsService: AlertsService) {
    this.authService.currUser.subscribe(x => this.currentUser = x);
    this.fetchData();
  }

  ngOnInit(): void {
    const position = new GlobalPosition({
      placement: InsidePlacement.CENTER,
      width: 'auto',
      height: 'auto',
    });

    this.createBlog = this.toppy
      .position(position)
      .config({backdrop: true, closeOnEsc: true})
      .content(CreateBlogComponent)
      .create();

    this.createBlog.listen('t_close').subscribe(() => {
      this.fetchData();
    });
  }

  /**
   * Fetches the list of blogs from the backend.
   */
  private fetchData() {
    this.loading = true;
    this.blogsService.fetchUserBlogs().subscribe(blogs => {
      this.blogs = blogs.reverse();
      this.loading = false;
    });
  }
  
  /**
   * Checks to see if the blogs array is empty.
   */
  isBlogsEmpty() {
    if (this.blogs) {
      if (this.blogs.length === 0) {
        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * Opens the new blog form.
   */
  openNewBlogForm() {
    this.createBlog.open();
  }

  /**
   * Asks a user if they'd like to delete the specified blog. If yes, delete the blog.
   * If no, cancel the action.
   * 
   * @param blogId The blog we're deleting
   */
  askDelete(blogId: string) {
    if (confirm('Are you sure you want to delete this blog? This action is irreversible.')) {
      this.blogsService.deleteBlog(blogId).subscribe(_ => {
        this.fetchData();
        return;
      }, err => {
        console.log(err);
        this.alertsService.error('Something went wrong! Try again in a little bit.');
        return;
      });
    } else {
      return;
    }
  }

  /**
   * Sets the published status of a blog to its direct opposite. 
   * 
   * @param blogId The ID of the requisite blog
   * @param publishStatus Its publish status
   */
  setPublishStatus(blogId: string, publishStatus: boolean) {
    const pubStatus: SetPublishStatus = {blogId: blogId, publishStatus: !publishStatus};

    this.blogsService.setPublishStatus(pubStatus).subscribe(_ => {
      this.fetchData();
      return;
    }, err => {
      console.log(err);
      this.alertsService.error('Something went wrong! Try again in a little bit.');
      return;
    });
  }
}
