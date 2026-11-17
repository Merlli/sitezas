import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConteudoService } from '@app/core/conteudo.service';
import { PageHeader } from '@app/shared/components/page-header/page-header';
import { Secao } from '@app/shared/components/secao/secao';
import { Trechos } from '@app/shared/components/trechos/trechos';

const ILUSTRACOES: Record<string, string> = {
  fiscalizacao: '/ilustracoes/spot-fiscalizacao.svg',
  'numero-de-autenticacao': '/ilustracoes/spot-autenticacao.svg',
  'tolerancia-de-15-minutos': '/ilustracoes/spot-tolerancia.svg',
  'vagas-especiais': '/ilustracoes/spot-vagas-especiais.svg',
  'operadores-de-zona-azul': '/ilustracoes/spot-operadores.svg',
};

@Component({
  selector: 'zas-como-funciona-page',
  imports: [PageHeader, Secao, Trechos],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <zas-page-header [titulo]="conteudo.titulo" ilustracao="/ilustracoes/operador-credenciado.svg">
      @for (paragrafo of conteudo.introducao; track $index) {
        <p class="max-w-prose text-lg leading-relaxed text-zas-marinho/80 sm:text-xl">{{ paragrafo }}</p>
      }
    </zas-page-header>

    <section aria-labelledby="destaque-titulo" class="mx-auto max-w-6xl px-4 pt-12 sm:pt-16">
      <div
        class="entra overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_20px_50px_-34px_rgb(0_48_87/0.45)] md:grid md:grid-cols-[0.9fr_1.1fr]"
      >
        <div aria-hidden="true" class="flex items-center justify-center gap-2 bg-zas-amarelo-fundo px-4 py-8 sm:gap-4">
          <img src="/ilustracoes/spot-credito.svg" alt="" width="240" height="180" class="h-auto w-[42%] max-w-52" />
          <span class="text-5xl font-extrabold text-zas-azul">≠</span>
          <img src="/ilustracoes/spot-ativacao.svg" alt="" width="240" height="180" class="h-auto w-[42%] max-w-52" />
        </div>
        <div class="flex flex-col gap-4 p-6 sm:p-10">
          <h2 id="destaque-titulo" class="text-2xl font-extrabold tracking-tight text-balance text-zas-azul sm:text-3xl">
            {{ conteudo.destaque.titulo }}
          </h2>
          @for (paragrafo of conteudo.destaque.paragrafos; track $index) {
            <p class="max-w-prose text-base leading-relaxed text-zas-marinho/85 sm:text-lg">{{ paragrafo }}</p>
          }
        </div>
      </div>
    </section>

    @for (secao of conteudo.secoes; track secao.id; let par = $even) {
      <zas-secao
        [id]="secao.id"
        [titulo]="secao.titulo"
        [ilustracao]="ilustracoes[secao.id]"
        [tom]="par ? 'claro' : 'fundo'"
      >
        <zas-trechos [trechos]="secao.trechos" />
      </zas-secao>
    }
  `,
})
export class ComoFuncionaPage {
  private readonly textos = inject(ConteudoService);
  protected get conteudo() {
    return this.textos.pacote().comoFunciona;
  }
  protected readonly ilustracoes = ILUSTRACOES;
}
