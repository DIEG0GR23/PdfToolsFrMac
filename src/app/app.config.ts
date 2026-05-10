import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { provideRouter } from "@angular/router";
// PrimeNG
import { providePrimeNG } from "primeng/config";
import { provideAnimations } from "@angular/platform-browser/animations";

import { routes } from "./app.routes";
import Noir from "../ThemePreset";
import { MessageService } from "primeng/api";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: Noir,
        options: {
          darkModeSelector: '.my-app-dark'
        }
      }
    }),
    provideAnimations(),
    MessageService
  ],
};
