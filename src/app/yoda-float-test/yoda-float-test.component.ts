import { Component, OnInit, ComponentRef, ViewChild, TemplateRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  YodaTableOptions, YodaTableComponent, YodaTableField, YodaTableTemplateCol,
  YodaTableTemplateRow, YodaTablePage
} from 'projects/yoda-table/src/public_api';
import { YodaFloatService } from 'projects/yoda-float/src/public_api';
import { mockData } from '../MOCK_DATA';
import { of } from 'rxjs';

@Component({
  selector: 'app-yoda-float-test',
  templateUrl: './yoda-float-test.component.html',
  styleUrls: ['./yoda-float-test.component.scss']
})
export class YodaFloatTestComponent implements OnInit, OnChanges {
  @Input() search: string;
  @ViewChild('testTemplate') testTempRef: TemplateRef<any>;
  @ViewChild('imgTemplate') imgTempRef: TemplateRef<any>;
  @ViewChild('imgsTemplate') imgsTempRef: TemplateRef<any>;
  yodaTableOptions: YodaTableOptions;
  tableRef: ComponentRef<YodaTableComponent>;
  pageNum: number;
  imgSrcs: any[] = [];
  imgSrc = 'http://media.pixcove.com/I/5/8/Image-Editing-Textures-Backgrounds-Unleashed-Ebv-W-8490.jpg';

  constructor(private yodaFloatService: YodaFloatService) { }

  ngOnInit() {
    this.initTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['search']) {
      this.tableRef.instance.reloadTable();
    }
  }

  initTable() {
    const fields = Object.keys(mockData[0]).map(key => {
      const field: YodaTableField = {
        title: key,
        name: key
      };
      switch (key) {
        case 'avatar':
          field.formatter = (value: any, row: any) => {
            return `<img src="https://picsum.photos/64?image=${row.img}">`;
          };
          break;
      }
      return field;
    });
    fields.push({
      title: 'action',
      name: 'actions',
      actions: [{
        type: 'button',
        label: '확장',
        id: 'expand',
        color: 'success',
        onAction: (id: string, dataRow: any) => {
          dataRow.expand = true;
          this.tableRef.instance.refreshState();
        },
        onState: (id: string, dataRow: any) => dataRow.expand ? 'hide' : 'enabled'
      },
      {
        type: 'button',
        label: '축소',
        id: 'collapse',
        color: 'info',
        onAction: (id: string, dataRow: any) => {
          dataRow.expand = false;
          this.tableRef.instance.refreshState();
        },
        onState: (id: string, dataRow: any) => dataRow.expand ? 'enabled' : 'hide'
      }
      ]
    });
    this.yodaTableOptions = {
      fields: fields,
      pageSize: 5,
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
        if (rowData.expand) {
          return [row, row];
        }
        return null;
      },
      asyncPaging: (pageNum: number, pageSize: number) => {
        this.pageNum = pageNum;
        const start = (pageNum - 1) * pageSize;
        let filteredData = mockData;
        if (this.search) {
          const searchText = this.search.toLowerCase().trim();
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
        return of(page);
      }
    };

    this.tableRef = this.yodaFloatService.addComponent(YodaTableComponent);
    this.tableRef.instance.setOptions(this.yodaTableOptions);
  }

}
