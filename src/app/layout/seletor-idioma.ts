import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConteudoService } from '@app/core/conteudo.service';
import { Idioma } from '@app/core/idioma';

/** Link para o outro idioma. O inglês fica em /. O português fica em /pt. */
@Component({
  selector: 'zas-seletor-idioma',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav [attr.aria-label]="ui.idioma" class="shrink-0">
      <a
        [routerLink]="conteudo.caminho(outro)"
        [fragment]="conteudo.fragmento()"
        [attr.lang]="outro === 'pt' ? 'pt-BR' : 'en'"
        [attr.hreflang]="outro === 'pt' ? 'pt-BR' : 'en'"
        [attr.aria-label]="nome"
        class="inline-flex h-11 items-center px-1 text-[0.8125rem] font-medium tracking-[0.16em] uppercase transition-colors"
        [class]="
          claro() ? 'text-zas-marinho/55 hover:text-zas-marinho' : 'text-white/65 hover:text-white'
        "
      >
        {{ rotulo }}
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

  protected get outro(): Idioma {
    return this.conteudo.idioma() === 'pt' ? 'en' : 'pt';
  }

  protected get rotulo(): string {
    return this.outro === 'en' ? 'EN' : 'PT';
  }

  protected get nome(): string {
    return this.outro === 'en' ? this.ui.ingles : this.ui.portugues;
  }
}
