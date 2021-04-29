import { Component, OnInit, OnDestroy } from '@angular/core';

/* Rxjs */
import { Observable, Subscription } from 'rxjs';
import { MapBoxService } from '../../../core/services/mapBox.service';
/* Directives */
import { ClickElsewhereDirective } from './../../directives/clickElsewhere.directive';

@Component({
  selector: 'app-locations-list',
  templateUrl: './locations-list.component.html',
  styleUrls: ['./locations-list.component.scss']
})

export class LocationsListComponent implements OnInit, OnDestroy {

  locUpdatedSub$: Subscription;
  locSuggestions;

  constructor( private mapBoxService: MapBoxService ) { }

  // tslint:disable-next-line:typedef
  ngOnInit() {
    this.locUpdatedSub$ = this.mapBoxService.currLocationUpdated
      .subscribe((locationSuggestions) => {
        this.locSuggestions = locationSuggestions;
      });
  }

  // tslint:disable-next-line:typedef
  ngOnDestroy() {
    this.locUpdatedSub$.unsubscribe();
  }

  // tslint:disable-next-line:typedef
  setLocation(location) {
    this.mapBoxService.zoomMapOnLocation(location?.center);
    this.mapBoxService.currLocationData = location;
    this.locSuggestions = [];
  }

  // tslint:disable-next-line:typedef
  closeDropdown() {
    this.locSuggestions = [];
  }

}
