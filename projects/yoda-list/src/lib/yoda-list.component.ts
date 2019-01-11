import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { YodaTableOptions, YodaTableSortInfo, YodaTablePage, YodaTablePagingFunc, YodaTableComponent } from '@hsolpkg/yoda-table';
import { Subject, fromEvent, Observable } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { faCalendarAlt, faSync, faSearch } from '@fortawesome/free-solid-svg-icons';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { isInteger } from 'lodash';

export type YodaListActionState = 'enabled' | 'disabled' | 'hide';
export type YodaListActionStateFunc = (id: string) => YodaListActionState;

export interface YodaListFilter {
  type: 'text' | 'date' | 'typeahead' | 'select';
  label: string;
  id: string;
  value?: any;
  options?: {
    value: string;
    text: string;
  }[];
  asyncOptions?: Observable<{ value: any, text: string }[]>;
  onTypeahead?: (text: Observable<string>) => Observable<any[]>;
  onFilter: (id: string, value: any) => void;
  onState?: YodaListActionStateFunc;
}

export interface YodaListActionButton {
  label: string;
  id: string;
  color?: 'success' | 'info' | 'danger' | 'primary' | 'secondary' | 'warning';
  onClick: (id: string) => void;
  onState?: YodaListActionStateFunc;
}

interface ListFilter {
  type: 'text' | 'date' | 'typeahead' | 'select';
  label: string;
  id: string;
  value?: any;
  options?: {
    value: string;
    text: string;
  }[];
  asyncOptions: Observable<{ value: any, text: string }[]>;
  state: YodaListActionState;
  onTypeahead?: (text: Observable<string>) => Observable<any[]>;
  onFilter: (id: string, value: any) => void;
  onState?: YodaListActionStateFunc;
}


interface ListAction {
  label: string;
  id: string;
  class: string;
  state: YodaListActionState;
  onClick: (id: string) => void;
  onState?: YodaListActionStateFunc;
}


export interface YodaListOptions {
  title: string;
  tableOptions: YodaTableOptions;
  pageSize?: number;
  disableExport?: boolean;
  exportFilePrefix?: string;
  onSearch?: (text: string) => void;
  filters?: YodaListFilter[];
  buttons?: YodaListActionButton[];
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'yoda-list.unit.list',
  templateUrl: './yoda-list.component.html',
  styleUrls: []
})
export class YodaListComponent implements AfterViewInit, OnDestroy {
  @ViewChild('yoda') yoda: YodaTableComponent;
  @ViewChild('search') search: ElementRef;

  calendarIcon = faCalendarAlt;
  syncIcon = faSync;
  searchIcon = faSearch;

  _reloadTable: Subject<string> = new Subject<string>();
  _refreshTable: Subject<string> = new Subject<string>();
  _refreshState: Subject<string> = new Subject<string>();
  _refreshStateSubscription: any;
  pageChange: Subject<{ page?: number, pageSize?: number }> = new Subject();
  currentPage = 1;
  pageSize = 10;
  totalSize: number;

  searchText: string;
  isLoading = false;
  hideSearch = false;

  options: YodaListOptions;
  tableOptions: YodaTableOptions;
  tableAsyncFunc: YodaTablePagingFunc;

  actions: ListAction[] = [];
  filters: ListFilter[] = [];

  index = 0;
  index2 = 0;
  constructor() {
    this._refreshStateSubscription = this._refreshState
      .pipe(debounceTime(5))
      .subscribe(_ => {
        this.index++;
        this.actions.forEach(action => {
          action.state = action.onState ? action.onState(action.id) : 'enabled';
        });
        this.filters.forEach(action => {
          action.state = action.onState ? action.onState(action.id) : 'enabled';
        });
      });
  }

  ngOnDestroy(): void {
    if (this._refreshStateSubscription) {
      this._refreshStateSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    fromEvent(this.search.nativeElement, 'input').pipe(
      map((event: Event) => (<HTMLInputElement>event.target).value),
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(text => {
      this.searchText = text;
      if (this.options && this.options.onSearch) {
        this.options.onSearch(this.searchText);
      }
    });
  }

  reloadTable() {
    this._reloadTable.next();
    this.refreshState();
  }

  refreshState() {
    this.index2++;
    this._refreshTable.next();
    this._refreshState.next();
  }

  setOptions(options: YodaListOptions) {
    this.options = options;
    this.tableOptions = this.options.tableOptions;
    this.tableAsyncFunc = this.options.tableOptions.asyncPaging;
    this.tableOptions.pagination = 'custom';
    if (!this.options.onSearch) {
      this.hideSearch = true;
    }
    if (options.pageSize) {
      this.pageSize = options.pageSize;
    }
    this.tableOptions.asyncPaging = (pageNum: number, pageSize: number, sortInfo: YodaTableSortInfo[]) => {
      this.isLoading = true;
      return this.tableAsyncFunc(pageNum, pageSize, sortInfo).pipe(
        map((data: YodaTablePage) => {
          this.totalSize = data.total;
          this.isLoading = false;
          return data;
        })
      );
    };
    if (this.options.buttons) {
      this.actions = this._getListActionButtons(this.options.buttons);
    }
    if (this.options.filters) {
      this.filters = this._getListFilters(this.options.filters);
    }
  }

  onChangeFilter(filter: ListFilter, value: any) {
    if (filter.onFilter) {
      filter.onFilter(filter.id, value);
    }
  }

  onChangeDateFilter(filter: ListFilter, value: NgbDateStruct) {
    if (filter.onFilter) {
      filter.onFilter(filter.id, this.toDate(value));
    }
  }

  _getListFilters(filters: YodaListFilter[]): ListFilter[] {
    return filters.map(filter => {
      let value = filter.value;
      if (filter.type === 'date' && filter.value) {
        value = this.toNgbDate(filter.value);
      }
      return {
        type: filter.type,
        label: filter.label,
        id: filter.id,
        value: value,
        options: filter.options ? filter.options.slice() : [],
        asyncOptions: filter.asyncOptions,
        state: filter.onState ? filter.onState(filter.id) : 'enabled',
        onTypeahead: filter.onTypeahead,
        onFilter: filter.onFilter,
        onState: filter.onState,
      };
    });
  }


  _getActionClass(action: YodaListActionButton) {
    const c: any = {
      button: true
    };
    if (action.color) {
      c[action.color] = true;
    }
    return c;
  }

  _getListActionButtons(actions: YodaListActionButton[]): ListAction[] {
    return actions.map(action => {
      return {
        label: action.label,
        id: action.id,
        class: this._getActionClass(action),
        state: action.onState ? action.onState(action.id) : 'enabled',
        onClick: action.onClick,
        onState: action.onState
      };
    });
  }

  onDownload() {
    if (this.yoda) {
      this.yoda.exportExcel(this.options.exportFilePrefix || this.options.title);
    }
  }

  onPageChanges(res: { page?: number, pageSize?: number }) {
    if (res.page) {
      this.currentPage = res.page;
      this.pageChange.next({ page: res.page });
    }
    if (res.pageSize) {
      this.pageSize = res.pageSize;
      this.pageChange.next({ pageSize: res.pageSize });
    }
  }

  protected toNgbDate(date: Date): NgbDateStruct {
    return (date instanceof Date && !isNaN(date.getTime())) ? this._fromNativeDate(date) : null;
  }

  protected toDate(date: NgbDateStruct): Date {
    return date && isInteger(date.year) && isInteger(date.month) && isInteger(date.day) ?
      this._toNativeDate(date) : null;
  }

  protected _fromNativeDate(date: Date): NgbDateStruct {
    return {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
  }

  protected _toNativeDate(date: NgbDateStruct): Date {
    const jsDate = new Date(date.year, date.month - 1, date.day, 12);
    // avoid 30 -> 1930 conversion
    jsDate.setFullYear(date.year);
    return jsDate;
  }
}
