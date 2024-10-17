import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { AppComponent } from './app.component';
import { ValidateInputDirective } from './directives/validate-input.directive';
import { MockBackendInterceptor } from './shared/mock-backend/mock-backend.interceptor';
import { FormCardComponent } from './components/form-card/form-card.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [AppComponent, FormCardComponent, ValidateInputDirective],
  imports: [BrowserModule, CommonModule, ReactiveFormsModule, HttpClientModule],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MockBackendInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
