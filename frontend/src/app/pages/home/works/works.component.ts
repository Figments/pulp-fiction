import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Toppy, ToppyControl, GlobalPosition, InsidePlacement } from 'toppy';

import { User } from 'src/app/models/users';
import * as models from 'src/app/models/works';
import { AuthService } from 'src/app/services/auth';
import { WorksService } from 'src/app/services/content';
import { AlertsService } from 'src/app/modules/alerts';
import { NewWorkComponent, EditWorkComponent } from 'src/app/components/modals/works';

@Component({
  selector: 'app-works',
  templateUrl: './works.component.html',
  styleUrls: ['./works.component.less']
})
export class WorksComponent implements OnInit {
  currentUser: User;
  works: models.Work[];
  unfilteredList: models.Work[];
  newWorkForm: ToppyControl;
  editWorkForm: ToppyControl;

  loading = false;
  isUnpubFiltered = false;
  isPubFiltered = false;

  searchWorks = new FormGroup({
    query: new FormControl(''),
  });

  constructor(private authService: AuthService, private worksService: WorksService,
    private alertsService: AlertsService, private toppy: Toppy) {
      this.authService.currUser.subscribe(x => { this.currentUser = x; });
      this.fetchData();
    }

  ngOnInit(): void {
    // Initializing the new work form modal
    const newWorkPosition = new GlobalPosition({
      placement: InsidePlacement.CENTER,
      width: 'auto',
      height: 'auto',
    });

    this.newWorkForm = this.toppy
      .position(newWorkPosition)
      .config({backdrop: true, closeOnEsc: true})
      .content(NewWorkComponent)
      .create();

    this.newWorkForm.listen('t_close').subscribe(() => {
      this.fetchData();
    });

    // Initializing the edit work form modal
    const editWorkPosition = new GlobalPosition({
      placement: InsidePlacement.CENTER,
      width: 'auto',
      height: 'auto',
    });

    this.editWorkForm = this.toppy
      .position(editWorkPosition)
      .config({backdrop: true, closeOnEsc: true})
      .content(EditWorkComponent)
      .create();
    
    this.editWorkForm.listen('t_close').subscribe(() => {
      this.fetchData();
    });
  }

  /**
   * Search bar getter.
   */
  get searchField() { return this.searchWorks.controls; }

  /**
   * Fetches the list of works from the backend.
   */
  private fetchData() {
    this.loading = true;
    this.worksService.fetchUserWorks().subscribe(works => {
      this.works = works.reverse();
      this.loading = false;
    });
  }

  /**
   * Filters the works list by published content.
   */
  filterByPublished() {
    if (this.isUnpubFiltered) {
      this.isPubFiltered = true;
      this.isUnpubFiltered = false;
      this.works = this.unfilteredList.filter(work => {return work.audit.published === models.ApprovalStatus.Approved});
    } else {
      this.unfilteredList = this.works;
      this.isPubFiltered = true;
      this.works = this.unfilteredList.filter(work => {return work.audit.published === models.ApprovalStatus.Approved});
    }
  }

  /**
   * Filters the works list by unpublished content.
   */
  filterByUnpublished() {
    if (this.isPubFiltered) {
      this.isUnpubFiltered = true;
      this.isPubFiltered = false;
      this.works = this.unfilteredList.filter(work => {return work.audit.published === models.ApprovalStatus.NotSubmitted});
    } else {
      this.unfilteredList = this.works;
      this.isUnpubFiltered = true;
      this.works = this.unfilteredList.filter(work => {return work.audit.published === models.ApprovalStatus.NotSubmitted});
    }
  }

  /**
   * Clears all filters.
   */
  clearFilter() {
    this.isPubFiltered = false;
    this.isUnpubFiltered = false;
    this.works = this.unfilteredList;
  }

  /**
   * Opens the new work form modal.
   */
  openNewWorkForm() {
    this.newWorkForm.open();
  }

  /**
   * Opens the edit work form modal.
   * 
   * @param work The work to edit
   */
  openEditWorkForm(work: models.Work) {
    this.editWorkForm.updateContent(EditWorkComponent, {workData: work});
    this.editWorkForm.open();
  }

  /**
   * Checks to see if the works array is empty.
   */
  isWorksEmpty() {
    if (this.works) {
      if (this.works.length === 0) {
        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * Confirms that the user really wants to delete their work. If true, send the request
   * to the backend. If false, do nothing.
   * 
   * @param workId The ID of the work we're deleting
   */
  askDelete(workId: string) {

  }

  /**
   * Fixes the display of category.
   * 
   * @param category The category to fix
   */
  fixCategory(category: models.Categories) {
    return models.Categories[category];
  }

  /**
   * Fixes the display of genres depending on category.
   * 
   * @param category To check which category it is
   * @param genres The list of genres
   */
  separateGenres(category: models.Categories, genres: string[]) {
    if (models.Categories[category] === 'Original Fiction' || models.Categories[category] === 'Fanfiction') {
      if (genres.length === 1) {
        return models.GenresFiction[genres[0]];
      } else {
        const theseGenres: string[] = [models.GenresFiction[genres[0]], models.GenresFiction[genres[1]]];
        return theseGenres.join(', ');
      }
    } else if (models.Categories[category] === 'Poetry') {
      return models.GenresPoetry[genres[0]];
    }
  }

  /**
   * Fixes the display of fandoms.
   * 
   * @param fandoms The fandoms to fix
   */
  separateFandoms(fandoms: models.Fandoms[]) {
    if (fandoms.length === 1) {
      return models.Fandoms[fandoms[0]];
    } else {
      let theseFandoms: string[] = new Array();
      fandoms.forEach(fandom => { theseFandoms.push(models.Fandoms[fandom]) });
      return theseFandoms.join(', ');
    }
  }

  /**
   * Takes the inputted search value and filters the works list to contain any matching
   * search terms.
   * 
   * TODO: Make this check for equivalent text regardless of capitalization.
   */
  searchFor() {
    const query: string = this.searchField.query.value;
    if (this.isPubFiltered) {
      this.works = this.works.filter(work => {
        return work.title.includes(query);
      });
    } else if (this.isUnpubFiltered) {
      this.works = this.works.filter(work => {
        return work.title.includes(query);
      });
    } else {
      this.unfilteredList = this.works;
      this.works = this.unfilteredList.filter(work => {
        return work.title.includes(query);
      });
    }
  }
}
