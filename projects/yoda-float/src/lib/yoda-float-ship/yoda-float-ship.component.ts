import {
  Component, OnInit, ViewChild, ViewContainerRef,
  ComponentFactoryResolver, Type, ComponentRef,
  AfterViewInit, Input, Renderer2, AfterContentChecked, ChangeDetectorRef, Injector
} from '@angular/core';
import { YodaFloatService, YodaFloatRef } from '../yoda-float.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'yoda-float-ship',
  templateUrl: './yoda-float-ship.component.html',
  styleUrls: ['./yoda-float-ship.component.scss'],
  animations: [
    trigger('flipState', [
      state('active', style({
        zIndex: 10,
        // transform: 'rotateY(0) translateZ(0)'
        transform: 'translateX(0)',
        position: 'relative',

        // filter: 'blur(0)',
        // transform: 'scaleX(1)',
        opacity: 1
      })),
      state('inactive', style({
        zIndex: -10,
        opacity: 0,
        position: 'relative',
        // transform: 'scaleX(0.5)'
        // filter: 'blur(4px)',
        transform: 'translateX(-500px)',
        // transform: 'rotateY(90deg)'
      })),
      transition('active => inactive', animate('200ms ease-out')),
      transition('inactive => active', animate('200ms ease-in'))
    ])
  ]
})
export class YodaFloatShipComponent<T> implements YodaFloatRef<T>, AfterContentChecked, AfterViewInit, OnInit {
  @ViewChild('vc', { read: ViewContainerRef }) vc: ViewContainerRef;
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
    private cdf: ChangeDetectorRef
  ) { }

  ngOnInit() {

  }

  destroy() {
    this.flip = 'inactive';
    // this.renderer2.setStyle(this.selfRef.location.nativeElement, 'z-index', '-1');
    setTimeout(() => {
      if (this.ref) {
        this.ref.destroy();
      }
      if (this.selfRef) {
        this.selfRef.destroy();
      }
    }, this.animation ? 200 : 0);
  }


  ngAfterViewInit(): void {
    if (!this.isVisible) {
      this.isVisible = true;
      if (this.animation) {
        this.flip = 'active';
        this.cdf.detectChanges();
        setTimeout(() => {
          this.isFlipped = true;
          // this.renderer2.setStyle(this.selfRef.location.nativeElement, 'perspective', '0');
          // this.renderer2.setStyle(this.selfRef.location.nativeElement, 'z-index', '1');
        }, 200);
      }
    }
    if (this.needScroll) {
      setTimeout(() => {
        const option = this.smoothScroll ?
          { behavior: 'smooth' } : { block: 'start' };
        this.selfRef.location.nativeElement.scrollIntoView(option);

        this.needScroll = false;
        // this.yodaFloatService.scroll('toRight');
      });
    }
  }

  ngAfterContentChecked() {

  }

  setSize(size: string | number) {
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
    this.renderer2.setStyle(this.selfRef.location.nativeElement, 'min-width', sizeWidth);
    this.renderer2.setStyle(this.selfRef.location.nativeElement, 'max-width', sizeWidth);
  }

  makeInjector() {
    return Injector.create({
      providers: [{ provide: 'YodaFloatRef', useValue: this.selfRef.instance }],
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
    if (options && 'animation' in options) {
      this.animation = options.animation;
    }
    if (options && 'autoScroll' in options) {
      this.needScroll = options.autoScroll;
    }
    if (options && 'smoothScroll' in options) {
      this.smoothScroll = options.smoothScroll;
    }
    const factory = this.fr.resolveComponentFactory(c);
    this.selfRef = selfRef;
    this.ref = this.vc.createComponent(factory, undefined, this.makeInjector());
    this.instance = this.ref.instance;
    this.isVisible = false;
    this.flip = this.animation ? 'inactive' : 'active';

    this.renderer2.addClass(selfRef.location.nativeElement, 'layout-item');
    this.renderer2.addClass(this.ref.location.nativeElement, 'unit');
    // this.renderer2.setStyle(selfRef.location.nativeElement, 'position', 'relative');
    // this.renderer2.setStyle(selfRef.location.nativeElement, 'perspective', '800px');
    // this.renderer2.setStyle(selfRef.location.nativeElement, 'z-index', '-1');
    this.setSize(options ? options.size : undefined);
    return this;
  }
}
