import { NgModule } from '@angular/core';
import { YodaFormComponent } from './yoda-form.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SafeHtmlPipe } from './safe-html.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { YodaFormControlComponent } from './yoda-form-control.component';

@NgModule({
  declarations: [
    SafeHtmlPipe,
    YodaFormComponent,
    YodaFormControlComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    FontAwesomeModule,
  ],
  entryComponents: [
    YodaFormComponent,
  ],
  exports: [
    YodaFormComponent,
    YodaFormControlComponent,
  ],
  providers: [
  ]
})
export class YodaFormModule { }
