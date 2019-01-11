import { Component, OnInit } from '@angular/core';
import { YodaFloatService } from 'projects/yoda-float/src/public_api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'yoda-lib';
  isInited = true;
  constructor(private yodaFloatService: YodaFloatService) {
    console.log('started');
  }

  ngOnInit(): void {
  }
}
