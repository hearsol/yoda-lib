import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'yoda-pagination',
  templateUrl: './yoda-pagination.component.html',
  styleUrls: []
})
export class YodaPaginationComponent implements OnInit, OnChanges {
  @Output() pageChanges: EventEmitter<{page?: number, pageSize?: number}> = new EventEmitter();
  @Output() pageChange = new EventEmitter();

  @Input() totalSize: number;
  @Input() pageSize: number;
  @Input() maxSize: number;
  @Input() page: number;
  @Input() hidePageSize: boolean;
  @Input() pageSizeList: number[];

  constructor() {
    this.maxSize = 5;
    this.pageSize = 10;
    this.pageSizeList = [5, 10, 15, 20, 25, 50];
  }

  ngOnInit() {
    this.pageChanges.emit({ page: this.page, pageSize: this.pageSize });
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  onPageChanges(pageNum: number) {
    this.pageChanges.emit({page: pageNum});
    this.pageChange.emit(this.page);
  }
  onPageSize(pageSize: number) {
    this.pageSize = Number(pageSize);
    this.pageChanges.emit({ pageSize: this.pageSize });
  }
}
