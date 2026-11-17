import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet, Scroll } from '@angular/router';
import { ChamadaChat } from '@app/layout/chamada-chat';
import { SiteFooter } from '@app/layout/site-footer';
import { SiteHeader } from '@app/layout/site-header';
import { SkipLink } from '@app/layout/skip-link';
import { filter } from 'rxjs';

@Component({
  selector: 'zas-root',
  imports: [RouterOutlet, SkipLink, SiteHeader, SiteFooter, ChamadaChat],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-dvh flex-col' },
  templateUrl: './app.html',
})
export class App {
  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const documento = inject(DOCUMENT);
    // Depois de rolar até um bloco, o foco vai para o título dele (leitor de tela anuncia onde chegou).
    inject(Router)
      .events.pipe(
        filter((evento): evento is Scroll => evento instanceof Scroll && !!evento.anchor),
        takeUntilDestroyed(),
      )
      .subscribe(({ anchor }) => {
        setTimeout(() => {
          const alvo =
            documento.getElementById(`${anchor}-titulo`) ?? documento.getElementById(anchor!);
          alvo?.focus({ preventScroll: true });
        }, 400);
      });
  }
}
