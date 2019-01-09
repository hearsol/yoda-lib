import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Observable, of, concat, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { saveAs } from 'file-saver';

import * as momentImported from 'moment';
const moment = momentImported;

import * as XLSX from 'xlsx';

type AOA = Array<Array<any>>;
export type YodaTableActionState = 'enabled' | 'disabled' | 'hide';
export type YodaTableRowState = 'enabled' | 'completed' | 'selected' | 'disabled' | 'canceled';
export type YodaTableActionStateFunc = (id: string, dataRow: any, index?: number) => YodaTableActionState;
export interface YodaTableAction {
  type: 'button' | 'checkbox' | 'radio';
  label?: string;
  id: string;
  color?: 'success' | 'info' | 'danger'; //  | 'primary' | 'secondary' | 'warning';
  onAction: (id: string, dataRow: any, index?: number, checked?: boolean) => void;
  onState?: YodaTableActionStateFunc;
}

export interface YodaTableField {
  title: string;
  name: string;
  checkBox?: boolean;
  formatter?: (value: any, row?: any, isExport?: boolean) => string;
  sortable?: boolean;
  sortCompare?: (a: any, b: any) => number;
  align?: 'left' | 'right' | 'center';
  actions?: YodaTableAction[];
}


export interface YodaTablePage {
  total: number;
  data: any;
}

export type YodaTablePagingFunc = (pageNum: number, pageSize: number, sortInfo?: YodaTableSortInfo[]) => Observable<YodaTablePage>;

export interface YodaTablePagination {
  pageSize: number;
  startPage?: number;
}

export interface YodaTableOptions {
  fields: YodaTableField[];
  data?: any[];
  pagination?: number | YodaTablePagination | 'custom';
  pageSize?: number;
  asyncPaging?: YodaTablePagingFunc;
  onRowState?: (rowData: any, index: number) => YodaTableRowState;
  onSelectRow?: (rowData: any, index: number) => void;
}

export interface YodaTableSortInfo {
  name: string;
  dir: 'asc' | 'desc';
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'yoda-table',
  templateUrl: './yoda-table.component.html',
  styleUrls: ['./yoda-table.component.scss']
})
export class YodaTableComponent implements OnInit, OnChanges {
  @Input() reload: Observable<string>;
  @Input() pageChange: Observable<{page?: number, pageSize?: number}>;
  @Input() options: YodaTableOptions;

  refreshTableSubject = new Subject<any>();

  _reloadSubscription: any;
  _pageSubscription: any;
  pageSize = 15;
  currentPage = 1;
  totalSize = 0;
  skipStart = 0;
  skipEnd = 0;

  fieldSortInfo: YodaTableSortInfo;

  _fielddata: {
    name: string;
    class: any;
    formatter: (value: any, row?: any) => string;
    sortDir: 'none' | 'default' | 'asc' | 'desc';
    checked?: boolean;
  }[] = [];

  _actionStateList: YodaTableAction [] = [];
  data: any[] = [];
  _pData: any[] = [];

  showPagination = true;
  testData: any;
  constructor() {
    // this._buildTestData();
  }

  ngOnInit(): void {
    this.refreshTableSubject
      .pipe(debounceTime(5))
      .subscribe(() => {
        this.refreshTable();
      });
  }

  randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reload']) {
      if (this._reloadSubscription) {
        this._reloadSubscription.unsubscribe();
        this._reloadSubscription = null;
      }
      if (this.reload) {
        this._reloadSubscription = this.reload.subscribe(res => {
          this.onPageChanges(this.currentPage);
        });
      }
    }
    if (changes['pageChange']) {
      if (this._pageSubscription) {
        this._pageSubscription.unsubscribe();
        this._pageSubscription = null;
      }
      if (this.pageChange) {
        this._pageSubscription = this.pageChange.subscribe(res => {
          this.onPaginationChanges(res);
        });
      }
    }
    if (changes['options']) {
      this.initTable();
    }
  }

  initTable() {
    this.data = [];
    this.totalSize = 0;

    if (!this.options) {
      return;
    }
    this._actionStateList = [];
    this._fielddata = this.options.fields.map(f => {
      let sortDir: 'none' | 'default' | 'asc' | 'desc' = 'none';
      if (f.sortable) {
        sortDir = 'default';
      }
      let formatter;
      if (f.formatter) {
        formatter = f.formatter;
      }
      if (f.actions) {
        this._actionStateList = this._actionStateList.concat(f.actions);
      }
      return {
        formatter: formatter,
        name: f.name,
        class: this.buildClass(f),
        sortDir: sortDir,
        checked: false
      };
    });

    this.currentPage = 1;
    this.showPagination = true;
    if (this.options.pagination) {
      if (typeof this.options.pagination === 'number') {
        this.pageSize = this.options.pagination;
      } else if (this.options.pagination === 'custom' ) {
        this.showPagination = false;
      } else {
        if (this.options.pagination.pageSize) {
          this.pageSize = this.options.pagination.pageSize;
        }
        if (this.options.pagination.startPage) {
          this.currentPage = this.options.pagination.startPage;
        }
      }
    }
    if (this.options.pageSize) {
      this.pageSize = this.options.pageSize;
    }

    this.skipEnd = this.pageSize;
    if (this.options.asyncPaging) {
      this.onPageChanges(this.currentPage);
    } else {
      this._pData = this.options.data.map((d, i) => {
        if (d) {
          d.__yoda_index = i;
        } else {
          d = { __yoda_index: i };
        }
        return d;
      });
      // this.data = this._pData.slice(this.skipStart, this.skipEnd);
      this.totalSize = this._pData.length;
      this.onPageChanges(this.currentPage);
    }
  }

  indexObject(obj: any, is: any): any {
    if (obj) {
      if (typeof is === 'string') {
        return this.indexObject(obj, is.split('.'));
      } else if (is.length === 0) {
        return obj;
      } else {
        return this.indexObject(obj[is[0]], is.slice(1));
      }
    } else {
      return '';
    }
  }


  buildClass(field: YodaTableField): any {
    const cls = {};
    if (field.align) {
      cls[`text-${field.align}`] = true;
    }
    return cls;
  }

  buildActionClass(action: YodaTableAction, state: YodaTableActionState) {
    const cls = {};
    if (action.type === 'button') {
      cls['btn-sm'] = true;
    }
    if (action.color) {
      cls[action.color] = true;
    }
    return cls;
  }

  buildRowClass(state: YodaTableRowState): any {
    const cls = {};
    switch (state) {
      case 'disabled':
        cls['tr-disabled'] = true;
        break;
      case 'canceled':
        cls['tr-cancel'] = true;
        break;
      case 'selected':
        cls['tr-selected'] = true;
        break;
      case 'completed':
        cls['tr-complete'] = true;
        break;
    }
    return cls;
  }

  comma(num: number): string {
    if (num === null || num === undefined) {
      return '';
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  buildSortInfo() {
    this.fieldSortInfo = null;
    const sort_field = this._fielddata.findIndex(f => f.sortDir === 'asc' || f.sortDir === 'desc');
    if (sort_field >= 0) {
      this.fieldSortInfo = {
        name: this.options.fields[sort_field].name,
        dir: this._fielddata[sort_field].sortDir === 'asc' ? 'asc' : 'desc'
      };
    }
  }

  changeSort(index: number) {
    // clear sort info and toggle sort
    this._fielddata.forEach((f, i) => {
      if (i === index) {
        f.sortDir = f.sortDir === 'default' ? 'asc' : (f.sortDir === 'asc' ? 'desc' : 'default');
      } else if (f.sortDir === 'asc' || f.sortDir === 'desc') {
        f.sortDir = 'default';
      }
    });
    this.buildSortInfo();
    if (this.options.asyncPaging) {
      this.asyncFetch();
    } else {
      const cmpFuncNumber = (a: number, b: number): number => (a < b) ? -1 : ((a > b) ? 1 : 0);
      const cmpFuncString = (a: string, b: string): number => (a < b) ? -1 : ((a > b) ? 1 : 0);
      const cmpFuncDate = (a: Date, b: Date): number => (a.getTime() < b.getTime()) ? -1 : ((a.getTime() > b.getTime()) ? 1 : 0);
      const cmpFuncBoolean = (a: boolean, b: boolean): number => (a < b) ? -1 : ((a > b) ? 1 : 0);

      if (this.data && this.data.length > 0) {
        let cmpFunc: any;
        const fieldName = this._fielddata[index].name;
        if (this.options.fields[index].sortCompare) {
            cmpFunc = this.options.fields[index].sortCompare;
        } else {
          if (this.data[0][fieldName] instanceof Date) {
            cmpFunc = cmpFuncDate;
          } else {
            switch (typeof this.data[0][fieldName]) {
              case 'number':
                  cmpFunc = cmpFuncNumber;
                break;
              case 'string':
                  cmpFunc = cmpFuncString;
                break;
              case 'boolean':
                  cmpFunc = cmpFuncBoolean;
                break;
            }
          }
        }
        if (cmpFunc) {
          switch (this._fielddata[index].sortDir) {
            case 'asc':
              this._pData.sort((a, b) => cmpFunc(a[fieldName], b[fieldName]));
              break;
            case 'desc':
              this._pData.sort((b, a) => cmpFunc(a[fieldName], b[fieldName]));
              break;
            default:
              this._pData.sort((a, b) => cmpFuncNumber(a.__yoda_index, b.__yoda_index));
              break;
          }
        }
        this.onPageChanges(this.currentPage);
      }
    }
  }

  updateActionStates(row: any, index: number) {
    row.__yoda_action_state = {};
    row.__yoda_action_class = {};
    row.__yoda_action_checked = false;
    this._actionStateList.forEach(action => {
      const state = action.onState ? action.onState(action.id, row, index) : 'enabled';
      row.__yoda_action_state[action.id] = state;
      row.__yoda_action_class[action.id] = this.buildActionClass(action, state);
    });
  }

  updateRowStates() {
    this._fielddata.forEach(f => f.checked = false);
    this.data.forEach(row => {
      if (row) {
        const rowIndex = '__yoda_index' in row ? row.__yoda_index : -1;
        row.__yoda_row_state = this.options.onRowState ? this.options.onRowState(row, rowIndex) : 'enabled';
        row.__yoda_row_class = this.buildRowClass(row.__yoda_row_state);
        this.updateActionStates(row, rowIndex);
      }
    });
  }

  asyncFetch() {
    let sortInfo;
    if (this.fieldSortInfo) {
      sortInfo = [this.fieldSortInfo];
    }
    this.options.asyncPaging(this.currentPage, this.pageSize, sortInfo).subscribe(res => {
      this.data = res.data;
      this.totalSize = res.total;
      this.updateRowStates();
    });
  }

  refreshTable() {
    if (this.options.asyncPaging) {
      this.asyncFetch();
    } else {
      this.skipStart = (this.currentPage - 1) * this.pageSize;
      this.skipEnd = this.skipStart + this.pageSize;
      this.data = this._pData.slice(this.skipStart, this.skipEnd);
      this.updateRowStates();
    }
  }

  fetchExportData(page: number, size: number): Observable<YodaTablePage> {
    if (this.options.asyncPaging) {
      let sortInfo;
      if (this.fieldSortInfo) {
        sortInfo = [this.fieldSortInfo];
      }
      return this.options.asyncPaging(page, size, sortInfo);
    } else {
      const skipStart = (page - 1) * size;
      const skipEnd = skipStart + size;
      return of({
        total: this._pData.length,
        data: this._pData.slice(skipStart, skipEnd)
      });
    }
  }

  onPageChanges(pageNum: any) {
    this.currentPage = pageNum;
    this.refreshTableSubject.next();
  }

  onPaginationChanges(res: { page?: number, pageSize?: number }) {
    if (res.page) {
      this.currentPage = res.page;
    }
    if (res.pageSize) {
      this.pageSize = res.pageSize;
    }
    this.onPageChanges(this.currentPage);
  }

  onChangeTitleCheck(ev: any, field: YodaTableField) {
    ev.stopPropagation();
    const checked: boolean = ev.target.checked;
    if (field.actions && Array.isArray(field.actions)) {
      field.actions.forEach(action => {
        if (action.type === 'checkbox') {
          this.data.forEach(row => {
            row.__yoda_action_checked = checked;
            if ('__yoda_index' in row) {
              action.onAction(action.id, row, row.__yoda_index, checked);
            } else {
              action.onAction(action.id, row, -1, checked);
            }
          });
        }
      });
    }
  }

  onAction(ev: any, action: YodaTableAction, dataRow: any) {
    if (action.type === 'button') {
      ev.stopPropagation();
        if ('__yoda_index' in dataRow) {
        action.onAction(action.id, dataRow, dataRow.__yoda_index);
      } else {
        action.onAction(action.id, dataRow, -1);
      }
    } else {
      if ('__yoda_index' in dataRow) {
        action.onAction(action.id, dataRow, dataRow.__yoda_index, ev.target.checked);
      } else {
        action.onAction(action.id, dataRow, -1, ev.target.checked);
      }
    }
  }

  onSelectRow(ev: any, dataRow: any) {
    if (this.options.onSelectRow) {
      if ('__yoda_index' in dataRow) {
        this.options.onSelectRow(dataRow, dataRow.__yoda_index);
      } else {
        this.options.onSelectRow(dataRow, -1);
      }
    }
  }

  exportExcel(prefix: string) {
    let data: AOA = [[]];
    data = [this.options.fields.map(f => f.title)];

    let length = this.totalSize;

    const size = 500;
    let page = 1;
    let observList: Observable<YodaTablePage>;
    while (length > 0) {
      const observ = this.fetchExportData(page, size);
      if (observList) {
        concat(observList, observ);
      } else {
        observList = observ;
      }
      page++;
      length -= size;
    }

    observList.subscribe(res => {
      const rowLen = res.data.length;
      for (let i = 0; i < rowLen; i++) {
        const row = [];
        const rowData = res.data[i];
        for (let j = 0; j < this.options.fields.length; j++) {
          const f = this.options.fields[j];
          const v: any = f.formatter ?
            f.formatter(this.indexObject(rowData, f.name), rowData, true) :
            this.indexObject(rowData, f.name);
          if (v instanceof Date) {
            const m = moment(v);
            if (m.isValid()) {
              row.push(moment(v).format('YYYY.MM.DD'));
            } else {
              row.push('');
            }
          } else {
            row.push(v);
          }
        }
        data.push(row);
      }
    }, err => {
        throw Error(err);
      }, () => {
        const ws = XLSX.utils.aoa_to_sheet(data);
        this._saveExcelFile(prefix, ws);
    });
  }

  s2ab(s: string): ArrayBuffer {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
      // tslint:disable-next-line:no-bitwise
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  _saveExcelFile(prefix: string, ws: XLSX.WorkSheet): void {
    const wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
    const fileName = prefix + moment().format('YYMMDD') + '.xlsx';

    // generate worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // save to file
    const wbout = XLSX.write(wb, wopts);
    console.log(fileName);
    saveAs(new Blob([this.s2ab(wbout)]), fileName);
  }
}
