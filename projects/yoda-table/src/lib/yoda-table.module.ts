import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { YodaTableComponent } from './yoda-table.component';
import { YodaPaginationComponent } from './yoda-pagination/yoda-pagination.component';
import { SafeHtmlPipe } from './safe-html.pipe';

@NgModule({
  declarations: [
    YodaTableComponent,
    YodaPaginationComponent,
    SafeHtmlPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
  ],
  exports: [
    YodaTableComponent,
    YodaPaginationComponent,
  ]
})
export class YodaTableModule { }
