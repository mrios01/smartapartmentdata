import { Component, OnInit } from '@angular/core';
import { MapBoxService } from '../../core/services/mapBox.service';


@Component({
  selector: 'app-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.scss']
})

export class InfoPanelComponent implements OnInit {

  constructor( private mapBoxService: MapBoxService ) { }

  ngOnInit() { }
}
