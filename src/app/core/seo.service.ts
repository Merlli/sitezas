import { DOCUMENT, DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { estaPendente } from '@app/content';
import type { PaginaId } from '@app/content/content.types';
import { caminhoDoIdioma, idiomaDaUrl, prefixarCaminho } from '@app/core/idioma';
import { filter } from 'rxjs';
import { ConteudoService } from './conteudo.service';

function isPaginaId(valor: unknown, chaves: object): valor is PaginaId {
  return typeof valor === 'string' && Object.hasOwn(chaves, valor);
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly rotaRaiz = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly conteudo = inject(ConteudoService);

  iniciar(): void {
    this.router.events
      .pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((evento) => this.aplicar(this.paginaAtual(), evento.urlAfterRedirects));
  }

  private paginaAtual(): PaginaId | null {
    let rota = this.rotaRaiz;
    while (rota.firstChild) {
      rota = rota.firstChild;
    }
    const pagina: unknown = rota.snapshot.data['pagina'];
    return isPaginaId(pagina, this.conteudo.pacote().seo) ? pagina : null;
  }

  private aplicar(pagina: PaginaId | null, url: string): void {
    if (!pagina) {
      return;
    }
    const pacote = this.conteudo.pacote();
    const seo = pacote.seo[pagina];
    const idioma = idiomaDaUrl(url);
    this.title.setTitle(seo.titulo);
    this.meta.updateTag({ property: 'og:title', content: seo.titulo });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: idioma === 'pt' ? 'pt_BR' : 'en_US' });
    if (estaPendente(seo.descricao)) {
      this.meta.removeTag('name="description"');
      this.meta.removeTag('property="og:description"');
    } else {
      this.meta.updateTag({ name: 'description', content: seo.descricao });
      this.meta.updateTag({ property: 'og:description', content: seo.descricao });
    }
    this.definirCanonical(url, pacote.site.url);
    this.definirAlternates(url, pacote.site.url);
  }

  private definirCanonical(url: string, origem: string): void {
    if (!origem.startsWith('https://')) return;
    const caminho = url.split(/[?#]/)[0];
    this.garantirLink('canonical', new URL(caminho, origem).toString());
  }

  private definirAlternates(url: string, origem: string): void {
    if (!origem.startsWith('https://')) return;
    const neutro = caminhoDoIdioma(url, 'en').split(/[?#]/)[0];
    const ingles = new URL(prefixarCaminho('en', neutro), origem).toString();
    const portugues = new URL(prefixarCaminho('pt', neutro), origem).toString();
    this.garantirLink('alternate', ingles, 'en');
    this.garantirLink('alternate', portugues, 'pt-BR');
    this.garantirLink('alternate', ingles, 'x-default');
  }

  private garantirLink(rel: string, href: string, hreflang?: string): void {
    const seletor = hreflang
      ? `link[rel="${rel}"][hreflang="${hreflang}"]`
      : `link[rel="${rel}"]:not([hreflang])`;
    let link = this.document.head.querySelector<HTMLLinkElement>(seletor);
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', rel);
      if (hreflang) link.setAttribute('hreflang', hreflang);
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}
