import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/* Mapbox */
import mapboxgl from 'mapbox-gl';
/* Store */
import { Store } from '@ngrx/store';
import { AppState } from '../../state/app.state';
/* Rxjs */
import { Observable, Subject } from 'rxjs';
/* Services */
import { ToasterService } from './toastr.service';
import { HttpService } from './http.service';
/* Enums */
import { Annotation } from '../../shared/enums/annotation.enum';
/* Models */
import MapProps from '../../shared/models/mapProps.model';
import { IAnnotation } from '../../shared/models/annotation.model';
/* Actions */
import { ADD_ANNOTATION, REMOVE_ANNOTATION } from '../../state/annotations.actions';

@Injectable({
  providedIn: 'root'
})

export class MapBoxService {

  currLocationUpdated = new Subject<any>();
  activeAnnotUpdated = new Subject<any>();
  annotations$: Observable<IAnnotation[]>;
  defaultCoordinates = [151.2274292, -33.890842]; // Bondi Beach
  currLocationData;
  state;
  map;

  constructor(
    private store: Store<AppState>,
    private toastService: ToasterService,
    private httpService: HttpService
  ) {

    mapboxgl.accessToken = environment.ACCESS_TOKEN;

    this.store.select(state => state).subscribe(data => {
      this.state = data;
    });
  }

  // tslint:disable-next-line:typedef

  getAnnotationProps(type) {

    if (type == Annotation.POINT){
      return this.state.Annotations.map(annot => {
        if (annot.type != type) { return {}; }

        console.log('getAnnotationProps Point state ');
        console.log(this.state);

        return {
          type: 'Feature',
          geometry: { type,
            coordinates: annot?.center || []
          },
          properties: { title: '' }
        };
      });
    }

    if (type == Annotation.PINS) {
      const pinsRes = this.state.Annotations.filter( annot => annot.type == type );

      console.log('getAnnotationProps PINS state ');
      console.log(this.state);
      console.log('PINS Res ');
      console.log(this.state.Annotations.filter( annot => annot.type == type ));


      return [...pinsRes?.[0]?.features];
    }

    if (type == Annotation.CLUSTER) {
      const clusterRes = this.state.Annotations.filter( annot => annot.type == type );

      console.log('getAnnotationProps CLUSTER state ');
      console.log(this.state);
      console.log('CLUSTER Res ');
      console.log(this.state.Annotations.filter( annot => annot.type == type ));


      return [...clusterRes?.[0]?.features];
    }

    if (type == Annotation.POLYGON) {
      const polygonRes = this.state.Annotations.filter( annot => annot.type == type );

      console.log('getAnnotationProps Polygon state ');
      console.log(this.state);
      console.log('Polygon Res ');
      console.log(this.state.Annotations.filter( annot => annot.type == type ));


      return [...polygonRes?.[0]?.features];
    }

    if (type == Annotation.LINESTRING) {
      const linestringRes = this.state.Annotations.filter( annot => annot.type == type );

      console.log('getAnnotationProps Linestring state ');
      console.log(this.state);

      return {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type,
            coordinates: linestringRes?.[0]?.lineSrtingPath || []
          }
        }
      };
    }
  }


  drawMap(mapProps: MapProps) {

    if (!mapProps?.containerID) { return; }

    console.log('mapProps ');
    console.log(mapProps);

    this.map = new mapboxgl.Map({
      container: mapProps.containerID,
      style: 'https://api.maptiler.com/maps/eef16200-c4cc-4285-9370-c71ca24bb42d/style.json?key=CH1cYDfxBV9ZBu1lHGqh ',
      center: [
        mapProps?.lat || this.defaultCoordinates[0],
        mapProps?.lang || this.defaultCoordinates[1]
      ],
      zoom: 12
    });
  }

  drawPins(action = null) {

        if (!this.canAddAnnotation('Pins')) { return this.toastService.showToast(
          'warning', 'Be Aware!',
          !Object.values(this.currLocationData || []).length ? 'Must Choose Location First!' : 'Pins Annotation Already Exist!'
        );
        }

    this.httpService.fetchPinsArea().subscribe((res: any) => {

      const geojson = res;
      let count = 0;
      const coords = [];
      let xcoord = [];
      let ycoord = [];

      for (const entry of geojson.features) {
        entry.properties.position = count;

        xcoord.push(entry.geometry.coordinates[0]);
        ycoord.push(entry.geometry.coordinates[1]);

        coords.push(entry.geometry.coordinates);
        // console.log(entry);
        count++;
      }

      //let point: any;

      const x_min = Math.min(...xcoord);
      const x_max = Math.max(...xcoord);
      const y_min = Math.min(...ycoord);
      const y_max = Math.max(...ycoord);

      const newbbox = [[x_min, y_min],[x_max, y_max]];

      const x = JSON.parse(JSON.stringify(geojson));

      try {

        if (this.map.getLayer('pinsLayer')) { this.map.removeLayer('pinsLayer'); }
        if (this.map.getSource('points-data')) { this.map.removeSource('points-data'); }
        console.log("Pins Action: ", action);
        if (action != 'repaint') {
          this.store.dispatch({
            type: ADD_ANNOTATION,
            payload: {
              id: 'pinsLayer',
              name: `${Annotation.PINS} - [${this.currLocationData.center}]`,
              type: Annotation.PINS,
              center: this.currLocationData.center,
              bbox: this.currLocationData.bbox,
              features: res.features,
            } as IAnnotation
          });


// Holds mousedown state for events. if this
// flag is active, we move the point on `mousemove`.
        let isDragging;

// Is the cursor over a point? if this
// flag is active, we listen for a mousedown event.
        let isCursorOverPoint;
        let activeFeature;

        const self = this;

        const coordinates = document.getElementById('coordinates');

        const canvas = this.map.getCanvasContainer();

        function mouseDown() {
          if (!isCursorOverPoint) { return; }

          isDragging = true;

          // Set a cursor indicator
          canvas.style.cursor = 'grab';

          // Mouse events
          self.map.on('mousemove', onMove);
          self.map.once('mouseup', onUp);
        }

        function onMove(e) {
          if (!isDragging) { return; }
          // console.log('GeoJson inside function: ', geojson);
          // console.log('GeoJson features inside function: ', geojson.features);

          // Set a UI indicator for dragging.
          canvas.style.cursor = 'grabbing';

          // Update the Point feature in `geojson` coordinates
          // and call setData to the source layer `point` on it.

          x.features[activeFeature.properties.position].geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];

          self.map.getSource('points-data').setData(x);

        }

        function onUp(e) {
          if (!isDragging) { return; }

          // Print the coordinates of where the point had
          // finished being dragged to on the map.
          coordinates.style.display = 'block';
          coordinates.innerHTML = 'Longitude: ' + e.lngLat.lng + '<br />Latitude: ' + e.lngLat.lat;
          canvas.style.cursor = '';
          isDragging = false;

          // Unbind mouse events
          self.map.off('mousemove', onMove);
        }

        // Add a single point to the map
        this.map.addSource('points-data', {
          type: 'geojson',
          data:  geojson
        });

        this.map.addLayer({
          id: 'pinsLayer',
          type: 'circle',
          source: 'points-data',
          paint: {
            'circle-radius': 10,
            'circle-color': '#e5dbff'
          }
        });

        // When the cursor enters a feature in the pinsLayer layer, prepare for dragging.
        this.map.on('mouseenter', 'pinsLayer', function(e, a, c, ) {
          // tslint:disable-next-line:no-unused-expression
          self.map.setPaintProperty('pinsLayer', 'circle-color', '#a770ff');
          canvas.style.cursor = 'move';
          isCursorOverPoint = true;
          self.map.dragPan.disable();
          activeFeature = e.features[0];
          console.log(e, activeFeature);
        });

        this.map.on('mouseleave', 'pinsLayer', function() {
          self.map.setPaintProperty('pinsLayer', 'circle-color', '#d0b3ff');
          canvas.style.cursor = '';
          isCursorOverPoint = false;
          self.map.dragPan.enable();
        });

        this.map.on('mousedown', mouseDown);

        this.map.doubleClickZoom.enable();

        this.map.fitBounds(newbbox, {padding: {top: 10, bottom:25, left: 15, right: 5}});

        this.map.on('click', 'pinsLayer', (e) => {
          const layerID = e?.features?.[0]?.layer.id;

          if (layerID) { this.activeAnnotUpdated.next(layerID); }
        });
        }
      } catch (error) {
        if (action != 'repaint') { this.toastService.showToast('error', 'ERROR', 'Failed Adding Pins!'); }
      }
    });

    this.zoomMapOnLocation(this.currLocationData.center);

  }

  // tslint:disable-next-line:typedef
  drawCluster(action = null) {

    if (!this.canAddAnnotation('Cluster')) { return this.toastService.showToast(
      'warning', 'Be Aware!',
      !Object.values(this.currLocationData || []).length ? 'Must Choose Location First!' : 'Cluster Annotation Already Exist!'
    );
    }

    this.httpService.fetchPinsArea().subscribe((res: any) => {

      const geojson = res;
      let count = 0;
      const coords = [];
      let xcoord = [];
      let ycoord = [];

      for (const entry of geojson.features) {
        entry.properties.position = count;

        xcoord.push(entry.geometry.coordinates[0]);
        ycoord.push(entry.geometry.coordinates[1]);

        coords.push(entry.geometry.coordinates);
        // console.log(entry);
        count++;
      }

      //let point: any;

      const x_min = Math.min(...xcoord);
      const x_max = Math.max(...xcoord);
      const y_min = Math.min(...ycoord);
      const y_max = Math.max(...ycoord);

      const newbbox = [[x_min, y_min],[x_max, y_max]];

      const x = JSON.parse(JSON.stringify(geojson));
      const self = this;
      try {

        if (this.map.getLayer('clusterLayer')) { this.map.removeLayer('clusterLayer'); }
        if (this.map.getLayer('cluster-count')) { this.map.removeLayer('cluster-count'); }
        if (this.map.getLayer('unclustered-point')) { this.map.removeLayer('unclustered-point'); }
        if (this.map.getSource('cluster-data')) { this.map.removeSource('cluster-data'); }

        if (action != 'repaint') {
          this.store.dispatch({
            type: ADD_ANNOTATION,
            payload: {
              id: 'clusterLayer',
              name: `${Annotation.CLUSTER} - [${this.currLocationData.center}]`,
              type: Annotation.CLUSTER,
              center: this.currLocationData.center,
              bbox: this.currLocationData.bbox,
              features: res.features,
            } as IAnnotation
          });


        // Add a single point to the map
        this.map.addSource('cluster-data', {
          type: 'geojson',
          data:  geojson,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });

        this.map.addLayer({
          id: 'clusterLayer',
          type: 'circle',
          source: 'cluster-data',
          paint: {
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              100,
              30,
              750,
              40
            ],
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#ecc4c8',
              100,
              '#5ac18e',
              750,
              '#d1a343'
            ]
          }
        });

        this.map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'cluster-data',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        });

        this.map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'cluster-data',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#dd6168',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#00563f'
          }
        });

        // inspect a cluster on click
        this.map.on('click', 'clusterLayer', function (e) {
          const features = self.map.queryRenderedFeatures(e.point, {
            layers: ['clusterLayer']
          });
          const clusterId = features[0].properties.cluster_id;
          self.map.getSource('cluster-data').getClusterExpansionZoom(
            clusterId,
            function (err, zoom) {
              if (err) return;

              self.map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
              });
            }
          );
        });


        this. map.on('mouseenter', 'clusterLayer', function () {
          self.map.getCanvas().style.cursor = 'pointer';
        });
        this.map.on('mouseleave', 'clusterLayer', function () {
          self.map.getCanvas().style.cursor = '';
        });

        //this.map.doubleClickZoom.enable();

        this.map.fitBounds(newbbox, {padding: {top: 10, bottom:25, left: 15, right: 5}});

        this.map.on('click', 'clusterLayer', (e) => {
          const layerID = e?.features?.[0]?.layer.id;

          if (layerID) { this.activeAnnotUpdated.next(layerID); }
        });
        }
      } catch (error) {
        if (action != 'repaint') { this.toastService.showToast('error', 'ERROR', 'Failed Adding Cluster!'); }
      }
    });

    this.zoomMapOnLocation(this.currLocationData.center);

  }

  drawPolygon(action = null) {

    if (!this.canAddAnnotation('Polygon')) { return this.toastService.showToast(
      'warning', 'Be Aware!',
      !Object.values(this.currLocationData || []).length ? 'Must Choose Location First!' : 'Polygon Annotation Already Exist!'
    );
    }

    this.httpService.fetchPolygoneArea(this.currLocationData).subscribe((res: any) => {
      console.log('Polygon Res: ', res);

      try {

        if (this.map.getLayer('polygonLayer')) { this.map.removeLayer('polygonLayer'); }
        if (this.map.getSource('iso')) { this.map.removeSource('iso'); }

        if (action != 'repaint') {
          this.store.dispatch({
            type: ADD_ANNOTATION,
            payload: {
              id: 'polygonLayer',
              name: `${Annotation.POLYGON} - [${this.currLocationData.center}]`,
              type: Annotation.POLYGON,
              center: this.currLocationData.center,
              bbox: this.currLocationData.bbox,
              features: res.features,
            } as IAnnotation
          });
        }

        this.map.addSource('iso', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features:  this.getAnnotationProps(Annotation.POLYGON)
          }
        });

        this.map.addLayer({
          id: 'polygonLayer',
          type: 'fill',
          source: 'iso',
          layout: {},
          paint: {
            'fill-color': '#c9bdb5',
            'fill-opacity': 0.7
          }
        });

        this.map.on('click', 'polygonLayer', (e) => {
          const layerID = e?.features?.[0]?.layer.id;

          if (layerID) { this.activeAnnotUpdated.next(layerID); }
        });

      } catch (error) {
        if (action != 'repaint') { this.toastService.showToast('error', 'ERROR', 'Failed Adding Polygon!'); }
      }
    });

    this.zoomMapOnLocation(this.currLocationData.center);
  }

  drawLinestring(action = null) {

    if (!this.canAddAnnotation('LineString')) { return this.toastService.showToast(
      'warning', 'Be Aware!',
      !Object.values(this.currLocationData || []).length ? 'Must Choose Location First!' : 'LineString Annotation Already Exist!'
    );
    }

    this.httpService.fetchLinestringArea(this.currLocationData).subscribe((res: any) => {

      try {

        if (this.map.getLayer('lineStringLayer')) { this.map.removeLayer('lineStringLayer'); }
        if (this.map.getSource('route')) { this.map.removeSource('route'); }

        if (action != 'repaint' || !this.state.Annotation.some((annot) => annot.id == 'lineStringLayer')) {
          this.store.dispatch({
            type: ADD_ANNOTATION,
            payload: {
              id: 'lineStringLayer',
              name: `${Annotation.LINESTRING} - [${this.currLocationData.center}]`,
              type: Annotation.LINESTRING,
              center: this.currLocationData.center,
              bbox: this.currLocationData.bbox,
              lineSrtingPath: [...res.routes[0].geometry.coordinates],
            } as IAnnotation
          });
        }

        this.map.addSource('route', this.getAnnotationProps(Annotation.LINESTRING));

        this.map.addLayer({
          id: 'lineStringLayer',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#888',
            'line-width': 8
          }
        });

        this.map.on('click', 'lineStringLayer', (e) => {
          const layerID = e?.features?.[0]?.layer.id;

          if (layerID) { this.activeAnnotUpdated.next(layerID); }
        });

        this.zoomMapOnLocation(this.currLocationData.center);

      } catch (error) {
        if (action != 'repaint') { this.toastService.showToast('error', 'ERROR', 'Failed Adding Linestring!'); }
      }
    });
  }

  drawPoint(action = null) {

    if (!this.canAddAnnotation('Point')) { return this.toastService.showToast(
      'warning', 'Be Aware!',
      !Object.values(this.currLocationData || []).length ? 'Must Choose Location First!' : 'Point Annotation Already Exist!'
    );
    }

    try {

      const LAYER_UNIQUE_ID = `${this.currLocationData.id}-${Annotation.POINT}`;

      if (action != 'repaint'){
        this.store.dispatch({
          type: ADD_ANNOTATION,
          payload: {
            id: LAYER_UNIQUE_ID,
            name: `${Annotation.POINT} - [${this.currLocationData.center}]`,
            type: Annotation.POINT,
            center: this.currLocationData.center,
          } as IAnnotation
        });
      }

      if (this.map.getSource('pointsSource')) {
        return this.map.getSource('pointsSource')
          .setData({
            type: 'FeatureCollection',
            features: this.getAnnotationProps(Annotation.POINT)
          });
      }

      this.map.addSource('pointsSource', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: this.getAnnotationProps(Annotation.POINT)
        }
      });

      this.map.addLayer({
        id: LAYER_UNIQUE_ID,
        type: 'circle',
        source: 'pointsSource',
        paint: {
          'circle-radius': 20,
          'circle-color': '#0072fa'
        }
      });

      this.map.on('click', LAYER_UNIQUE_ID, (e) => {
        const layerID = e?.features?.[0]?.layer.id;

        if (layerID) { this.activeAnnotUpdated.next(layerID); }
      });

      this.zoomMapOnLocation(this.currLocationData.center);

    } catch (error) {
      this.toastService.showToast('error', 'ERROR', 'Failed Adding Point!');
    }
  }

  zoomMapOnLocation(coordinates = null) {

    if (!this.map) { return; }

    this.map.flyTo({ center: coordinates || this.defaultCoordinates });
  }

  canAddAnnotation(type) {

    if (!this.map || !this.currLocationData) { return false; }

    return !this.state.Annotations.some((annot) => annot.id == `${this.currLocationData.id}-${type}`);
  }



}
