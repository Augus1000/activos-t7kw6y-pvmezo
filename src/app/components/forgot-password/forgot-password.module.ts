import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForgotPasswordRoutingModule } from './forgot-password-routing.module';
import { ForgotPasswordComponent } from './forgot-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '../../services/translate.service';
import { translateFactory } from '../../app.module';
import { AppComponent } from '../../app.component';



@NgModule({
  declarations: [ForgotPasswordComponent],
  imports: [

    CommonModule,
    ForgotPasswordRoutingModule,
    ReactiveFormsModule
  ],
  providers: [
    TranslateService,
    {
      provide: APP_INITIALIZER,
      useFactory: translateFactory,
      deps: [TranslateService],
      multi: true
    },
  ],
 
})
export class ForgotPasswordModule { }
