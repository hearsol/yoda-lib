import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, Type, ComponentRef, AfterViewInit } from '@angular/core';
import { YodaFloatService } from 'yoda-float/public_api';

@Component({
  selector: 'lib-yoda-float-ship',
  templateUrl: './yoda-float-ship.component.html',
  styleUrls: ['./yoda-float-ship.component.css']
})
export class YodaFloatShipComponent<T> implements AfterViewInit, OnInit {
  @ViewChild('vc', { read: ViewContainerRef }) vc: ViewContainerRef;
  needScroll = true;
  selfRef: ComponentRef<YodaFloatShipComponent<T>>;
  instance: T;
  ref: ComponentRef<T>;
  constructor(
    private fr: ComponentFactoryResolver,
    private yodaFloatService: YodaFloatService
  ) { }

  ngOnInit() {
  }

  destory() {
    if (this.selfRef) {
      this.selfRef.destroy();
    }
  }

  ngAfterViewInit(): void {
    if (this.needScroll) {
      setTimeout(() => {
        this.needScroll = false;
        if (this.yodaFloatService && this.yodaFloatService.scrollSubject) {
          this.yodaFloatService.scrollSubject.next('toRight');
        }
      });
    }
  }

  init(selfRef: ComponentRef<YodaFloatShipComponent<T>>, c: Type<T>): YodaFloatShipComponent<T> {
    const factory = this.fr.resolveComponentFactory(c);
    this.selfRef = selfRef;
    this.ref = this.vc.createComponent(factory);
    this.instance = this.ref.instance;
    return this;
  }
}
