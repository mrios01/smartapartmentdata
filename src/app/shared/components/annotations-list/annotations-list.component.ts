import { Component, OnInit, OnDestroy } from '@angular/core';

/* Store */
import { Store } from '@ngrx/store';
import { AppState } from '../../../state/app.state';
/* Rxjs */
import { Subscription } from 'rxjs';
/* Services */
import { MapBoxService } from './../../../core/services/mapBox.service';
/* Enums */
import { Annotation } from '../../enums/annotation.enum';
/* Models */
import { IAnnotation } from '../../models/annotation.model';
/* Actions */
import {
  ADD_ANNOTATION,
  REMOVE_ANNOTATION
} from '../../../state/annotations.actions';

@Component({
  selector: 'app-annotations-list',
  templateUrl: './annotations-list.component.html',
  styleUrls: ['./annotations-list.component.scss']
})
export class AnnotationsListComponent implements OnInit, OnDestroy {
  activeAnnotUpdatedSub$: Subscription;
  state;
  selectedAnnotId;

  constructor(
    private store: Store<AppState>,
    private mapBoxService: MapBoxService
  ) {}

  // tslint:disable-next-line:typedef
  ngOnInit() {
    this.store
      .select(state => state)
      .subscribe(data => {
        this.state = data;
      });

    this.activeAnnotUpdatedSub$ = this.mapBoxService.activeAnnotUpdated.subscribe(
      selectedAnnotId => {
        this.selectedAnnotId = selectedAnnotId;
      }
    );
  }

  // tslint:disable-next-line:typedef
  ngOnDestroy() {
    this.activeAnnotUpdatedSub$.unsubscribe();
  }

  // tslint:disable-next-line:typedef
  deleteAnnotation(id, type) {
    this.store.dispatch({
      type: REMOVE_ANNOTATION,
      payload: { id, type } as IAnnotation
    });

    if (type === Annotation.POINT) {
      return this.mapBoxService.drawPoint('repaint');
    }
    if (type === Annotation.POLYGON) {
      return this.mapBoxService.drawPolygon('repaint');
    }
    if (type === Annotation.LINESTRING) {
      return this.mapBoxService.drawLinestring('repaint');
    }
    if (type === Annotation.PINS) {
      return this.mapBoxService.drawPins('repaint');
    }
    if (type === Annotation.CLUSTER) {
      return this.mapBoxService.drawCluster('repaint');
    }
  }

  // tslint:disable-next-line:typedef
  setActiveAndZoomMap(id, type, center) {
    this.selectedAnnotId = id;
    this.mapBoxService.zoomMapOnLocation(center);
  }
}
