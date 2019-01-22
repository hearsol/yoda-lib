import { Component, OnInit, Input, SimpleChanges, OnChanges, TemplateRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Observable, of, concat, Subject, merge } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { saveAs } from 'file-saver';

import * as momentImported from 'moment';
const moment = momentImported;

import * as XLSX from 'xlsx';

type AOA = Array<Array<any>>;
export type YodaTableActionState = 'enabled' | 'disabled' | 'hide';
export type YodaTableRowState = 'enabled' | 'completed' | 'selected' | 'disabled' | 'canceled';
export type YodaTableActionStateFunc = (id: string, dataRow: any, rowInfo?: YodaTableRowInfo) => YodaTableActionState;
export interface YodaTableAction {
  type: 'button' | 'checkbox' | 'radio';
  label?: string;
  id: string;
  class?: any;
  color?: 'success' | 'info' | 'danger'; //  | 'primary' | 'secondary' | 'warning';
  onAction: (id: string, dataRow: any, index?: number, checked?: boolean) => void;
  onState?: YodaTableActionStateFunc;
}
export interface YodaTableFieldGroup {
  title: string;
  name: string;
  startChild: string;
  length: number;
}


export interface YodaTableField {
  title: string;
  name: string;
  checkBox?: boolean;
  formatter?: (value: any, row?: any, isExport?: boolean) => string | any;
  sortable?: boolean;
  sortCompare?: (a: any, b: any) => number;
  align?: 'left' | 'right' | 'center';
  class?: any;
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

export interface YodaTableTemplateCol {
  colSpan: number;
  template: TemplateRef<any>;
  templateContext?: any;
}
export interface YodaTableTemplateRow {
  columns?: YodaTableTemplateCol[];
  template?: TemplateRef<any>;
  templateContext?: any;
}

export interface YodaTableRowInfo {
  index?: number;
  rowIndex: number;
  isLast: boolean;
  isFirst: boolean;
}

export interface YodaTableOptions {
  fields: YodaTableField[];
  fieldGroups?: YodaTableFieldGroup[];
  data?: any[];
  pagination?: number | YodaTablePagination | 'custom';
  pageSize?: number;
  asyncPaging?: YodaTablePagingFunc;
  tinyTable?: boolean;
  fixedHeader?: boolean;
  fixedHeaderTop?: number;
  tableClass?: any;
  headerClass?: any;
  onRowState?: (rowData: any, rowInfo?: YodaTableRowInfo) => YodaTableRowState;
  onAdditionalRows?: (rowData: any, rowInfo?: YodaTableRowInfo) => YodaTableTemplateRow[];
  onSelectRow?: (rowData: any, rowInfo?: YodaTableRowInfo) => void;
}

export interface YodaTableSortInfo {
  name: string;
  dir: 'asc' | 'desc';
}

interface TableField {
  title: string;
  name: string;
  class: any;
  formatter: (value: any, row?: any) => string | any;
  sortDir: 'none' | 'default' | 'asc' | 'desc';
  checked: boolean;

  checkBox: boolean;
  sortable: boolean;
  sortCompare: (a: any, b: any) => number;
  align: 'left' | 'right' | 'center';
  actions: YodaTableAction[];
}

interface TableHeaderItem {
  colIdx: number;
  title: string;
  name: string;
  colspan: number;
  rowspan: number;
  isGroup: boolean;
  field: TableField | YodaTableFieldGroup;
}

interface TableHeader {
  headers: TableHeaderItem[];
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'yoda-table',
  templateUrl: './yoda-table.component.html',
  styleUrls: []
})
export class YodaTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() reload: Observable<string>;
  @Input() refresh: Observable<string>;
  @Input() pageChange: Observable<{page?: number, pageSize?: number}>;
  @Input() options: YodaTableOptions;
  public pageSize = 15;
  public currentPage = 1;
  public totalSize = 0;

  public _fielddata: TableField[] = [];
  public _headers: TableHeader[] = [];
  public _data: any[] = [];
  public showPagination = true;
  public tableClass: any;
  public headerClass: any;
  public tableWrapClass: any;
  private unsubscribe$ = new Subject();

  private refreshTableSubject = new Subject<any>();
  private refreshStateSubject = new Subject<any>();

  private _pageChangeSubject = new Subject<{ page?: number, pageSize?: number }>();

  private _reloadSubscription: any;
  private _refreshSubscription: any;
  private _pageSubscription: any;
  private _skipStart = 0;
  private _skipEnd = 0;
  private fieldSortInfo: YodaTableSortInfo;
  private _actionStateList: YodaTableAction [] = [];
  private _pData: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {
    this.initPageSubscription();
    this.refreshTableSubject
      .pipe(
        debounceTime(5),
        takeUntil(this.unsubscribe$)
      ).subscribe(() => {
        this.refreshTable();
      });
    this.refreshStateSubject
      .pipe(
        debounceTime(5),
        takeUntil(this.unsubscribe$)
      ).subscribe(() => {
        this.updateRowStates();
      });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    if (this._reloadSubscription) {
      this._reloadSubscription.unsubscribe();
      this._reloadSubscription = null;
    }
    if (this._refreshSubscription) {
      this._refreshSubscription.unsubscribe();
      this._refreshSubscription = null;
    }
    if (this._pageSubscription) {
      this._pageSubscription.unsubscribe();
      this._pageSubscription = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reload']) {
      if (this._reloadSubscription) {
        this._reloadSubscription.unsubscribe();
        this._reloadSubscription = null;
      }
      if (this.reload) {
        this._reloadSubscription = this.reload.subscribe(res => {
          this.reloadTable();
        });
      }
    }
    if (changes['refresh']) {
      if (this._refreshSubscription) {
        this._refreshSubscription.unsubscribe();
        this._refreshSubscription = null;
      }
      if (this.refresh) {
        this._refreshSubscription = this.refresh.subscribe(res => {
          this.refreshState();
        });
      }
    }
    if (changes['pageChange']) {
      this.initPageSubscription();
    }
    if (changes['options']) {
      this.initTable();
    }
  }

  private initPageSubscription() {
    if (this._pageSubscription) {
      this._pageSubscription.unsubscribe();
      this._pageSubscription = null;
    }
    const subject = this.pageChange ? merge(this._pageChangeSubject, this.pageChange) : this._pageChangeSubject;
    this._pageSubscription = subject.subscribe(res => {
      if (res.page) {
        this.currentPage = res.page;
      }
      if (res.pageSize) {
        this.pageSize = res.pageSize;
      }
      this.onPageChanges(this.currentPage);
    });
  }

  setOptions(options: YodaTableOptions) {
    this.options = options;
    this.initTable();
  }

  getHeaderStyle(rowIdx: number) {
    if (this.options && this.options.fixedHeader) {
      let top = 0;
      if (this.options.fixedHeaderTop) {
        top = this.options.fixedHeaderTop;
      }
      if (this.options.tinyTable) {
        return { 'top': top + rowIdx * 22 + 'px' };
      } else {
        return { 'top': top + rowIdx * 36 + 'px' };
      }
    }
    return null;
  }

  private buildTableClass() {
    this.tableClass = this.options.tableClass ? this.parseClass(this.options.tableClass) : {};
    this.tableClass['data-tbl'] = true;
    if (this.options && this.options.tinyTable) {
      this.tableClass.tiny = true;
    }
    this.tableWrapClass = this.options.fixedHeader ?
      {
        'data-tbl-wrap-for-sticky': true
      } : {
        'data-tbl-wrap': true
      };
    this.headerClass = this.options.headerClass ? this.parseClass(this.options.headerClass) : {};
    if (this.options.fixedHeader) {
      this.headerClass['fixed-header-row'] = true;
    }
  }

  private parseClass(opt: any) {
    const cls: any = {};
    if (opt) {
      if (Array.isArray(opt) && opt.length > 0) {
        opt.forEach(key => cls[key] = true);
      } else if (typeof opt === 'object' && Object.keys(opt).length > 0) {
        Object.keys(opt).forEach(key => cls[key] = true);
      } else if (typeof opt === 'string') {
        cls[opt] = true;
      }
    }
    return cls;
  }


  private initTable() {
    this._data = [];
    this.totalSize = 0;

    if (!this.options) {
      return;
    }
    this.buildTableClass();
    this.refreshFields(this.options.fields, this.options.fieldGroups);

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

    this._skipEnd = this.pageSize;
    if (this.options.asyncPaging) {
      this.reloadTable();
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
      this.reloadTable();
    }
  }

  refreshFields(fields: YodaTableField[], fieldGroups?: YodaTableFieldGroup[]) {
    this._actionStateList = [];
    this._fielddata = fields.map(f => {
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
        title: f.title,
        formatter: formatter,
        name: f.name,
        class: this.buildClass(f),
        sortDir: sortDir,
        checked: false,
        checkBox: f.checkBox,
        sortable: f.sortable,
        sortCompare: f.sortCompare,
        align: f.align,
        actions: f.actions ? f.actions.slice() : null
      };
    });

    this._headers = [{
      headers: this._fielddata.map((f, idx) => {
        const h: TableHeaderItem = {
          isGroup: false,
          colIdx: idx,
          title: f.title,
          name: f.name,
          colspan: 1,
          rowspan: 1,
          field: f
        };
        return h;
      })
    }];

    const _fieldGroups = fieldGroups || this.options.fieldGroups;
    if (_fieldGroups) {
      const findHeaderIdx = (g: YodaTableFieldGroup) => {
        const startHeaderIdx = this._headers.findIndex(val => val.headers.findIndex(v => v.name === g.startChild) >= 0);
        let headerIdx = startHeaderIdx;
        const startIdx = this._headers[headerIdx].headers.findIndex(h => h.name === g.startChild);
        const startColIdx = this._headers[headerIdx].headers[startIdx].colIdx;
        while (headerIdx < this._headers.length - 1) {
          if (this._headers[headerIdx + 1].headers.findIndex(v =>
            v.colIdx >= startColIdx && v.colIdx <= startColIdx + (g.length - 1)) >= 0) {
            headerIdx++;
          } else {
            break;
          }
        }
        return { startHeaderIdx: startHeaderIdx, headerIdx: headerIdx, colIdx: startColIdx };
      };
      const makeRoomHeader = (g: YodaTableFieldGroup) => {
        const { startHeaderIdx, headerIdx, colIdx } = findHeaderIdx(g);
        if (headerIdx >= 0) { // insert header
          let newColIdx = 0;
          if (this._headers.length === (headerIdx + 1)) {
            this._headers.push({
              headers: []
            });
          } else {
            let lastFound = false;
            newColIdx = this._headers[headerIdx + 1].headers.findIndex((h, idx) => {
              if (idx === this._headers[headerIdx + 1].headers.length - 1) {
                if (h.colIdx < colIdx) {
                  lastFound = true;
                }
                return true;
              }
              return h.colIdx >= colIdx;
            });
            if (lastFound) {
              newColIdx = this._headers[headerIdx + 1].headers.length;
            } else if (newColIdx < 0) {
              newColIdx = 0;
            }
          }
          const startIdx = colIdx;
          const endIdx = colIdx + g.length - 1;
          let newItem: TableHeaderItem[] = Array.from({ length: g.length }, (e, idx) => {
            return {
              colIdx: colIdx + idx,
              title: g.title,
              name: g.name,
              colspan: 1,
              rowspan: 1,
              field: g,
              isGroup: true,
            };
          });
          for (let row = startHeaderIdx; row <= headerIdx; row++) {
            let colLen = 0;
            let end = -1;
            let start = -1;
            let startColIdx;
            this._headers[row].headers.forEach((item, idx) => {
              if (item.colIdx >= startIdx && idx <= endIdx) {
                end = item.colIdx;
                if (start === -1) {
                  start = idx;
                  startColIdx = item.colIdx;
                }
              }
            });
            colLen = end - startColIdx + 1;
            newItem = this._headers[row].headers.splice(start, colLen, ...newItem);
          }
          this._headers[headerIdx + 1].headers.splice(newColIdx, 0, ...newItem);
        }
      };
      const procGroup = (g: YodaTableFieldGroup) => {
        makeRoomHeader(g);
      };
      _fieldGroups.map((g) => procGroup(g));
      const checkRowSpan = (item: TableHeaderItem, rowIdx: number) => {
        let rowSpan = 1;
        if (!item.isGroup) {
          rowSpan = this._headers.length - rowIdx;
        }
        item.rowspan = rowSpan;
      };
      this._headers = this._headers.map(header => {
        const len = header.headers.length;
        const newHeader: TableHeaderItem[] = [];
        for (let c = 0; c < len; c++) {
          const name = header.headers[c].name;
          let count = 1;
          while (c + count < len && name === header.headers[c + count].name) {
            count++;
          }
          if (count > 1) {
            const newItem = header.headers[c];
            newItem.colspan = count;
            newHeader.push(newItem);
            c += count - 1;
          } else {
            newHeader.push(header.headers[c]);
          }
        }
        return {
          headers: newHeader
        };
      });
      this._headers.forEach((header, rowIdx) => {
        if ((this._headers.length - rowIdx) > 1) {
          header.headers.forEach(item => checkRowSpan(item, rowIdx));
        }
      });
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


  private buildClass(field: YodaTableField): any {
    const cls = field.class ? this.parseClass(field.class) : {};
    if (field.align) {
      cls[`text-${field.align}`] = true;
    }
    return cls;
  }

  private buildActionClass(action: YodaTableAction, state: YodaTableActionState) {
    const cls = action.class ? this.parseClass(action.class) : {};
    if (action.type === 'button') {
      cls['tbl-btn'] = true;
    }
    if (action.color) {
      cls[action.color] = true;
    }
    return cls;
  }

  private buildRowClass(state: YodaTableRowState): any {
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

  private comma(num: number): string {
    if (num === null || num === undefined) {
      return '';
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  private buildSortInfo() {
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

      if (this._data && this._data.length > 0) {
        let cmpFunc: any;
        const fieldName = this._fielddata[index].name;
        if (this.options.fields[index].sortCompare) {
            cmpFunc = this.options.fields[index].sortCompare;
        } else {
          if (this._data[0][fieldName] instanceof Date) {
            cmpFunc = cmpFuncDate;
          } else {
            switch (typeof this._data[0][fieldName]) {
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
        this.reloadTable();
      }
    }
  }

  private updateActionStates(row: any, rowInfo: YodaTableRowInfo) {
    row.__yoda_action_state = {};
    row.__yoda_action_class = {};
    row.__yoda_action_checked = false;
    this._actionStateList.forEach(action => {
      const state = action.onState ? action.onState(action.id, row, rowInfo) : 'enabled';
      row.__yoda_action_state[action.id] = state;
      row.__yoda_action_class[action.id] = this.buildActionClass(action, state);
    });
  }

  private updateRowStates() {
    this._fielddata.forEach(f => f.checked = false);
    this._data.forEach((row, idx) => {
      if (row) {
        const dataIndex = '__yoda_index' in row ? row.__yoda_index : -1;
        row.__yoda_row_info = {
          index: dataIndex,
          rowIndex: idx,
          isFirst: idx === 0,
          isLast: idx === (this._data.length - 1)
        } as YodaTableRowInfo;
        row.__yoda_row_state = this.options.onRowState ? this.options.onRowState(row, row.__yoda_row_info) : 'enabled';
        row.__yoda_row_class = this.buildRowClass(row.__yoda_row_state);

        row.__yoda_row_templates = this.options.onAdditionalRows ? this.options.onAdditionalRows(row, row.__yoda_row_info) : null;
        this.updateActionStates(row, row.__yoda_row_info);
      }
    });
  }

  private asyncFetch() {
    let sortInfo;
    if (this.fieldSortInfo) {
      sortInfo = [this.fieldSortInfo];
    }
    this.options.asyncPaging(this.currentPage, this.pageSize, sortInfo).subscribe(res => {
      setTimeout(() => {
        this._data = res.data;
        this.totalSize = res.total;
        this.updateRowStates();
      });
    });
  }

  private refreshTable() {
    if (this.options.asyncPaging) {
      this.asyncFetch();
    } else {
      this._skipStart = (this.currentPage - 1) * this.pageSize;
      this._skipEnd = this._skipStart + this.pageSize;
      this._data = this._pData.slice(this._skipStart, this._skipEnd);
      this.updateRowStates();
    }
  }

  private fetchExportData(page: number, size: number): Observable<YodaTablePage> {
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
    this.refreshTable();
  }

  reloadTable() {
    this.refreshTableSubject.next();
  }

  refreshState() {
    this.refreshStateSubject.next();
  }

  onPaginationChanges(res: { page?: number, pageSize?: number }) {
    this._pageChangeSubject.next(res);
  }

  onChangeTitleCheck(ev: any, field: YodaTableField) {
    ev.stopPropagation();
    const checked: boolean = ev.target.checked;
    if (field.actions && Array.isArray(field.actions)) {
      field.actions.forEach(action => {
        if (action.type === 'checkbox') {
          this._data.forEach(row => {
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
        this.options.onSelectRow(dataRow, dataRow.__yoda_row_info);
      } else {
        this.options.onSelectRow(dataRow, dataRow.__yoda_row_info);
      }
    }
  }

  exportExcel(prefix: string, exportOpt?: {
    fields?: YodaTableField[],
    additonalRow?: (rowData: any, isLast: boolean) => any[],
    postProcess?: (ws: XLSX.WorkSheet) => XLSX.WorkSheet,
    data?: any[]
  }) {
    let data: AOA = [[]];
    let _fields = this.options.fields;
    if (exportOpt && exportOpt.fields) {
      _fields = exportOpt.fields;
    }
    data = [_fields.map(f => {
      return {
        v: f.title,
        t: 's',
        s: {
          alignment: { horizontal: 'center' },
          font: { bold: true }
        }
      };
    })];
    let length = this.totalSize;
    let totalSize = this.totalSize;
    const size = 500;
    let observList: Observable<YodaTablePage>;

    if (exportOpt && exportOpt.data) {
      length = exportOpt.data.length;
      totalSize = length;
      observList = of({
        data: exportOpt.data,
        total: length
      });
    } else {
      let page = 1;
      while (length > 0) {
        const observ = this.fetchExportData(page, size);
        if (observList) {
          observList = concat(observList, observ);
        } else {
          observList = observ;
        }
        page++;
        length -= size;
      }
    }

    let count = 0;
    observList.subscribe(res => {
      const rowLen = res.data.length;
      for (let i = 0; i < rowLen; i++, count++) {
        const row = [];
        const rowData = res.data[i];
        for (let j = 0; j < _fields.length; j++) {
          const f = _fields[j];
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
        if (exportOpt && exportOpt.additonalRow) {
          const addRowData = exportOpt.additonalRow(rowData, count === (totalSize - 1));
          if (addRowData) {
            data = data.concat(addRowData);
          }
        }
      }
    }, err => {
      throw Error(err);
    }, () => {
      let ws = XLSX.utils.aoa_to_sheet(data);
      if (exportOpt && exportOpt.postProcess) {
        ws = exportOpt.postProcess(ws);
      }
      this._saveExcelFile(prefix, ws);
    });
  }

  private s2ab(s: string): ArrayBuffer {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
      // tslint:disable-next-line:no-bitwise
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  private _saveExcelFile(prefix: string, ws: XLSX.WorkSheet): void {
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
