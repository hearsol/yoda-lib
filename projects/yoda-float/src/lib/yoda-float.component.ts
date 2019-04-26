import {
  Component, ViewChild, ViewContainerRef, ElementRef,
  ComponentFactoryResolver, AfterViewInit, Input, ComponentFactory, SimpleChanges, OnChanges
} from '@angular/core';
import { YodaFloatService, ScrollTo } from './yoda-float.service';
import { YodaFloatShipComponent } from './yoda-float-ship/yoda-float-ship.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'yoda-float',
  templateUrl: './yoda-float.component.html',
  styleUrls: ['./yoda-float.component.scss']
})
export class YodaFloatComponent implements AfterViewInit, OnChanges {
  @Input() width: string;
  @Input() useLocalScroll: boolean;
  @ViewChild('vc', { read: ViewContainerRef }) vc: ViewContainerRef;
  @ViewChild('osScroller') osScroller: ElementRef;
  isInited = false;
  styleWidth = { width: '100%' };
  factory: ComponentFactory<any>;
  constructor(
    private fr: ComponentFactoryResolver,
    private yodaFloatService: YodaFloatService) {
    this.yodaFloatService.listen().subscribe(to => this.scroll(to));
    this.yodaFloatService.onRefresh().subscribe(() => {
      this.refresh();
    });
  }

  ngAfterViewInit() {
    if (!this.isInited) {
      this.factory = this.fr.resolveComponentFactory(YodaFloatShipComponent) as ComponentFactory<any>;
      this.yodaFloatService.setRootViewContainerRef(this.factory, this.vc);
      this.yodaFloatService.initialized();
      this.isInited = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['width']) {
      this.styleWidth.width = this.width || '100%';
    }
  }

  isHide() {
    return this.vc.length === 0;
  }

  refresh() {
  }

  scroll(to: ScrollTo): void {
    let scrollingElement;
    if (this.useLocalScroll) {
      scrollingElement = this.osScroller.nativeElement;
    } else {
      scrollingElement = document.scrollingElement || document.documentElement;
    }
    if (!scrollingElement) {
      return;
    }

    switch (to) {
      case 'toLeft':
        try {
          scrollingElement.scrollLeft = 0;
        } catch (err) { }
        break;
      case 'toRight':
        try {
          scrollingElement.scrollLeft = scrollingElement.scrollWidth;
        } catch (err) { }
        break;
      case 'toBottom':
        try {
          scrollingElement.scrollTop = scrollingElement.scrollHeight;
        } catch (err) { }
        break;
      case 'toTop':
        try {
          scrollingElement.scrollTop = 0;
        } catch (err) { }
        break;
    }
  }
}
