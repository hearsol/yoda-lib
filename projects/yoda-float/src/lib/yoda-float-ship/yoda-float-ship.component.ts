import {
  Component, OnInit, ViewChild, ViewContainerRef,
  ComponentFactoryResolver, Type, ComponentRef,
  AfterViewInit, Input, Renderer2
} from '@angular/core';
import { YodaFloatService, YodaFloatRef } from '../yoda-float.service';

@Component({
  selector: 'yoda-float-ship',
  templateUrl: './yoda-float-ship.component.html',
  styleUrls: ['./yoda-float-ship.component.css']
})
export class YodaFloatShipComponent<T> implements YodaFloatRef<T>, AfterViewInit, OnInit {
  @ViewChild('vc', { read: ViewContainerRef }) vc: ViewContainerRef;
  @Input() c: Type<T>;
  needScroll = true;
  selfRef: ComponentRef<YodaFloatShipComponent<T>>;
  instance: T;
  ref: ComponentRef<T>;
  constructor(
    private fr: ComponentFactoryResolver,
    private renderer2: Renderer2,
    private yodaFloatService: YodaFloatService
  ) { }

  ngOnInit() {
  }

  destroy() {
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

  init(selfRef: ComponentRef<YodaFloatShipComponent<T>>, c: Type<T>, size?: string | number): YodaFloatShipComponent<T> {
    const factory = this.fr.resolveComponentFactory(c);
    this.selfRef = selfRef;
    this.ref = this.vc.createComponent(factory);
    this.instance = this.ref.instance;
    this.renderer2.addClass(selfRef.location.nativeElement, 'layout-item');
    let sizeWidth = '500px';
    if (size) {
      if (typeof size === 'string') {
        const sizeOptions = {
          'small': '500px',
          'medium': '800px',
          'large': '1200px'
        };
        sizeWidth = sizeOptions[size] || size;
      } else {
        sizeWidth = `${size}px`;
      }
    }
    this.renderer2.setStyle(selfRef.location.nativeElement, 'min-width', sizeWidth);
    return this;
  }
}
