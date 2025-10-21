import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      BrowserAnimationsModule,
      HttpClientModule, // Import HttpClientModule here
      ToastrModule.forRoot({
        timeOut: 3000, // Duration of the toast
        positionClass: 'toast-top-center', // Position of the toast
        preventDuplicates: true, // Prevent duplicate toasts
      })
    ),
  ],
}).catch(err => console.error(err));
