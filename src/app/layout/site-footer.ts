import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConteudoService } from '@app/core/conteudo.service';
import { Lojas } from '@app/shared/components/lojas/lojas';

/** `altura` equilibra o peso visual: logos largos ficam mais baixos que os quadrados. */
const PARCEIROS_PUBLICOS = [
  { nome: 'Transalvador', src: '/marca/parceiros/transalvador.webp', largura: 542, altura: 'h-6 sm:h-7' },
  { nome: 'Zona Azul Digital', src: '/marca/parceiros/zona-azul-digital.webp', largura: 113, altura: 'h-8 sm:h-9' },
  { nome: 'Prefeitura de Salvador', src: '/marca/parceiros/prefeitura-salvador.webp', largura: 245, altura: 'h-7 sm:h-8' },
];

const EMPRESAS_PARCEIRAS = [
  { nome: 'MobParking', src: '/marca/parceiros/mobparking.webp', largura: 281 },
  { nome: 'EYSA', src: '/marca/parceiros/eysa.webp', largura: 458 },
];

@Component({
  selector: 'zas-site-footer',
  imports: [RouterLink, Lojas],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block bg-white' },
  template: `
    <footer class="px-4 pt-4 pb-6">
      <div class="mx-auto max-w-6xl">
        <div class="flex flex-col items-center gap-4 border-t border-border py-8 sm:flex-row sm:justify-center sm:gap-8">
          <p id="parceiros-titulo" class="text-xs font-bold tracking-widest text-zas-cinza uppercase">
            {{ ui.parceiros }}
          </p>
          <ul
            aria-labelledby="parceiros-titulo"
            class="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:gap-x-0 sm:divide-x sm:divide-border"
          >
            @for (parceiro of parceirosPublicos; track parceiro.nome) {
              <li class="sm:px-6 sm:first:pl-0 sm:last:pr-0">
                <img
                  [src]="parceiro.src"
                  [alt]="parceiro.nome"
                  [width]="parceiro.largura"
                  height="112"
                  loading="lazy"
                  class="w-auto"
                  [class]="parceiro.altura"
                />
              </li>
            }
          </ul>
        </div>

        <div
          class="fundo-escuro relative overflow-hidden rounded-[2.5rem] bg-zas-marinho px-6 py-12 text-white sm:px-12 sm:py-14"
        >
          <div aria-hidden="true" class="absolute -top-28 -right-24 size-72 rounded-full border-[26px] border-zas-amarelo/70"></div>
          <div class="relative grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div class="flex flex-col gap-8">
              <img
                src="/marca/zas-logo-fundo-escuro.webp"
                alt="ZAS — Zona Azul Salvador"
                width="480"
                height="157"
                loading="lazy"
                class="h-auto w-56 sm:w-64"
              />
              <zas-lojas />
            </div>

            <nav [attr.aria-label]="ui.navegacaoRodape">
              <ul class="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                @for (item of navegacao.principal; track item.secao) {
                  <li>
                    @if (item.rota) {
                      <a
                        [routerLink]="prefixar(item.rota!)"
                        class="inline-flex min-h-11 items-center rounded-lg text-lg font-semibold text-white/90 hover:text-zas-amarelo hover:underline"
                      >
                        {{ item.rotulo }}
                      </a>
                    } @else {
                      <a
                        [routerLink]="prefixar('/')"
                        [fragment]="item.secao"
                        class="inline-flex min-h-11 items-center rounded-lg text-lg font-semibold text-white/90 hover:text-zas-amarelo hover:underline"
                      >
                        {{ item.rotulo }}
                      </a>
                    }
                  </li>
                }
              </ul>
            </nav>
          </div>

          <div class="relative mt-12 flex flex-col gap-4 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-bold tracking-wider text-white/70 uppercase">{{ ui.empresasParceiras }}</p>
            <ul [attr.aria-label]="ui.empresasParceiras" class="flex flex-wrap items-center gap-8">
              @for (empresa of empresasParceiras; track empresa.nome) {
                <li>
                  <img
                    [src]="empresa.src"
                    [alt]="empresa.nome"
                    [width]="empresa.largura"
                    height="112"
                    loading="lazy"
                    class="h-9 w-auto"
                  />
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class SiteFooter {
  private readonly conteudo = inject(ConteudoService);
  protected get navegacao() {
    return this.conteudo.pacote().navegacao;
  }
  protected get ui() {
    return this.conteudo.pacote().ui;
  }
  protected prefixar(caminho: string): string {
    return this.conteudo.prefixar(caminho);
  }
  protected readonly parceirosPublicos = PARCEIROS_PUBLICOS;
  protected readonly empresasParceiras = EMPRESAS_PARCEIRAS;
}
