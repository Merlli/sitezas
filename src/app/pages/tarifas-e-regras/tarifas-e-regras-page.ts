import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConteudoService } from '@app/core/conteudo.service';
import { PageHeader } from '@app/shared/components/page-header/page-header';
import { RichText } from '@app/shared/components/rich-text/rich-text';
import { TabelaTarifas } from '@app/shared/components/tabela-tarifas/tabela-tarifas';

@Component({
  selector: 'zas-tarifas-e-regras-page',
  imports: [PageHeader, RichText, TabelaTarifas],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <zas-page-header [titulo]="conteudo.titulo" ilustracao="/ilustracoes/passo-3-regra.svg">
      <p id="tarifas-introducao" class="max-w-prose text-lg leading-relaxed text-zas-marinho/80 sm:text-xl">
        {{ conteudo.introducao }}
      </p>
    </zas-page-header>

    <div class="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12 sm:py-16">
      <zas-tabela-tarifas [tabela]="conteudo.tabela" rotuladoPor="tarifas-introducao" />
      <div class="flex items-start gap-4 rounded-[2rem] bg-zas-amarelo-fundo p-6 ring-2 ring-zas-amarelo sm:p-8">
        <svg aria-hidden="true" viewBox="0 0 24 24" class="size-8 shrink-0">
          <circle cx="12" cy="12" r="11" class="fill-zas-azul" />
          <path d="M12 6.5v7" stroke="#f2ec33" stroke-width="2.6" stroke-linecap="round" />
          <circle cx="12" cy="17.3" r="1.5" fill="#f2ec33" />
        </svg>
        <p class="max-w-prose text-base leading-relaxed text-zas-marinho sm:text-lg">
          <zas-rich-text [texto]="conteudo.atencao" />
        </p>
      </div>
    </div>
  `,
})
export class TarifasERegrasPage {
  private readonly textos = inject(ConteudoService);
  protected get conteudo() {
    return this.textos.pacote().tarifasERegras;
  }
}
