import { Component, OnInit } from '@angular/core';

import { NagBarService } from 'src/app/modules/nag-bar';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-new-policy-nag',
  templateUrl: './new-policy-nag.component.html',
  styleUrls: ['./new-policy-nag.component.less']
})
export class NewPolicyNagComponent implements OnInit {
  loading = false;

  constructor(private nagBarService: NagBarService,
    private authService: AuthService) { }

  ngOnInit(): void {
  }

  onSubmitClicked() {
    // set agree locally and with the server, then close the bar
    this.loading = true;
    this.authService.agreeToPolicies().subscribe(x => {
      this.loading = false;
      this.nagBarService.clearCurrentConent();
    }, (err) => {
      // Hopefully the alertservice is enough of a hint to the user
      this.loading = false;      
    })    
  }

}
