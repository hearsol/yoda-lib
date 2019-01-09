import { Component, OnInit, ViewChild, ViewContainerRef, ElementRef, AfterViewChecked, ComponentFactoryResolver } from '@angular/core';
import { YodaFloatService, ScrollTo } from './yoda-float.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'yoda-float',
  template: `
    <div class="work layout-wrap" [hidden]="isHide()">
      <ng-template #vc></ng-template>
    </div>
  `,
  styles: ['./yoda-float.component.css']
})
export class YodaFloatComponent implements AfterViewChecked {
  @ViewChild('vc', {read: ViewContainerRef}) vc: ViewContainerRef;

  constructor(
    private osScroller: ElementRef,
    private fr: ComponentFactoryResolver,
    private yodaFloatService: YodaFloatService) {
    this.yodaFloatService.listen().subscribe(to => this.scroll(to));
  }

  ngAfterViewChecked() {
    this.yodaFloatService.setRootViewContainerRef(this.fr, this.vc);
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
