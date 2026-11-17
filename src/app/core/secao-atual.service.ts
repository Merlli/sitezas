import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

/** Indica qual bloco da Home está visível, para marcar o item do menu. */
@Injectable({ providedIn: 'root' })
export class SecaoAtualService {
  private readonly documento = inject(DOCUMENT);
  private readonly noNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  private observador?: IntersectionObserver;
  private observadorAcoes?: IntersectionObserver;

  readonly secao = signal<string | null>(null);
  /** Começa verdadeiro para o botão do cabeçalho não piscar antes da primeira medição. */
  readonly acoesInicioVisiveis = signal(true);

  observar(ids: readonly string[], idAcoes?: string): void {
    if (!this.noNavegador || !('IntersectionObserver' in window)) return;
    this.parar();
    this.observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) this.secao.set(entrada.target.id);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of ids) {
      const elemento = this.documento.getElementById(id);
      if (elemento) this.observador.observe(elemento);
    }

    const acoes = idAcoes ? this.documento.getElementById(idAcoes) : null;
    if (acoes) {
      this.observadorAcoes = new IntersectionObserver(
        ([entrada]) => this.acoesInicioVisiveis.set(entrada.isIntersecting),
        { rootMargin: '-80px 0px 0px 0px' },
      );
      this.observadorAcoes.observe(acoes);
    } else {
      this.acoesInicioVisiveis.set(false);
    }
  }

  parar(): void {
    this.observador?.disconnect();
    this.observador = undefined;
    this.observadorAcoes?.disconnect();
    this.observadorAcoes = undefined;
    this.secao.set(null);
    this.acoesInicioVisiveis.set(true);
  }
}
