import { NgModule, ModuleWithProviders } from '@angular/core';
import { YodaFloatComponent } from './yoda-float.component';
import { YodaFloatService } from './yoda-float.service';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [YodaFloatComponent],
  imports: [
    CommonModule
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
