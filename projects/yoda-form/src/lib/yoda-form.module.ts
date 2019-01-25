import { NgModule } from '@angular/core';
import { YodaFormComponent } from './yoda-form.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SafeHtmlPipe } from './safe-html.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    SafeHtmlPipe,
    YodaFormComponent
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
  exports: [YodaFormComponent],
  providers: [
  ]
})
export class YodaFormModule { }
