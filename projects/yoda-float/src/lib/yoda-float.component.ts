import { Component, OnInit, ViewChild, ViewContainerRef, ElementRef, AfterViewChecked, ComponentFactoryResolver } from '@angular/core';
import { YodaFloatService, ScrollTo } from './yoda-float.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'yoda-float',
  templateUrl: './yoda-float.component.html',
  styleUrls: ['./yoda-float.component.scss']
})
export class YodaFloatComponent implements AfterViewChecked {
  @ViewChild('vc', {read: ViewContainerRef}) vc: ViewContainerRef;
  @ViewChild('osScroller') osScroller: ElementRef;

  constructor(
    private fr: ComponentFactoryResolver,
    private yodaFloatService: YodaFloatService) {
    this.yodaFloatService.listen().subscribe(to => this.scroll(to));
  }

  ngAfterViewChecked() {
    this.yodaFloatService.setRootViewContainerRef(this.fr, this.vc);
    this.yodaFloatService.initialized();
  }

  isHide() {
    return this.vc.length === 0;
  }

  scroll(to: ScrollTo): void {
    switch (to) {
      case 'toLeft':
        try {
          this.osScroller.nativeElement.scrollLeft = 0;
        } catch (err) { }
        break;
      case 'toRight':
        try {
          this.osScroller.nativeElement.scrollLeft = this.osScroller.nativeElement.scrollWidth;
        } catch (err) { }
        break;
      case 'toBottom':
        try {
          this.osScroller.nativeElement.scrollTop = this.osScroller.nativeElement.scrollHeight;
        } catch (err) { }
        break;
      case 'toTop':
        try {
          this.osScroller.nativeElement.scrollTop = 0;
        } catch (err) { }
        break;
    }
  }
}
