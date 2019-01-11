import { NgModule } from '@angular/core';
import { YodaFormComponent } from './yoda-form.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SafeHtmlPipe } from './safe-html.pipe';

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
  ],
  entryComponents: [
    YodaFormComponent,
  ],
  exports: [YodaFormComponent]
})
export class YodaFormModule { }
