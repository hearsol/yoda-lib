import { Component, OnInit, ComponentRef } from '@angular/core';
import { mockData } from '../MOCK_DATA';
import { of } from 'rxjs';
import { YodaFloatService } from 'projects/yoda-float/src/public_api';
import { YodaTableOptions, YodaTableField, YodaTablePage, YodaTableComponent } from 'projects/yoda-table/src/public_api';

@Component({
  selector: 'app-yoda-test',
  templateUrl: './yoda-test.component.html',
  styleUrls: ['./yoda-test.component.scss']
})
export class YodaTestComponent implements OnInit {
  yodaTableOptions: YodaTableOptions;
  tableRef: ComponentRef<YodaTableComponent>;

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
            const num = Math.floor(Math.random() * 1000);
            return `<img src="https://picsum.photos/64?image=${num}">`;
          };
          break;
      }
      return field;
    });
    this.yodaTableOptions = {
      fields: fields,
      asyncPaging: (pageNum: number, pageSize: number) => {
        const start = (pageNum - 1) * pageSize;
        const page: YodaTablePage = {
          total: mockData.length,
          data: mockData.slice(start, start + pageSize)
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
