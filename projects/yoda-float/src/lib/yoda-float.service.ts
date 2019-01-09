import { Injectable, ComponentFactoryResolver, ViewContainerRef, Type, ComponentRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type ScrollTo = 'toRight' | 'toLeft' | 'toBottom' | 'toTop';

@Injectable({
  providedIn: 'root'
})
export class YodaFloatService {
  factoryResolver: ComponentFactoryResolver;
  rootViewContainer: ViewContainerRef;
  scrollSubject = new Subject<ScrollTo>();

  constructor() {}

  setRootViewContainerRef(fr: ComponentFactoryResolver, viewContainerRef: ViewContainerRef) {
    this.factoryResolver = fr;
    this.rootViewContainer = viewContainerRef;
  }

  addComponent<T>(c: Type<T>): ComponentRef<T> {
    const factory = this.factoryResolver.resolveComponentFactory(c);
    const componentRef = this.rootViewContainer.createComponent(factory);
    return componentRef;
  }

  listen(): Observable<ScrollTo> {
    return this.scrollSubject.asObservable();
  }

  scroll(to: ScrollTo): any {
    return this.scrollSubject.next(to);
  }
}
