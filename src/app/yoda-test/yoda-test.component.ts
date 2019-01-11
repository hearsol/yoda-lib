import { Component, OnInit, ComponentRef, ViewChild, TemplateRef } from '@angular/core';
import { mockData, testStates } from '../MOCK_DATA';
import { of, Observable } from 'rxjs';
import { YodaFloatService } from 'projects/yoda-float/src/public_api';
import { YodaTableOptions, YodaTableField, YodaTablePage, YodaTableComponent } from 'projects/yoda-table/src/public_api';
import { YodaTableTemplateCol, YodaTableTemplateRow } from '../../../projects/yoda-table/src/lib/yoda-table.component';
import { YodaListOptions, YodaListComponent } from 'projects/yoda-list/src/public_api';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-yoda-test',
  templateUrl: './yoda-test.component.html',
  styleUrls: ['./yoda-test.component.scss']
})
export class YodaTestComponent implements OnInit {
  @ViewChild('testTemplate') testTempRef: TemplateRef<any>;
  @ViewChild('imgTemplate') imgTempRef: TemplateRef<any>;

  pageNum: number;

  listOptions: YodaListOptions;
  listRef: ComponentRef<YodaListComponent>;
  searchText: string;

  cancelReq = true;

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
          this.listRef.instance.refreshState();
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
          this.listRef.instance.refreshState();
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
            data.expand = false;
            data.img = Math.floor(Math.random() * 1000);
            return data;
          })
        };
        return of(page);
      }
    };

    this.listOptions = {
      title: '리스트 테스트',
      onSearch: (text: string) => {
        this.searchText = text;
        this.reloadTable();
      },
      disableExport: false,

      filters: [
        {
          label: '담당자',
          id: 'staff',
          type: 'typeahead',
          onTypeahead: (text$: Observable<string>) =>
            text$.pipe(
              debounceTime(200),
              distinctUntilChanged(),
              map(term => term.length < 2 ? []
                : testStates.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
            ),
          onFilter: (id: string, value: any) => {
            console.log(id + ' filter ' + value);
          },
        },
        {
          label: 'testSelect',
          id: 'select',
          type: 'select',
          options: [
            { value: '0', text: '0' },
            { value: '1', text: '1' },
            { value: '2', text: '2' },
          ],
          onFilter: (id: string, value: any) => {
            console.log(id + ' filter ' + value);
          },
          onState: (id: string) => 'disabled',
        },
        {
          label: 'dateStart',
          id: 'dateStart',
          type: 'date',
          value: new Date('2017-01-25'),
          onFilter: (id: string, value: any) => {
            console.log(id + ' filter ' + value);
          },
        }
      ],
      buttons: [{
        label: '취소요청 수락',
        id: 'acceptCancel',
        color: 'danger',
        onClick: _ => {
        },
        onState: _ => this.cancelReq ? 'enabled' : 'hide'
      }
      ],
      tableOptions: this.yodaTableOptions
    };
    setTimeout(() => {
      this.listRef = this.yodaFloatService.addComponent(YodaListComponent);
      this.listRef.instance.setOptions(this.listOptions);
    }, 500);
  }

  reloadTable() {
    if (this.listRef && this.listRef.instance) {
      this.listRef.instance.reloadTable();
    }
  }
}
