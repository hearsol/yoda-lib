import {
  Component, OnInit, ViewChild, ViewContainerRef,
  ComponentFactoryResolver, Type, ComponentRef,
  AfterViewInit, Input, Renderer2, AfterContentChecked, ChangeDetectorRef, Injector, ElementRef
} from '@angular/core';
import { YodaFloatRef } from '../yoda-float.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'yoda-float-ship',
  templateUrl: './yoda-float-ship.component.html',
  styleUrls: ['./yoda-float-ship.component.scss'],
  animations: [
    trigger('flipState', [
      state('active', style({
        width: '100%',
        filter: 'blur(0)',
        transform: 'scale(1)',
        opacity: 1
      })),
      state('inactive', style({
        opacity: 0,
        width: '0',
        transform: 'scale(0.5)',
        filter: 'blur(4px)',
      })),
      transition('active => inactive', animate('100ms ease-out')),
      transition('inactive => active', animate('200ms ease-in'))
    ])
  ]
})
export class YodaFloatShipComponent<T> implements YodaFloatRef<T>, AfterViewInit, OnInit {
  @ViewChild('vc', { read: ViewContainerRef }) vc: ViewContainerRef;
  @ViewChild('flip') flipElement: ElementRef;
  @Input() c: Type<T>;
  viewIndex: number;
  needScroll = true;
  selfRef: ComponentRef<YodaFloatShipComponent<T>>;
  instance: T;
  ref: ComponentRef<T>;
  flip = 'inactive';
  isFlipped = false;
  isVisible = false;
  animation = true;
  smoothScroll: boolean;

  constructor(
    private fr: ComponentFactoryResolver,
    private renderer2: Renderer2,
    private injector: Injector,
    private cdf: ChangeDetectorRef,
    private elementRef: ElementRef,
  ) { }

  ngOnInit() {

  }

  destroy() {
    this.flip = 'inactive';
    setTimeout(() => {
      if (this.ref) {
        this.ref.destroy();
      }
      if (this.selfRef) {
        this.selfRef.destroy();
      }
    }, this.animation ? 100 : 0);
  }


  ngAfterViewInit(): void {
    if (!this.isVisible) {
      this.isVisible = true;
      if (this.animation) {
        this.flip = 'active';
        this.cdf.detectChanges();
        setTimeout(() => {
          this.isFlipped = true;
          this.renderer2.setStyle(this.flipElement.nativeElement, 'filter', '');
          this.renderer2.setStyle(this.flipElement.nativeElement, 'transform', '');
        }, 200);
      } else {
        setTimeout(() => {
          this.renderer2.setStyle(this.flipElement.nativeElement, 'filter', '');
          this.renderer2.setStyle(this.flipElement.nativeElement, 'transform', '');
        });
    }
    }
    if (this.needScroll) {
      setTimeout(() => {
        const option = this.smoothScroll ?
          { behavior: 'smooth', inline: 'end' } : { inline: 'end' };
        const ele = this.renderer2.selectRootElement(this.elementRef, true);
        ele.nativeElement.scrollIntoView(option);

        this.needScroll = false;
      }, 10);
    }
  }

  setSize(options: any) {
    const size = options ? options.size : undefined;
    let sizeWidth = '500px';
    if (size) {
      if (typeof size === 'string') {
        const sizeOptions = {
          'small': '500px',
          's': '500px',
          'medium': '800px',
          'm': '800px',
          'large': '1200px',
          'l': '1200px',
        };
        sizeWidth = sizeOptions[size.toLowerCase()] || size;
      } else {
        sizeWidth = `${size}px`;
      }
    }
    const numSize = Number(sizeWidth.replace(/[^-\d\.]/g, ''));
    if (options && 'animation' in options) {
      this.animation = options.animation;
    } else if (numSize >= 1000) {
      this.animation = false;
    }
    this.flip = this.animation ? 'inactive' : 'active';

    this.renderer2.setStyle(this.selfRef.location.nativeElement, 'min-width', sizeWidth);
    this.renderer2.setStyle(this.selfRef.location.nativeElement, 'max-width', sizeWidth);
  }

  makeInjector() {
    return Injector.create({
      providers: [{ provide: YodaFloatRef, useValue: this.selfRef.instance }],
      parent: this.injector
    });
  }

  init(selfRef: ComponentRef<YodaFloatShipComponent<T>>, c: Type<T>, options?: {
    callerRef?: YodaFloatRef<any>;
    index?: number | 'onMyLeft' | 'onMyRight';
    size?: string | number;
    autoScroll?: boolean;
    smoothScroll?: boolean;
    animation?: boolean;
  }): YodaFloatShipComponent<T> {

    if (options && 'autoScroll' in options) {
      this.needScroll = options.autoScroll;
    }
    this.smoothScroll = true;
    if (options && 'smoothScroll' in options) {
      this.smoothScroll = options.smoothScroll;
    }
    const factory = this.fr.resolveComponentFactory(c);
    this.selfRef = selfRef;
    this.ref = this.vc.createComponent(factory, undefined, this.makeInjector());
    this.instance = this.ref.instance;
    this.isVisible = false;

    this.renderer2.addClass(selfRef.location.nativeElement, 'layout-item');
    this.renderer2.addClass(this.ref.location.nativeElement, 'unit');
    this.setSize(options);
    return this;
  }
}
