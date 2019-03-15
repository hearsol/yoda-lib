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
  imgSrcs: any[] = [];

  ref: YodaFloatRef<YodaFormComponent>;
  options: YodaFormOptions;

  listOptions: YodaListOptions;
  listRef: YodaFloatRef<YodaListComponent>;
  searchText: string;
  num: number;
  optionTestSubject = new Subject<{ value: any, text: string }[]>();

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
    this.options = {
      title: '테스트 폼',
      fields: [
        {
          title: '담당자 선택',
          name: '',
          type: 'subtitle',
        },
        {
          type: 'template',
          template: this.testTempRef,
        },
        {
          type: 'row',
          columns: [
            {
              title: '담당자',
              name: 'staff.[0]',
              type: 'typeahead',
              onTypeahead: (text$: Observable<string>) =>
                text$.pipe(
                  debounceTime(200),
                  distinctUntilChanged(),
                  map(term => term.length < 2 ? []
                    : testStates.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
                ),
              required: true,
              appendButton: {
                title: 'Add',
                color: 'primary',
                onClick: () => {
                  this.ref.instance.setFocus('staff.[3]');
                }
              }
            },
            {
              title: '담당일자',
              name: 'staff.[1]',
              value: new Date('2013-03-01'),
              type: 'date',
              required: true,
            },
            {
              title: '<i class="far fa-plus"></i> 추가',
              name: 'addButton',
              type: 'button',
              color: 'primary',
              onClick: () => { }
            },
          ]
        },
        {
          type: 'template',
          template: this.imgsTempRef,
        },
        {
          type: 'file-multiple',
          name: 'imgName',
          title: 'Image URL',
          onValueChanged: (value: FileList) => {
            if (value && value.length > 0) {
              for (let i = 0; i < value.length; i++) {
                const val = value[i];
                const reader = new FileReader();
                reader.readAsDataURL(val);
                reader.onload = () => {
                  this.imgSrcs.push(reader.result);
                };
              }
            }
          }
        },
        {
          title: '담당금액',
          name: 'staff.[3]',
          type: 'decimal',
          placeholder: '숫자입력',
          required: true,
          onValueChanged: (value: number) => {
            this.num = value;
            this.ref.instance.refreshState();
          },
          appendButton: {
            title: '<i class="fas fa-trash"></i>',
            color: 'danger',
            onState: _ => this.num > 100000 ? 'enabled' : 'hide',
            onClick: () => { }
          }
        },
        {
          title: '<i class="far fa-plus"></i> 추가',
          name: 'addButton',
          type: 'button',
          color: 'success',
          onClick: () => { },
          onState: _ => this.num > 100000 ? 'enabled' : 'disabled'
        },

        {
          title: '비고',
          name: 'staff.[4]',
          type: 'text',
          value: 'test',
        },
        {
          title: 'Select 테스트',
          name: '',
          type: 'subtitle',
        },
        {
          type: 'row',
          columns: [
            {
              title: '사유(5글자이상)',
              name: 'staff.[5]',
              type: 'text',
              required: true,
              validators: [Validators.minLength(5)],
              width: 'col-5'
            },
            {
              title: '입고예정일',
              'name': 'staff.[2]',
              value: new Date('2019-01-01'),
              type: 'date',
              width: 'col-5',
            },
            {
              title: 'test select',
              name: 'staff.[6]',
              type: 'select',
              value: '3',
              asyncOptions: this.optionTestSubject,
            }
          ]
        },

      ],
      onValueChanged: (value) => {
        console.log(value);
      },
      onAction: (action: string, data: any) => {
        console.log(data);
        this.ref.destroy();
        this.ref = null;
      }
    };
    console.log('form inited');
    // setTimeout(() => {
    console.log('add form component');
    this.ref = this.yodaFloatService.addComponent(YodaFormComponent, {
      size: 'm',
      index: 'end'
    });
    this.ref.instance.setOptions(this.options);
    // }, 100);

    setTimeout(() => {
      this.optionTestSubject.next([
        {
          value: '0',
          text: 'zero'
        },
        {
          value: '1',
          text: 'one'
        },
        {
          value: '2',
          text: 'two'
        },
        {
          value: '3',
          text: 'three'
        },
        {
          value: '4',
          text: 'four'
        },
        {
          value: '5',
          text: 'five'
        },
      ]);
    }, 5000);

    setTimeout(() => {
      this.optionTestSubject.next([
        {
          value: '0',
          text: 'zero 0'
        },
        {
          value: '1',
          text: 'one 1'
        },
        {
          value: '2',
          text: 'two 2'
        },
        {
          value: '3',
          text: 'three 3'
        },
        {
          value: '4',
          text: 'four 4'
        },
        {
          value: '5',
          text: 'five 5'
        },
      ]);
    }, 8000);


  }

}
