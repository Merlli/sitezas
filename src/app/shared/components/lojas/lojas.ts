import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ConteudoService } from '@app/core/conteudo.service';

/** Selos oficiais das lojas: não alterar cor, proporção nem texto (regras de marca do Google e da Apple). */
@Component({
  selector: 'zas-lojas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classeHost()' },
  template: `
    <a [href]="links.googlePlay.url" class="inline-block rounded-lg transition-transform hover:-translate-y-0.5">
      <img
        src="/lojas/google-play.webp"
        [alt]="ui.baixarNoGooglePlay"
        width="162"
        height="48"
        loading="lazy"
        decoding="async"
        [class]="classeSelo()"
      />
    </a>
    <a [href]="links.appStore.url" class="inline-block rounded-lg transition-transform hover:-translate-y-0.5">
      <img
        src="/lojas/app-store.svg"
        [alt]="ui.baixarNaAppStore"
        width="144"
        height="48"
        loading="lazy"
        decoding="async"
        [class]="classeSelo()"
      />
    </a>
  `,
})
export class Lojas {
  /** Versão menor para cartões; dentro de um @container, vira duas colunas a partir de 16rem. */
  readonly compacto = input(false);

  private readonly conteudo = inject(ConteudoService);
  protected get links() {
    return this.conteudo.pacote().links;
  }
  protected get ui() {
    return this.conteudo.pacote().ui;
  }
  protected readonly classeHost = computed(() =>
    this.compacto()
      ? 'flex flex-col items-start gap-1.5 @3xs:flex-row @3xs:items-center @3xs:gap-2'
      : 'flex flex-wrap items-center gap-3',
  );
  protected readonly classeSelo = computed(() => (this.compacto() ? 'h-8 w-auto @3xs:h-9' : 'h-12 w-auto'));
}
