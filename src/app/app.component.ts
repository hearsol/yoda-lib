import { Component, OnInit } from '@angular/core';
import { YodaFloatService, YodaFloatRef } from 'projects/yoda-float/src/public_api';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormTestComponent } from './form-test/form-test.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {
  title = 'yoda-lib';
  isInited = new Subject<boolean>();
  formRef: YodaFloatRef<FormTestComponent>;

  constructor(private yodaFloatService: YodaFloatService) {
    this.yodaFloatService.isInitialized().pipe(takeUntil(this.isInited)).subscribe((res) => {
      if (res) {
        setTimeout(() => {
          this.isInited.next(true);
          this.openForm();
        });
      }
    });
  }

  ngOnInit(): void {}

  openForm() {
    if (this.formRef) {
      this.closeForm();
    } else {
      this.formRef = this.yodaFloatService.addComponent(FormTestComponent);
    }
  }

  closeForm() {
    if (this.formRef) {
      this.formRef.destroy();
      this.formRef = null;
    }
  }
}
