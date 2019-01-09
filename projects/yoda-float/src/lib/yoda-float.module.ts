import { NgModule, ModuleWithProviders } from '@angular/core';
import { YodaFloatComponent } from './yoda-float.component';
import { YodaFloatService } from './yoda-float.service';

@NgModule({
  declarations: [YodaFloatComponent],
  imports: [
  ],
  exports: [YodaFloatComponent]
})
export class YodaFloatModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: YodaFloatModule,
      providers: [YodaFloatService]
    };
  }
}
