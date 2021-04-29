import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';

/* Services */
import { MapBoxService } from '../../core/services/mapBox.service';
/* Models */
import MapProps from '../../shared/models/mapProps.model';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit, AfterViewInit {
  @ViewChild('map') mapElem;

  constructor(private mapBoxService: MapBoxService) {}

  // tslint:disable-next-line:typedef
  ngOnInit() {}

  // tslint:disable-next-line:typedef
  ngAfterViewInit() {
    const mapOptions: MapProps = {
      containerID: this.mapElem.nativeElement.id,
      lat: 151.274292,
      lang: -33.890842
    };
    this.mapBoxService.drawMap(mapOptions);
  }
}
