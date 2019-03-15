import { Component, OnInit, ComponentRef, ViewChild, TemplateRef } from '@angular/core';
import { mockData, testStates } from '../MOCK_DATA';
import { of, Observable, Subject } from 'rxjs';
import { YodaFloatService, YodaFloatRef } from 'projects/yoda-float/src/public_api';
import { YodaTableOptions, YodaTableField, YodaTablePage, YodaTableComponent } from 'projects/yoda-table/src/public_api';
import { YodaTableTemplateCol, YodaTableTemplateRow, YodaTableRowInfo } from 'projects/yoda-table/src/lib/yoda-table.component';
import { YodaListOptions, YodaListComponent } from 'projects/yoda-list/src/public_api';
import { debounceTime, distinctUntilChanged, map, switchMap, delay } from 'rxjs/operators';
import { YodaFormComponent, YodaFormOptions } from 'projects/yoda-form/src/public_api';
import { Validators } from '@angular/forms';
import { FormTestComponent } from '../form-test/form-test.component';

@Component({
  selector: 'app-yoda-test',
  templateUrl: './yoda-test.component.html',
  styleUrls: ['./yoda-test.component.scss']
})
export class YodaTestComponent implements OnInit {
  @ViewChild('testTemplate') testTempRef: TemplateRef<any>;
  @ViewChild('imgTemplate') imgTempRef: TemplateRef<any>;
  @ViewChild('imgsTemplate') imgsTempRef: TemplateRef<any>;
  @ViewChild('lastLineTemplate') lastTempRef: TemplateRef<any>;
  @ViewChild('lastLineTemplate2') last2TempRef: TemplateRef<any>;

  pageNum: number;


  listOptions: YodaListOptions;
  listRef: YodaFloatRef<YodaListComponent>;
  searchText: string;

  cancelReq = true;

  yodaTableOptions: YodaTableOptions;
  tableRef: YodaFloatRef<YodaTableComponent>;
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
        case 'email':
          field.template = (value: any, row: any) => {
            return { template: this.testTempRef };
          };
          break;
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
        label: 'expand',
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
        label: 'collapse',
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
      fieldGroups: [{
        title: 'Name',
        name: 'fullname',
        startChild: 'first_name',
        length: 2
      }],
      onAdditionalRows: (rowData: any, rowInfo: YodaTableRowInfo) => {

        const lastCol1: YodaTableTemplateCol = {
          colSpan: 8,
          template: this.lastTempRef
        };
        const lastCol2: YodaTableTemplateCol = {
          colSpan: 2,
          template: this.last2TempRef
        };
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
        const lastRow: YodaTableTemplateRow = {
          columns: [lastCol1, lastCol2]
        };
        let rows = null;
        if (rowData.expand) {
          rows = [row];
        }

        if (rowInfo.isLast) {
          if (!rows) {
            rows = [];
          }
          rows.push(lastRow);
        }
        return rows;
      },
      asyncPaging: (pageNum: number, pageSize: number) => {
        this.pageNum = pageNum;
        const start = (pageNum - 1) * pageSize;
        let filteredData = mockData;
        if (this.searchText) {
          const searchText = this.searchText.toLowerCase().trim();
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
          delay(800)
        );
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
        label: 'Form Test',
        id: 'acceptCancel',
        color: 'danger',
        onClick: _ => {
          this.initForm();
        },
        onState: _ => this.cancelReq ? 'enabled' : 'hide'
      }
      ],
      tableOptions: this.yodaTableOptions
    };
    this.listRef = this.yodaFloatService.addComponent(YodaListComponent, { size: 'large' });
    this.listRef.instance.setOptions(this.listOptions);
  }

  reloadTable() {
    if (this.listRef && this.listRef.instance) {
      this.listRef.instance.reloadTable();
    }
  }

  initForm() {
    this.yodaFloatService.addComponent(FormTestComponent);
  }

}
