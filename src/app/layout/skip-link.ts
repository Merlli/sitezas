import { ChangeDetectionStrategy, Component, DOCUMENT, inject } from '@angular/core';
import { ConteudoService } from '@app/core/conteudo.service';

@Component({
  selector: 'zas-skip-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      href="#conteudo"
      (click)="pular($event)"
      class="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:inline-flex focus-visible:min-h-11 focus-visible:items-center focus-visible:rounded-md focus-visible:bg-background focus-visible:px-4 focus-visible:text-sm focus-visible:font-medium focus-visible:text-foreground focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {{ ui.pularParaConteudo }}
    </a>
  `,
})
export class SkipLink {
  private readonly conteudo = inject(ConteudoService);
  protected get ui() {
    return this.conteudo.pacote().ui;
  }
  private readonly document = inject(DOCUMENT);

  // Com <base href="/">, "#conteudo" resolveria para "/#conteudo" e sairia da página atual.
  protected pular(evento: MouseEvent): void {
    evento.preventDefault();
    this.document.getElementById('conteudo')?.focus();
  }
}
