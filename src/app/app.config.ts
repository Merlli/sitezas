import {
  type ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { SeoService } from '@app/core/seo.service';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';
import { routes } from './app.routes';

/** Espaço (px) entre o cabeçalho fixo e o começo da seção ao seguir um link do menu. */
const FOLGA_ANCORA = 16;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideClientHydration(withEventReplay()),
    provideSpartanHlm(),
    provideAppInitializer(() => inject(SeoService).iniciar()),
    provideAppInitializer(() => {
      const documento = inject(DOCUMENT);
      inject(ViewportScroller).setOffset(() => [0, (documento.querySelector('header')?.offsetHeight ?? 0) + FOLGA_ANCORA]);
    }),
  ],
};
