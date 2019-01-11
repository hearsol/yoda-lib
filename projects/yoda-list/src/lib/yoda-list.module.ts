import { NgModule } from '@angular/core';
import { YodaListComponent } from './yoda-list.component';
import { YodaTableModule } from '@hsolpkg/yoda-table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SafeHtmlPipe } from './safe-html.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    YodaListComponent,
    SafeHtmlPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    FontAwesomeModule,
    YodaTableModule,
  ],
  entryComponents: [
    YodaListComponent,
  ],
  exports: [YodaListComponent]
})
export class YodaListModule { }
