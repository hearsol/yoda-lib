import { Injectable, ComponentFactoryResolver, ViewContainerRef, Type, ComponentRef } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

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

  constructor() {}

  setRootViewContainerRef(fr: ComponentFactoryResolver, viewContainerRef: ViewContainerRef) {
    this.factoryResolver = fr;
    this.rootViewContainer = viewContainerRef;
  }

  addComponent<T>(c: Type<T>, index?: number): ComponentRef<T> {
    const factory = this.factoryResolver.resolveComponentFactory(c);
    const componentRef = this.rootViewContainer.createComponent(factory, index);
    if (componentRef.instance && 'scrollListner' in componentRef.instance) {
      (componentRef.instance as any).scrollListner = this.scrollSubject;
    }
    this.refreshSubject.next();
    return componentRef;
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
