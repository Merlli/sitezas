import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConteudoService } from '@app/core/conteudo.service';

/** EN | PT. O inglês é o padrão, em /. O português fica em /pt. */
@Component({
  selector: 'zas-seletor-idioma',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      [attr.aria-label]="ui.idioma"
      class="inline-flex shrink-0 items-center rounded-full p-0.5"
      [class]="claro() ? 'bg-zas-fundo' : 'bg-white/10'"
    >
      <a
        [routerLink]="conteudo.caminho('en')"
        [fragment]="conteudo.fragmento()"
        lang="en"
        [attr.aria-label]="ui.ingles"
        [attr.aria-current]="conteudo.idioma() === 'en' ? 'true' : null"
        class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 text-sm font-extrabold"
        [class]="classe('en')"
      >
        EN
      </a>
      <a
        [routerLink]="conteudo.caminho('pt')"
        [fragment]="conteudo.fragmento()"
        lang="pt-BR"
        [attr.aria-label]="ui.portugues"
        [attr.aria-current]="conteudo.idioma() === 'pt' ? 'true' : null"
        class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 text-sm font-extrabold"
        [class]="classe('pt')"
      >
        PT
      </a>
    </nav>
  `,
})
export class SeletorIdioma {
  /** Fundo claro, para o menu do celular. */
  readonly claro = input(false);

  protected readonly conteudo = inject(ConteudoService);
  protected get ui() {
    return this.conteudo.pacote().ui;
  }

  protected classe(idioma: 'en' | 'pt'): string {
    const ativo = this.conteudo.idioma() === idioma;
    if (ativo) return 'bg-zas-amarelo text-zas-marinho';
    return this.claro() ? 'text-zas-marinho/70 hover:text-zas-marinho' : 'text-white/80 hover:text-white';
  }
}
