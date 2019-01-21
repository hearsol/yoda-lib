import {
  Component, OnInit, ComponentRef, ViewChild, TemplateRef,
  OnChanges, SimpleChanges, AfterViewInit, ElementRef
} from '@angular/core';
import {
  YodaTableOptions, YodaTableComponent, YodaTableField, YodaTableTemplateCol,
  YodaTableTemplateRow, YodaTablePage
} from 'projects/yoda-table/src/public_api';
import { YodaFloatService } from 'projects/yoda-float/src/public_api';
import { mockData } from '../MOCK_DATA';
import { of, Subject, fromEvent } from 'rxjs';
import { delay, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-yoda-float-test',
  templateUrl: './yoda-float-test.component.html',
  styleUrls: ['./yoda-float-test.component.scss']
})
export class YodaFloatTestComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('search') search: ElementRef;
  @ViewChild('testTemplate') testTempRef: TemplateRef<any>;
  @ViewChild('imgTemplate') imgTempRef: TemplateRef<any>;
  @ViewChild('imgsTemplate') imgsTempRef: TemplateRef<any>;
  @ViewChild('rowTemplate') rowTempRef: TemplateRef<any>;
  @ViewChild('table') yodaTableRef: YodaTableComponent;
  yodaTableOptions: YodaTableOptions;
  fields: YodaTableField[];
  additionFields: YodaTableField[];
  isAddField = true;
  searchStr: string;
  reloadTable = new Subject<string>();
  refreshTable = new Subject<string>();

  tableRef: ComponentRef<YodaTableComponent>;
  pageNum: number;
  imgSrcs: any[] = [];
  imgSrc = 'http://media.pixcove.com/I/5/8/Image-Editing-Textures-Backgrounds-Unleashed-Ebv-W-8490.jpg';

  constructor(private yodaFloatService: YodaFloatService) { }

  ngOnInit() {
    this.initTable();
  }

  ngAfterViewInit() {
    fromEvent(this.search.nativeElement, 'input').pipe(
      map((event: Event) => (<HTMLInputElement>event.target).value),
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(text => {
      this.searchStr = text;
      this.reloadTable.next();
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['search']) {
      // this.tableRef.instance.reloadTable();
    // }
  }

  click() {
    this.isAddField = !this.isAddField;
    if (this.isAddField) {
      this.yodaTableRef.refreshFields(this.fields.concat(this.additionFields));
    } else {
      this.yodaTableRef.refreshFields(this.fields);
    }
  }
  initTable() {
    this.fields = Object.keys(mockData[0]).map(key => {
      const field: YodaTableField = {
        title: key,
        name: key
      };
      switch (key) {
        case 'avatar':
          field.formatter = (value: any, row: any) => {
            return `<img src="https://picsum.photos/64?image=${row.img}" height="1px">`;
          };
          break;
      }
      return field;
    });
    this.additionFields = [];
    this.additionFields.push({
      title: 'action',
      name: 'actions',
      align: 'center',
      formatter: (value: any) => {
        return 'test Label';
      },
      actions: [{
        type: 'button',
        label: '<i class="fas fa-caret-right i-btn"></i>',
        id: 'expand',
        color: 'info',
        onAction: (id: string, dataRow: any) => {
          dataRow.expand = true;
          this.refreshTable.next();
          // this.tableRef.instance.refreshState();
        },
        onState: (id: string, dataRow: any) => dataRow.expand ? 'hide' : 'enabled'
      },
      {
        type: 'button',
        label: '<i class="fas fa-caret-down i-btn"></i>',
        id: 'collapse',
        color: 'info',
        onAction: (id: string, dataRow: any) => {
          dataRow.expand = false;
          this.refreshTable.next();
          // this.tableRef.instance.refreshState();
        },
        onState: (id: string, dataRow: any) => dataRow.expand ? 'enabled' : 'hide'
      }
      ]
    });
    /*
    this.additionFields.push({
      title: 'Select',
      name: '',
      checkBox: true,
      actions: [
        {
          type: 'checkbox',
          id: 'sel',
          onAction: (id: string, dataRow: any, index: number, checked?: boolean) => {}
        }
      ]
    });
    */
    this.yodaTableOptions = {
      fields: this.fields.concat(this.additionFields),
      pageSize: 5,
      tinyTable: false,
      fixedHeader: true,
      fieldGroups: [
        {
          title: 'test',
          name: 'testgroup',
          startChild: 'email',
          length: 2
        }, {
        title: 'Act Logs',
        name: 'actlogs',
        startChild: 'price',
        length: 4
      }, {
        title: 'Fullname',
        name: 'fullname',
        startChild: 'first_name',
        length: 2
      }
      ],
      onAdditionalRows: (rowData: any) => {
        const col: YodaTableTemplateCol = {
          colSpan: 5,
          template: this.testTempRef,
        };
        const col2: YodaTableTemplateCol = {
          colSpan: 5,
          template: this.imgTempRef
        };
        const row: YodaTableTemplateRow = {
          columns: [col, col2]
        };
        const rowTemp: YodaTableTemplateRow = {
          template: this.rowTempRef
        };
        if (rowData.expand) {
          return [row, rowTemp];
        }
        return null;
      },
      asyncPaging: (pageNum: number, pageSize: number) => {
        this.pageNum = pageNum;
        const start = (pageNum - 1) * pageSize;
        let filteredData = mockData;
        if (this.searchStr) {
          const searchText = this.searchStr.toLowerCase().trim();
          filteredData = mockData.filter(data =>
            ['first_name', 'last_name', 'email'].reduce((prev, it) => {
              if (prev) {
                return prev;
              }
              return data[it] && (data[it].toLowerCase().indexOf(searchText) >= 0);
            }, false)
          );
        }
        const page: YodaTablePage = {
          total: filteredData.length,
          data: filteredData.slice(start, start + pageSize).map(data => {
            data.expand = false;
            data.img = Math.floor(Math.random() * 1000);
            return data;
          })
        };
        return of(page).pipe(
          delay(200)
        );
      }
    };

    // this.tableRef = this.yodaFloatService.addComponent(YodaTableComponent);
    // this.tableRef.instance.setOptions(this.yodaTableOptions);
  }

}
