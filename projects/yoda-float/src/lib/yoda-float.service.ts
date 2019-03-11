import { Injectable, ComponentFactoryResolver, ViewContainerRef, Type, ComponentRef } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { YodaFloatShipComponent } from './yoda-float-ship/yoda-float-ship.component';

export type ScrollTo = 'toRight' | 'toLeft' | 'toBottom' | 'toTop';

@Injectable({
  providedIn: 'root'
})
export class YodaFloatService {
  factoryResolver: ComponentFactoryResolver;
  rootViewContainer: ViewContainerRef;
  scrollSubject = new Subject<any>();
  refreshSubject = new Subject<any>();
  initializedSubject = new BehaviorSubject<boolean>(false);

  constructor() { }

  setRootViewContainerRef(fr: ComponentFactoryResolver, viewContainerRef: ViewContainerRef) {
    this.factoryResolver = fr;
    this.rootViewContainer = viewContainerRef;
  }

  addComponent<T>(c: Type<T>, index?: number): YodaFloatShipComponent<T> {
    const factory = this.factoryResolver.resolveComponentFactory(YodaFloatShipComponent);
    const shipComponentRef = this.rootViewContainer.createComponent(factory, index);
    this.refreshSubject.next();
    return shipComponentRef.instance.init(shipComponentRef, c) as YodaFloatShipComponent<T>;
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
