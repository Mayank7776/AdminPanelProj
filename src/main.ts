import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { App } from './app/app';
import { provideHttpClient, withInterceptors} from '@angular/common/http';
import { TokenInterceptor } from './app/core/service/interceptors/token-interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';


bootstrapApplication(App, {
  providers: [
    provideAnimations(),
   provideRouter(routes),
    provideHttpClient(withInterceptors([TokenInterceptor]))
    ]
}).catch(err => console.error(err));
