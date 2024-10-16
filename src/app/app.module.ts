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
import { TooltipDirective } from './directives/tooltip.directive';
import { MockBackendInterceptor } from './shared/mock-backend/mock-backend.interceptor';
import { FormCardComponent } from './components/form-card/form-card.component';

@NgModule({
  declarations: [AppComponent, FormCardComponent, TooltipDirective],
  imports: [BrowserModule, ReactiveFormsModule, HttpClientModule],
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
