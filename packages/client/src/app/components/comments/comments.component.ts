import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Toppy, ToppyControl, GlobalPosition, InsidePlacement } from 'toppy';
import * as lodash from 'lodash';

import { FrontendUser, Roles } from '@pulp-fiction/models/users';
import { Comment, BlogComment, WorkComment } from '@pulp-fiction/models/comments';
import { PaginateResult } from '@pulp-fiction/models/util';
import { AuthService } from '../../services/auth';
import { CommentsService } from '../../services/content';
import { CommentFormComponent } from './comment-form/comment-form.component';

@Component({
  selector: 'comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.less']
})
export class CommentsComponent implements OnInit {
  @Input() itemId: string; // The ID of the blog/work/newspost
  @Input() itemKind: string; // The kind of comments thread it is, between blogs/works/newsposts
  @Input() pageNum: number; // The requested page number
  @Input() banlist?: any; // The banlist of the thread
  @Output() emitPageChange = new EventEmitter<number>(); // Emits the current page number

  currentUser: FrontendUser;
  loading = false;
  comments: PaginateResult<Comment> | PaginateResult<BlogComment> | PaginateResult<WorkComment>;
  commentForm: ToppyControl;

  constructor(private authService: AuthService, private toppy: Toppy, private commentsService: CommentsService) { 
    this.authService.currUser.subscribe(x => { this.currentUser = x; });
  }

  ngOnInit(): void {
    this.fetchData(this.pageNum);

    // Setting up the comment form
    const pos = new GlobalPosition({
      placement: InsidePlacement.BOTTOM,
      width: '100%',
      height: 'auto'
    });

    this.commentForm = this.toppy
      .position(pos)
      .config({closeOnEsc: true})
      .content(CommentFormComponent)
      .create();

    this.commentForm.listen('t_close').subscribe(() => {
      this.fetchData(this.pageNum);
    });
  }

  /**
   * Fetches the requested page of comments.
   * 
   * @param pageNum The page desired
   */
  fetchData(pageNum: number) {
    this.loading = true;
    if (this.itemKind === 'Blog') {
      this.commentsService.getBlogComments(this.itemId, pageNum).subscribe(comments => {
        this.comments = comments;
        this.pageNum = pageNum;
        this.emitPageChange.emit(pageNum);
        this.loading = false;
      });
    } else if (this.itemKind === 'Work') {
      this.commentsService.getWorkComments(this.itemId, pageNum).subscribe(comments => {
        this.comments = comments;
        this.pageNum = pageNum;
        this.emitPageChange.emit(pageNum);
        this.loading = false;
      });
    }
  }

  /**
   * If there's a logged-in user, check to see if the user owns the specific comment requested.
   * 
   * @param userId The user ID of the comment
   */
  currentUserIsSame(userId: string) {
    if (this.currentUser) {
      if (this.currentUser._id === userId) {
        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * Checks to see what toplevel role a user has to display the appropriate tag.
   * 
   * @param roles A comment user's roles
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
   * Creates a new comment.
   * 
   * @param itemId The current item
   * @param itemKind The item's kind
   */
  newComment(itemId: string, itemKind: string) {
    this.commentForm.updateContent(CommentFormComponent, {itemId: itemId, itemKind: itemKind, editMode: false});
    this.commentForm.open();
  }

  /**
   * Edits a comment.
   * 
   * @param itemId The current item
   * @param itemKind The item's kind
   * @param commentId The comment's ID
   * @param commInfo The comment's info
   */
  editComment(itemId: string, itemKind: string, commentId: string, commInfo: string) {
    this.commentForm.updateContent(CommentFormComponent, {
      itemId: itemId,
      itemKind: itemKind,
      editMode: true,
      commentId: commentId,
      editCommInfo: commInfo
    });

    this.commentForm.open();
  }

  /**
   * Creates a comment with a quote.
   * 
   * @param itemId The current item
   * @param itemKind The item's kind
   * @param commentId The comment's ID
   * @param commInfo The comment's info
   */
  quoteComment(itemId: string, itemKind: string, commInfo: string) {
    this.commentForm.updateContent(CommentFormComponent, {
      itemId: itemId,
      itemKind: itemKind,
      editMode: false,
      quoteCommInfo: commInfo
    });

    this.commentForm.open();
  }
}
