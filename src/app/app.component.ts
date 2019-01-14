import { Component, OnInit } from '@angular/core';
import { YodaFloatService } from 'projects/yoda-float/src/public_api';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'yoda-lib';
  isInited = new Subject<boolean>();
  constructor(private yodaFloatService: YodaFloatService) {
    this.yodaFloatService.isInitialized().pipe(
      takeUntil(this.isInited)
    ).subscribe(res => {
      if (res) {
        setTimeout(() => {
          this.isInited.next(true);
        });
      }
    });
  }

  ngOnInit(): void {
  }
}
