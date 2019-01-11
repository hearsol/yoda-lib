import { Component, OnInit, ComponentRef, ViewChild, TemplateRef } from '@angular/core';
import { mockData } from '../MOCK_DATA';
import { of } from 'rxjs';
import { YodaFloatService } from 'projects/yoda-float/src/public_api';
import { YodaTableOptions, YodaTableField, YodaTablePage, YodaTableComponent } from 'projects/yoda-table/src/public_api';
import { YodaTableTemplateCol, YodaTableTemplateRow } from '../../../projects/yoda-table/src/lib/yoda-table.component';

@Component({
  selector: 'app-yoda-test',
  templateUrl: './yoda-test.component.html',
  styleUrls: ['./yoda-test.component.scss']
})
export class YodaTestComponent implements OnInit {
  @ViewChild('testTemplate') testTempRef: TemplateRef<any>;
  @ViewChild('imgTemplate') imgTempRef: TemplateRef<any>;

  pageNum: number;
  yodaTableOptions: YodaTableOptions;
  tableRef: ComponentRef<YodaTableComponent>;
  imgSrc = 'http://media.pixcove.com/I/5/8/Image-Editing-Textures-Backgrounds-Unleashed-Ebv-W-8490.jpg';
  constructor(private yodaFloatService: YodaFloatService) { }

  ngOnInit() {
    this.initMockData();
  }

  initMockData() {
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
          this.tableRef.instance.onRefresh();
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
          this.tableRef.instance.onRefresh();
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
        const page: YodaTablePage = {
          total: mockData.length,
          data: mockData.slice(start, start + pageSize).map(data => {
            data.expand = true;
            data.img = Math.floor(Math.random() * 1000);
            return data;
          })
        };
        return of(page);
      }
    };

    setTimeout(() => {
      this.tableRef = this.yodaFloatService.addComponent(YodaTableComponent);
      this.tableRef.instance.setOptions(this.yodaTableOptions);
    }, 500);
  }
}
