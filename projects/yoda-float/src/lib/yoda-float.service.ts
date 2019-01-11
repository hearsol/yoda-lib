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

  constructor() {}

  setRootViewContainerRef(fr: ComponentFactoryResolver, viewContainerRef: ViewContainerRef) {
    this.factoryResolver = fr;
    this.rootViewContainer = viewContainerRef;
  }

  addComponent<T>(c: Type<T>): ComponentRef<T> {
    const factory = this.factoryResolver.resolveComponentFactory(c);
    const componentRef = this.rootViewContainer.createComponent(factory);
    if (componentRef.instance && 'scrollListner' in componentRef.instance) {
      (componentRef.instance as any).scrollListner = this.scrollSubject;
    }
    return componentRef;
  }

  initialized() {
  }

  listen(): Observable<ScrollTo> {
    return this.scrollSubject.asObservable();
  }

  scroll(to: ScrollTo): any {
    return this.scrollSubject.next(to);
  }
}
