import {
  Component, OnInit, ViewChild, ViewContainerRef,
  ComponentFactoryResolver, Type, ComponentRef,
  AfterViewInit, Input, Renderer2, AfterContentChecked, ChangeDetectorRef
} from '@angular/core';
import { YodaFloatService, YodaFloatRef } from '../yoda-float.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'yoda-float-ship',
  templateUrl: './yoda-float-ship.component.html',
  styleUrls: ['./yoda-float-ship.component.scss'],
  animations: [
    trigger('flipState', [
      state('active', style({
        // transform: 'rotateY(0) translateZ(0)'
        // transform: 'translateX(0)',
        filter: 'blur(0)',
        opacity: 1
      })),
      state('inactive', style({
        opacity: 0,
        filter: 'blur(4px)',
        // transform: 'translateX(200px)',
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
  needScroll = true;
  selfRef: ComponentRef<YodaFloatShipComponent<T>>;
  instance: T;
  ref: ComponentRef<T>;
  flip = 'inactive';
  isFlipped = false;
  isVisible = false;

  constructor(
    private fr: ComponentFactoryResolver,
    private renderer2: Renderer2,
    private yodaFloatService: YodaFloatService,
    private cdf: ChangeDetectorRef
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
    }, 200);
  }

  ngAfterViewInit(): void {
    if (!this.isVisible) {
      this.isVisible = true;
      this.flip = 'active';
      this.cdf.detectChanges();
      setTimeout(() => {
        this.isFlipped = true;
        // this.renderer2.setStyle(this.selfRef.location.nativeElement, 'perspective', '0');
      }, 200);
    }
    if (this.needScroll) {
      setTimeout(() => {
        this.needScroll = false;
        if (this.yodaFloatService && this.yodaFloatService.scrollSubject) {
          this.yodaFloatService.scrollSubject.next('toRight');
        }
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
          'medium': '800px',
          'large': '1200px'
        };
        sizeWidth = sizeOptions[size] || size;
      } else {
        sizeWidth = `${size}px`;
      }
    }
    this.renderer2.setStyle(this.selfRef.location.nativeElement, 'min-width', sizeWidth);
    this.renderer2.setStyle(this.selfRef.location.nativeElement, 'max-width', sizeWidth);
  }

  init(selfRef: ComponentRef<YodaFloatShipComponent<T>>, c: Type<T>, size?: string | number): YodaFloatShipComponent<T> {
    const factory = this.fr.resolveComponentFactory(c);
    this.selfRef = selfRef;
    this.ref = this.vc.createComponent(factory);
    this.instance = this.ref.instance;
    this.renderer2.addClass(selfRef.location.nativeElement, 'layout-item');
    // this.renderer2.setStyle(selfRef.location.nativeElement, 'perspective', '800px');
    this.setSize(size);
    return this;
  }
}
