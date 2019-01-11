import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { YodaTableModule } from 'projects/yoda-table/src/public_api';
import { YodaTestComponent } from './yoda-test/yoda-test.component';
import { YodaFloatModule, YodaFloatService } from 'projects/yoda-float/src/public_api';
import { YodaFloatTestComponent } from './yoda-float-test/yoda-float-test.component';
import { YodaListModule } from 'projects/yoda-list/src/public_api';
import { YodaFormModule } from 'projects/yoda-form/src/public_api';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    YodaTestComponent,
    YodaFloatTestComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    YodaTableModule,
    YodaFloatModule.forRoot(),
    YodaListModule,
    YodaFormModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
