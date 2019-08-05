import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone, TemplateRef, AfterViewChecked, Renderer2 } from '@angular/core';
import { ValidationErrors, Validators, FormGroup, ValidatorFn, FormControl, AsyncValidatorFn } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { isInteger } from 'lodash';
import { debounceTime } from 'rxjs/operators';
import { YodaFormOptions, YodaFormControlComponent } from './yoda-form-control.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'yoda-form.unit',
  templateUrl: './yoda-form.component.html',
  styleUrls: [ './yoda-form.component.scss' ]
})
export class YodaFormComponent implements OnInit {
  @ViewChild('yodaForm') yodaForm: YodaFormControlComponent;
  reload$ = new Subject<string>();
  refresh$ = new Subject<string>();

  options: YodaFormOptions;
  constructor() {
  }

  ngOnInit() {}

  refreshState() {
    this.refresh$.next('refresh');
  }

  reload() {
    this.reload$.next('reload');
  }

  setValue(name: string, value: any) {
    if (this.yodaForm) {
      this.yodaForm.setValue(name, value);
    }
  }

  setFocus(name: string) {
    if (this.yodaForm) {
      this.yodaForm.setFocus(name);
    }
  }

  setOptions(options: YodaFormOptions): void {
    this.options = options;
  }

  _getDisabled() {
    if (this.yodaForm && this.yodaForm.form) {
      return this.yodaForm.form.pristine || this.yodaForm.form.invalid ? 'true' : null;
    }
    return 'true';
  }
  _onSave() {
    if (this.yodaForm) {
      this.yodaForm._onSave();
    }
  }

  _onClose() {
    if (this.yodaForm) {
      this.yodaForm._onClose();
    }
  }

}
