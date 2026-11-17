import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConteudoService } from '@app/core/conteudo.service';
import { Lojas } from '@app/shared/components/lojas/lojas';
import { PageHeader } from '@app/shared/components/page-header/page-header';
import { Secao } from '@app/shared/components/secao/secao';
import { Trechos } from '@app/shared/components/trechos/trechos';
import { HlmButton } from '@spartan-ng/helm/button';

const TELAS = [
  '/ilustracoes/tela-0-cadastro.svg',
  '/ilustracoes/tela-1-veiculo.svg',
  '/ilustracoes/tela-2-regra.svg',
  '/ilustracoes/tela-pagamento.svg',
  '/ilustracoes/tela-3-resumo.svg',
  '/ilustracoes/tela-4-confirmacao.svg',
  '/ilustracoes/tela-5-vencimento.svg',
];

@Component({
  selector: 'zas-estacione-agora-page',
  imports: [PageHeader, Secao, Trechos, Lojas, HlmButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <zas-page-header [titulo]="conteudo.titulo" [cartao]="true">
      <div>
        <a hlmBtn size="xl" class="min-h-14 px-8 text-lg" [href]="links.pqmVirtual.url">{{
          links.pqmVirtual.rotulo
        }}</a>
      </div>
    </zas-page-header>

    <section aria-labelledby="antes-titulo" class="mx-auto max-w-6xl px-4 pt-12 sm:pt-16">
      <div class="entra flex flex-col gap-5 rounded-[2rem] bg-zas-amarelo-fundo p-6 sm:p-10">
        <h2 id="antes-titulo" class="text-2xl font-extrabold tracking-tight text-zas-azul sm:text-3xl">
          {{ conteudo.antesDeComecar.titulo }}
        </h2>
        <ul class="grid gap-4 sm:grid-cols-2">
          @for (item of conteudo.antesDeComecar.itens; track $index) {
            <li class="flex items-start gap-3 text-base leading-relaxed text-zas-marinho sm:text-lg">
              <svg aria-hidden="true" viewBox="0 0 24 24" class="mt-0.5 size-6 shrink-0">
                <circle cx="12" cy="12" r="11" class="fill-zas-azul" />
                <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#f2ec33" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ item }}
            </li>
          }
        </ul>
      </div>
    </section>

    <ol class="mx-auto flex max-w-6xl flex-col px-4 py-12 sm:py-16">
      @for (passo of conteudo.passos; track passo.rotulo; let ultimo = $last) {
        <li class="relative grid gap-8 pb-14 pl-16 sm:pl-20 md:grid-cols-[1fr_13rem] md:items-start lg:grid-cols-[1fr_14rem]">
          @if (!ultimo) {
            <span aria-hidden="true" class="absolute top-14 bottom-0 left-6 w-1 rounded-full bg-zas-bruma sm:left-7"></span>
          }
          <span
            aria-hidden="true"
            class="absolute top-0 left-0 inline-flex size-12 items-center justify-center rounded-full bg-zas-azul text-xl font-extrabold text-zas-amarelo shadow-md sm:size-14 sm:text-2xl"
          >
            {{ $index + 1 }}
          </span>
          <div class="flex flex-col gap-4 pt-1">
            <h2 class="flex flex-col gap-1 text-2xl font-extrabold tracking-tight text-zas-azul sm:text-3xl">
              <span class="text-sm font-bold tracking-widest text-zas-medio uppercase">
                {{ passo.rotulo }}
              </span>
              {{ passo.titulo }}
            </h2>
            <zas-trechos [trechos]="passo.trechos" />
            @if (passo.lojas) {
              <div class="mt-2 flex flex-wrap items-center gap-3">
                <zas-lojas />
                <a
                  [href]="links.versaoWeb.url"
                  class="inline-flex h-12 items-center gap-2.5 rounded-lg border-2 border-zas-marinho bg-white pr-4 pl-3 text-zas-marinho transition-transform hover:-translate-y-0.5 hover:bg-zas-fundo"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" class="size-6 shrink-0">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
                    <path
                      d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span class="flex flex-col gap-1 leading-none">
                    <span class="text-[0.6875rem] font-semibold">{{ links.versaoWeb.detalhe }}</span>
                    <span class="text-base font-bold">{{ links.versaoWeb.rotulo }}</span>
                  </span>
                </a>
              </div>
            }
          </div>
          <div aria-hidden="true" class="entra mx-auto w-full max-w-52 rounded-[2rem] bg-zas-fundo p-5 md:max-w-none">
            <img [src]="telas[$index]" alt="" width="260" height="520" loading="lazy" decoding="async" class="mx-auto h-auto w-full max-w-44" />
          </div>
        </li>
      }
    </ol>

    <zas-secao [id]="conteudo.semInternet.id" [titulo]="conteudo.semInternet.titulo" tom="fundo">
      <zas-trechos [trechos]="conteudo.semInternet.trechos" />
    </zas-secao>
  `,
})
export class EstacioneAgoraPage {
  private readonly textos = inject(ConteudoService);
  protected get conteudo() {
    return this.textos.pacote().estacioneAgora;
  }
  protected get links() {
    return this.textos.pacote().links;
  }
  protected readonly telas = TELAS;
}
