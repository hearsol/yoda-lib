import { Injectable, ComponentFactoryResolver, ViewContainerRef, Type, ComponentRef, ComponentFactory } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

@Injectable()
export abstract class YodaFloatRef<T> {
  abstract instance: T;
  abstract ref: ComponentRef<T>;
  abstract viewIndex: number;
  abstract destroy(): void;
}

export type ScrollTo = 'toRight' | 'toLeft' | 'toBottom' | 'toTop';

@Injectable({
  providedIn: 'root'
})
export class YodaFloatService {
  factory: ComponentFactory<any>;
  rootViewContainer: ViewContainerRef;
  scrollSubject = new Subject<any>();
  refreshSubject = new Subject<any>();
  initializedSubject = new BehaviorSubject<boolean>(false);

  constructor() { }

  setRootViewContainerRef(factory: ComponentFactory<any>, viewContainerRef: ViewContainerRef) {
    this.factory = factory;
    this.rootViewContainer = viewContainerRef;
  }

  /**
   *
   *
   * @param c Component Type
   * @param options.callerRef? callers YodaFloatRef
   * @param options.index?: number | 'onMyLeft' | 'onMyRight' when use onMyLeft or onMyRight you should set seflRef default is append
   * @param options.size?: string | number; 'small', 'medium', 'large' or px default is '500px'
   * @param options.autoScroll?: boolean set for auto scroll when appear default true
   * @param options.smoothScroll?: boolean set for smooth scroll default true
   * @param options.animation?: boolean  set for animation appear and disappear default true
   */
  addComponent<T>(c: Type<T>, options?: {
    callerRef?: YodaFloatRef<any>;
    index?: number | 'start' | 'end' | 'onMyLeft' | 'onMyRight';
    size?: string | number;
    autoScroll?: boolean;
    smoothScroll?: boolean;
    animation?: boolean;
  }): YodaFloatRef<T> {
    let index;
    if (options && 'index' in options) {
      if (options && options.callerRef && options.callerRef.ref) {
        // update view index
        options.callerRef.viewIndex = this.rootViewContainer.indexOf(options.callerRef.ref.hostView);
      }
      if (options.index === 'start') {
        index = 0;
      } else if (options.index === 'end') {
        index = undefined;
      } else if (options.index === 'onMyLeft' && options.callerRef) {
        index = options.callerRef.viewIndex <= 0 ? 0 : options.callerRef.viewIndex;
      } else if (options.index === 'onMyRight' && options.callerRef) {
        index = options.callerRef.viewIndex + 1;
      } else if (typeof options.index === 'number') {
        index = options.index;
      }
    }
    const shipComponentRef = this.rootViewContainer.createComponent(this.factory, index);
    shipComponentRef.instance.viewIndex = this.rootViewContainer.indexOf(shipComponentRef.hostView);
    this.refreshSubject.next();
    return shipComponentRef.instance.init(shipComponentRef, c, options) as any as YodaFloatRef<T>;
  }

  initialized() {
    this.initializedSubject.next(true);
  }

  isInitialized(): Observable<boolean> {
    return this.initializedSubject.asObservable();
  }

  listen(): Observable<ScrollTo> {
    return this.scrollSubject.asObservable();
  }

  onRefresh(): Observable<any> {
    return this.refreshSubject.asObservable();
  }

  scroll(to: ScrollTo): any {
    return this.scrollSubject.next(to);
  }
}
