import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-chart',
  template: '<div #chart></div>'
})
export class ChartComponent implements OnInit {
  @ViewChild('chart') chartElement: ElementRef;
  options: { chart: { type: string; }; series: { name: string; data: number[]; }[]; xaxis: { categories: number[]; }; };
  // chart: ApexCharts;

  constructor() { }

  ngOnInit() {
    this.options = {
      chart: {
        type: 'line'
      },
      series: [{
        name: 'sales',
        data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
      }],
      xaxis: {
        categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
      }
    };
    /*
    this.chart = new ApexCharts(this.chartElement.nativeElement, this.options);
    this.chart.render();
    */
  }

}
