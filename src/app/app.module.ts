import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { MainComponent } from './components/main/main.component';

/* Store */
import { StoreModule } from '@ngrx/store';
import { annotationsReducer } from './state/annotations.reducer';
import { MapViewComponent } from './components/map-view/map-view.component';
import { InfoPanelComponent } from './components/info-panel/info-panel.component';
import { AnnotationsListComponent } from './shared/components/annotations-list/annotations-list.component';
import { LocationsListComponent } from './shared/components/locations-list/locations-list.component';
import { LocationsSearchComponent } from './shared/components/locations-search/locations-search.component';
import { MapActionsComponent } from './shared/components/map-actions/map-actions.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    MapViewComponent,
    InfoPanelComponent,
    AnnotationsListComponent,
    LocationsListComponent,
    LocationsSearchComponent,
    MapActionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({}),
    StoreModule.forRoot({Annotations : annotationsReducer})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
