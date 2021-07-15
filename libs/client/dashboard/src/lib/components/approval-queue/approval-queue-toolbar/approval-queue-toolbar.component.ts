import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ApprovalQueue } from '@dragonfish/shared/models/approval-queue';
import { ContentModel } from '@dragonfish/shared/models/content';
import { Decision } from '@dragonfish/shared/models/contrib';
import { UserInfo } from '@dragonfish/shared/models/users';
import { Router } from '@angular/router';
import { ApprovalQueueService, ApprovalQueueQuery } from '@dragonfish/client/repository/dashboard/approval-queue';

@Component({
    selector: 'dragonfish-approval-queue-toolbar',
    templateUrl: './approval-queue-toolbar.component.html',
    styleUrls: ['./approval-queue-toolbar.component.scss'],
})
export class ApprovalQueueToolbarComponent {
    constructor(
        private location: Location,
        private router: Router,
        private queueService: ApprovalQueueService,
        public queueQuery: ApprovalQueueQuery,
    ) {}

    goBack() {
        this.location.back();
    }

    approveWork(doc: ApprovalQueue) {
        const thisWork = doc.workToApprove as ContentModel;
        const thisWorksAuthor = thisWork.author as UserInfo;
        const decision: Decision = {
            docId: doc._id,
            workId: thisWork._id,
            authorId: thisWorksAuthor._id,
        };
        this.queueService.approveWork(decision).subscribe(() => {
            this.router.navigate(['/dashboard/approval-queue']);
        });
    }

    rejectWork(doc: ApprovalQueue) {
        const thisWork = doc.workToApprove as ContentModel;
        const thisWorksAuthor = thisWork.author as UserInfo;
        const decision: Decision = {
            docId: doc._id,
            workId: thisWork._id,
            authorId: thisWorksAuthor._id,
        };
        this.queueService.rejectWork(decision).subscribe(() => {
            this.router.navigate(['/dashboard/approval-queue']);
        });
    }
}
