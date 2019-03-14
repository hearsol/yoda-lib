import { Injectable, ComponentFactoryResolver, ViewContainerRef, Type, ComponentRef, ComponentFactory } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

export interface YodaFloatRef<T> {
  instance: T;
  ref: ComponentRef<T>;
  destroy(): void;
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

  addComponent<T>(c: Type<T>, options?: {
    index?: number;
    size?: string | number;
  }): YodaFloatRef<T> {
    const shipComponentRef = this.rootViewContainer.createComponent(this.factory, options ? options.index : undefined);
    this.refreshSubject.next();
    const size = options ? options.size : undefined;
    return shipComponentRef.instance.init(shipComponentRef, c, size) as any as YodaFloatRef<T>;
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
