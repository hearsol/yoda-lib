import {
  Component, OnInit, OnDestroy, ViewChild,
  ElementRef, NgZone, Renderer, TemplateRef, AfterViewChecked
} from '@angular/core';
import { ValidationErrors, Validators, FormGroup, ValidatorFn, FormControl, AsyncValidatorFn } from '@angular/forms';
import { faTimes, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { isInteger } from 'lodash';
import { debounceTime } from 'rxjs/operators';

export type YodaFormActionState = 'enabled' | 'disabled' | 'hide';
export type YodaFormActionStateFunc = (name?: string, value?: any) => YodaFormActionState;
export type YodaFormButtonColor = 'success' | 'info' | 'danger' | 'primary' | 'secondary' | 'warning';
export type YodaFormWidth = 'col' | 'col-1' | 'col-2' | 'col-3' | 'col-4' | 'col-5' | 'col-6' | 'col-7' |
  'col-8' | 'col-9' | 'col-10' | 'col-11' | 'col-12';
export type YodaFormType = 'row' | 'subtitle' | 'template' |
  'text' | 'textarea' | 'date' | 'number' | 'decimal' | 'typeahead' |
  'file' | 'file-multiple' |
  'select' | 'search-list' | 'button';
export interface YodaFormActionButton {
  title: string;
  onState?: YodaFormActionStateFunc;
  color?: YodaFormButtonColor;
  onClick: (value?: any) => void;
}

export interface YodaFormField {
  title?: any;
  name?: string;
  value?: any;
  type: YodaFormType;
  required?: boolean;
  options?: {
    value: string;
    text: string;
  }[];
  asyncOptions?: Observable<{ value: any, text: string }[]>;
  placeholder?: string;
  onSearchList?: (text: Observable<string>) => Observable<{
    value: any;
    text: string;
  }[]>;
  onTypeahead?: (text: Observable<string>) => Observable<any[]>;
  validators?: ValidatorFn[];
  asyncValidators?: AsyncValidatorFn[];
  onClick?: (name: string, value?: any) => void;
  onState?: YodaFormActionStateFunc;
  onError?: (name: string, errors: ValidationErrors) => string;
  color?: YodaFormButtonColor;
  width?: YodaFormWidth;
  onValueChanged?: (value: any) => void;
  prependButton?: YodaFormActionButton;
  appendButton?: YodaFormActionButton;
  template?: TemplateRef<any>;
  templateContext?: any;
}

export interface YodaFormFieldRow extends YodaFormField {
  columns?: YodaFormField[];
}

export type YodaFormFunc = (action: string, data?: any) => void;

export interface YodaFormOptions {
  fields: YodaFormFieldRow[];
  onAction: YodaFormFunc;
  title: string;
  saveButtonText?: string;
  onValueChanged?: (value: any) => void;
}


interface FormField {
  _id: string;
  title: any;
  name: string;
  value?: any;
  type: YodaFormType;
  required?: boolean;
  options?: {
    value: string;
    text: string;
  }[];
  asyncOptions?: Observable<{ value: any, text: string }[]>;
  placeholder?: string;
  onSearchList?: (text: Observable<string>) => Observable<{
    value: any;
    text: string;
  }[]>;
  onTypeahead?: (text: Observable<string>) => Observable<any[]>;
  errors?: ValidationErrors | null;
  validators?: ValidatorFn[];
  asyncValidators?: AsyncValidatorFn[];
  _search?: Observable<any[]>;
  onClick?: (name: string, value?: any) => void;
  onState: YodaFormActionStateFunc;
  state: YodaFormActionState;
  class: any;
  onValueChanged?: (value: any) => void;
  width: 'col' | 'col-1' | 'col-2' | 'col-3' | 'col-4' | 'col-5' | 'col-6' | 'col-7'
  | 'col-8' | 'col-9' | 'col-10' | 'col-11' | 'col-12';
  colClass: any;
  prependButton: FormActionButton;
  appendButton: FormActionButton;
  template: TemplateRef<any>;
  templateContext: any;
  onError: (name: string, errors: ValidationErrors) => string;
  files?: any;
}

interface FormActionButton {
  title: string;
  onState: YodaFormActionStateFunc;
  color: YodaFormButtonColor;
  state: YodaFormActionState;
  class: any;
  onClick: () => void;
}

interface FormRow {
  rowClass: any;
  columns: FormField[];
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'yoda-form.unit',
  templateUrl: './yoda-form.component.html',
  styleUrls: ['./yoda-form.component.scss']
})
export class YodaFormComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('yodaFormElement') yodaFormElement: ElementRef;

  closeIcon = faTimes;
  calendarIcon = faCalendarAlt;

  data: any;
  _d: any;
  _refreshState: Subject<string> = new Subject<string>();

  scrollListner: Subject<any> = null;
  needScroll = true;
  isAdd = true;
  _subscribers: any = {};
  _formSubscribers: any = {};
  errors: any = {};
  form: FormGroup;
  options: YodaFormOptions;
  formData: FormField[] = [];
  formRows: FormRow[] = [];

  formControls: { [key: string]: FormControl; };
  controlValuesChanges: { [key: string]: Observable<any>; };

  isFirstBuild = true;

  constructor(
    private ngZone: NgZone,
    private renderer: Renderer,
  ) {
    this._subscribers.refreshStateSubscription = this._refreshState
      .pipe(debounceTime(5))
      .subscribe(_ => {
        this.formData.forEach(data => {
          if (data.onState) {
            data.state = data.onState(data.name, this._d);
          }
          if (data.prependButton && data.prependButton.onState) {
            data.prependButton.state = data.prependButton.onState('', this._d);
          }
          if (data.appendButton && data.appendButton.onState) {
            data.appendButton.state = data.appendButton.onState('', this._d);
          }
        });
      });
  }

  ngOnDestroy(): void {
    this._cleanUpSubscribes();
    this._cleanUpFormSubscribes();
  }

  ngAfterViewChecked(): void {
    if (this.needScroll) {
      setTimeout(() => {
        this.needScroll = false;
        if (this.scrollListner) {
          this.scrollListner.next('toRight');
        }
      });
    }
  }
  ngOnInit() { }

  refreshState() {
    this._refreshState.next();
  }

  setValue(name: string, value: any) {
    if (this.formControls[name]) {
      this.formControls[name].setValue(value);
    }
  }

  setFocus(name: string) {
    const id = this._findIdByName(name);
    if (id) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.renderer.selectRootElement(`#${id}`).focus();
        }, 0);
      });
    }
  }

  setOptions(options: YodaFormOptions): void {
    this.options = options;
    this.formRows = [];

    const val: {
      formData: FormField[],
      d: any
    } = this.options.fields.reduce((p, i, idx) => {
      const row: FormRow = {
        rowClass: { 'form-row': true },
        columns: []
      };

      if (i.type === 'row') {
        if (i.columns && Array.isArray(i.columns)) {
          i.columns.forEach( (c, cIdx) => {
            const _f = this._buildFormField(c, idx, cIdx);
            p.formData.push(_f);
            row.columns.push(_f);
            this._initFormValue(p.d, c);
          });
        }
      } else {
        const _f = this._buildFormField(i, idx);
        p.formData.push(_f);
        row.columns.push(_f);
        this._initFormValue(p.d, i);
      }
      this.formRows.push(row);
      return p;
    }, { formData: [], d: {} });
    this.formData = val.formData;
    this._d = val.d;
    this.buildForm();
  }

  _onSave() {
    this.onValueChanged();
    this.options.onAction('save', this._d);
  }

  _onClose() {
    this.options.onAction('close');
  }

  _isHiddenRow(row: FormRow): boolean {
    return row.columns ? row.columns.every(col => col.state === 'hide') : true;
  }

  getTitle(f: FormField) {
    if (f.title && typeof f.title === 'function') {
      return f.title();
    }
    return f.title || '';
  }

  protected _findIdByName(name: string) {
    const fr = this.formData.find(f => f.name === name);
    if (fr) {
      return fr._id;
    }
  }

  protected _initFormValue(data: any, field: YodaFormField) {
    if (this._indexObjectHasKey(this._d, field.name)) {
      this._indexObject(data, field.name, this._indexObject(this._d, field.name));
    } else if (field.value) {
      this._indexObject(data, field.name, field.value);
    }
  }

  protected _buildFormField(field: YodaFormField, rowIdx: number, colIdx?: number): FormField {
    const colClass: any = {};
    if (field.width) {
      colClass[field.width] = true;
    } else {
      colClass['col'] = true;
    }
    let _id = `form${rowIdx}`;
    if (colIdx) {
      _id += `-${colIdx}`;
    }
    return {
      _id: _id,
      title: field.title,
      name: field.name,
      value: field.value,
      type: field.type,
      required: field.required,
      options: field.options ? field.options.slice() : [],
      asyncOptions: field.asyncOptions,
      placeholder: field.placeholder || '',
      onSearchList: field.onSearchList,
      onTypeahead: field.onTypeahead,
      validators: field.validators,
      asyncValidators: field.asyncValidators,
      onClick: field.onClick,
      onState: field.onState,
      state: field.onState ? field.onState(field.name) : 'enabled',
      class: this._getActionClass(field),
      onValueChanged: field.onValueChanged,
      width: field.width || 'col',
      colClass: colClass,
      prependButton: this._copyActionButton(field.prependButton),
      appendButton: this._copyActionButton(field.appendButton),
      template: field.template,
      templateContext: field.templateContext,
      onError: field.onError,
    };
  }

  protected _copyActionButton(action: YodaFormActionButton): FormActionButton {
    if (action) {
      return {
        title: action.title,
        onState: action.onState,
        state: action.onState ? action.onState() : 'enabled',
        class: this._getInputGroupActionClass(action.color || 'secondary'),
        color: action.color,
        onClick: action.onClick
      };
    }
    return undefined;
  }

  protected _getSearchList(form: FormField): Observable<any[]> {
    return;
  }

  _getErrorMsg(form: FormField): string {
    if (form.onError) {
      return form.onError(form.name, form.errors);
    }
    let str = '';
    Object.keys(form.errors).forEach(err => {
      if (err === 'required') {
        str += '필수 입력 입니다.';
      } else {
        if (typeof form.errors[err] === 'string') {
          str += form.errors[err];
        } else {
          str += `${err}`;
        }
      }
    });
    return str;
  }
  _onDblClick(form: FormField, value: any) {
  }

  protected _getInputGroupActionClass(color: YodaFormButtonColor) {
    const c: any = {};
    if (color) {
      c[`btn-outline-${color}`] = true;
    }
    return c;
  }
  protected _getActionClass(action: YodaFormField) {
    const c: any = {};
    if (action.color) {
      c[action.color] = true;
    }
    return c;
  }

  _indexObject(obj: any, is: any, value?: any): any {
    const regex = /\[(.*?)\]/;
    if (obj) {
      if (typeof is === 'string') {
        return this._indexObject(obj, is.split('.'), value);
      } else {
        if (!is || is.length === 0) {
          return obj;
        }

        const ar = regex.exec(is[0]);
        let _is = is[0];
        if (ar && ar.length > 0) {
          _is = ar[1];
        }
        if (is.length === 1 && value !== undefined) {
          return obj[_is] = value;
        } else {
          if (value !== undefined && obj[_is] === undefined) {
            const sar = regex.exec(is[1]);
            if (sar && sar.length > 0) {
              obj[_is] = [];
            } else {
              obj[_is] = {};
            }
          }
          return this._indexObject(obj[_is], is.slice(1), value);
        }
      }
    }
  }

  protected _indexObjectHasKey(obj: any, is: any): boolean {
    const regex = /\[(.*?)\]/g;

    if (obj && is) {
      if (typeof is === 'string') {
        return this._indexObjectHasKey(obj, is.split('.'));
      } else {
        const ar = regex.exec(is[0]);
        let _is = is[0];
        if (ar && ar.length > 0) {
          _is = ar[1];
        }
        if (is.length === 1) {
          return _is in obj;
        } else {
          if (_is in obj) {
            return this._indexObjectHasKey(obj[_is], is.slice(1));
          }
          return false;
        }
      }
    }
    return false;
  }

  protected buildForm(): void {
    this._cleanUpFormSubscribes();
    this.formControls = this.formData.reduce((pr, f) => {
      if (f.type === 'subtitle' || f.type === 'row' || f.type === 'template') {
        return pr;
      }
      let value;
      let validators = [];
      if (this._d && this._indexObjectHasKey(this._d, f.name)) {
        if (f.type === 'date') {
          value = this.toNgbDate(this._indexObject(this._d, f.name));
        } else {
          value = this._indexObject(this._d, f.name);
        }
      } else {
        switch (f.type) {
          case 'text':
            value = '';
            break;
          case 'textarea':
            value = '';
            break;
          case 'date':
            value = null;
            break;
        }
      }
      if (f.required) {
        validators.push(Validators.required);
      }
      if (f.validators && f.validators.length > 0) {
        validators = validators.concat(f.validators);
      }
      if (Array.isArray(f.asyncValidators) && f.asyncValidators.length > 0) {
        pr[f.name] = new FormControl(value, validators, f.asyncValidators);
      } else {
        pr[f.name] = new FormControl(value, validators);
      }

      if (f.onValueChanged) {
        this._formSubscribers['ctrl_' + f.name] = pr[f.name].valueChanges.subscribe((data: any) => f.onValueChanged(data));
      }
      if (f.type === 'search-list') {
        pr[f.name + 'search'] = new FormControl(value);
        f._search = f.onSearchList(pr[f.name + 'search'].valueChanges);
        setTimeout(() => {
          pr[f.name + 'search'].updateValueAndValidity({
            onlySelf: true,
            emitEvent: true
          });
        });
      }
      return pr;
    }, {});
    let dirty = false;
    if (this.form) {
      dirty = this.form.dirty;
    }
    this.form = new FormGroup(this.formControls);
    this._formSubscribers.valueChanges = this.form.valueChanges.subscribe(data => this.onValueChanged(data));
    this._formSubscribers.statusChanges = this.form.statusChanges.subscribe(data => this.onStatusChanges(data));
    this.onValueChanged();
    if (dirty) {
      setTimeout(() => {
        this.form.markAsDirty();
      });
    }
  }

  protected onValueChanged(data?: any) {
    if (!this.form) { return; }
    this.formData.forEach(f => {
      if (f.type !== 'subtitle') {
        if (f.type === 'date') {
          if (this.form.value[f.name]) {
            // this._d[f.name] = new Date(this.form.value[f.name]);
            this._indexObject(this._d, f.name, this.toDate(this.form.value[f.name]));
          } else {
            this._indexObject(this._d, f.name, null);
          }
        } else if (f.type === 'decimal' || f.type === 'number') {
          this._indexObject(this._d, f.name, Number(this.form.value[f.name]));
        } else {
          this._indexObject(this._d, f.name, this.form.value[f.name]);
        }
        const ctrl = this.formControls[f.name];

        if (ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched)) {
          f.errors = ctrl.errors;
        } else {
          f.errors = null;
        }
      }
    });
    this.errors = this.form.errors;
    if (this.options.onValueChanged) {
      this.options.onValueChanged(this._d);
    }
  }

  protected onStatusChanges(data?: any) {
    if (!this.form) { return; }
    this.formData.forEach(f => {
      if (f.type !== 'subtitle') {
        const ctrl = this.formControls[f.name];
        if (ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched)) {
          f.errors = ctrl.errors;
        } else {
          f.errors = null;
        }
      }
    });
    this.errors = this.form.errors;
  }

  _onFileChange(form: FormField, ev: any) {
    if (this.formControls[form.name] && ev.target.files) {
      if (form.type === 'file-multiple') {
        this.formControls[form.name].patchValue(
          ev.target.files
        );
        form.files = ev.target.files;
      } else {
        this.formControls[form.name].patchValue(
          ev.target.files[0]
        );
        form.files = ev.target.files[0];
      }
    }
  }

  transformDecimal(form: FormField, ev: any) {
    ev.target.value = this.comma(this._indexObject(this._d, form.name));
  }

  toNumeric(ev: any) {
    ev.target.value = ev.target.value.replace(/\D/g, '');
  }

  protected comma(num: number): string {
    if (num === null || num === undefined) {
      return '';
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  protected toNgbDate(date: Date): NgbDateStruct {
    return (date instanceof Date && !isNaN(date.getTime())) ? this._fromNativeDate(date) : null;
  }

  protected toDate(date: NgbDateStruct): Date {
    return date && isInteger(date.year) && isInteger(date.month) && isInteger(date.day) ?
      this._toNativeDate(date) : null;
  }

  protected _fromNativeDate(date: Date): NgbDateStruct {
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }

  protected _toNativeDate(date: NgbDateStruct): Date {
    const jsDate = new Date(date.year, date.month - 1, date.day, 12);
    // avoid 30 -> 1930 conversion
    jsDate.setFullYear(date.year);
    return jsDate;
  }

  protected _cleanUpSubscribes() {
    Object.keys(this._subscribers).forEach(key => {
      this._subscribers[key].unsubscribe();
    });
    this._subscribers = {};
  }
  protected _cleanUpFormSubscribes() {
    Object.keys(this._formSubscribers).forEach(key => {
      this._formSubscribers[key].unsubscribe();
    });
    this._formSubscribers = {};
  }
}
