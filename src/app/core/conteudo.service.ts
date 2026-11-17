import { DOCUMENT, Injectable, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { EN, PT } from '@app/content';
import { filter, map } from 'rxjs';
import { caminhoDoIdioma, idiomaDaUrl, prefixarCaminho, type Idioma } from './idioma';

@Injectable({ providedIn: 'root' })
export class ConteudoService {
  private readonly router = inject(Router);
  private readonly documento = inject(DOCUMENT);

  readonly url = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly idioma = computed(() => idiomaDaUrl(this.url()));

  readonly pacote = computed(() => (this.idioma() === 'pt' ? PT : EN));

  constructor() {
    effect(() => {
      this.documento.documentElement.lang = this.idioma() === 'pt' ? 'pt-BR' : 'en';
    });
  }

  prefixar(caminho: string): string {
    return prefixarCaminho(this.idioma(), caminho);
  }

  /** Caminho da mesma página em um idioma, sem a âncora. */
  caminho(alvo: Idioma): string {
    return caminhoDoIdioma(this.url(), alvo).split('#')[0];
  }

  fragmento(): string | undefined {
    const url = this.url();
    const indice = url.indexOf('#');
    return indice >= 0 ? url.slice(indice + 1) : undefined;
  }
}
