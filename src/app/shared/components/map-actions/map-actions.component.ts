import { Component, OnInit } from '@angular/core';

/* Services */
import { MapBoxService } from '../../../core/services/mapBox.service';
/* Enums */
import { Annotation } from './../../enums/annotation.enum';

@Component({
  selector: 'app-map-actions',
  templateUrl: './map-actions.component.html',
  styleUrls: ['./map-actions.component.scss']
})
export class MapActionsComponent implements OnInit {
  constructor(private mapBoxService: MapBoxService) {}

  // tslint:disable-next-line:typedef
  ngOnInit() {}

  // tslint:disable-next-line:typedef
  addMapAnnotation(type) {
    switch (type) {
      case Annotation.POLYGON:
        return this.mapBoxService.drawPolygon();

      case Annotation.LINESTRING:
        return this.mapBoxService.drawLinestring();

      case Annotation.POINT:
        return this.mapBoxService.drawPoint();

      case Annotation.PINS:
        return this.mapBoxService.drawPins();

      case Annotation.CLUSTER:
        return this.mapBoxService.drawCluster();

        // tslint:disable-next-line:label-position
        defaut: break;
    }
  }
}
