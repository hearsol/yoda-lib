import { NgModule, ModuleWithProviders } from '@angular/core';
import { YodaFloatComponent } from './yoda-float.component';
import { YodaFloatService } from './yoda-float.service';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { YodaFloatShipComponent } from './yoda-float-ship/yoda-float-ship.component';

@NgModule({
  declarations: [
    YodaFloatComponent,
    YodaFloatShipComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
  ],
  entryComponents: [
    YodaFloatShipComponent,
  ],
  exports: [
    YodaFloatComponent,
    YodaFloatShipComponent
  ]
})
export class YodaFloatModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: YodaFloatModule,
      providers: [YodaFloatService]
    };
  }
}
