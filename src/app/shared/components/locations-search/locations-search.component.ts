import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

/* Rxjs */
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, map, take } from 'rxjs/operators';
/* Services */
import { MapBoxService } from '../../../core/services/mapBox.service';
import { ToasterService } from '../../../core/services/toastr.service';
import { HttpService } from '../../../core/services/http.service';
/* Models */
import { GeocodeResponse } from '../../models/geocodeResponse.model';

@Component({
  selector: 'app-locations-search',
  templateUrl: './locations-search.component.html',
  styleUrls: ['./locations-search.component.scss']
})

export class LocationsSearchComponent implements OnInit {

  @ViewChild('textinp') textInput: ElementRef;
  searchTerm;
  locations;

  constructor(
    private mapBoxService: MapBoxService,
    private toastService: ToasterService,
    private httpService: HttpService,
  ) { }

  // tslint:disable-next-line:typedef
  ngOnInit() { }

  // tslint:disable-next-line:typedef
  searchLocation() {

    const typeEvent = fromEvent(this.textInput.nativeElement, 'input').pipe(
      map((e: KeyboardEvent) => (e.target as HTMLInputElement).value),
      filter(text => text.length > 2),
      debounceTime(1000),
      distinctUntilChanged(),
      take(1),
      switchMap(searchTerm => this.httpService.fetchLocations(searchTerm))
    );

    typeEvent.subscribe((locationSuggestions: GeocodeResponse) => {
        this.mapBoxService.currLocationUpdated.next(locationSuggestions?.features);
        this.mapBoxService.currLocationData = locationSuggestions;
      },
      (err) => {
        this.mapBoxService.currLocationUpdated.next([]);
        this.toastService.showToast('error', 'ERROR', 'Failed retrieving locations')
      });
  }
}
