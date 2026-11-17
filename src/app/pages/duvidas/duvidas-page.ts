import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JsonLdService } from '@app/core/json-ld.service';
import { textoPlano } from '@app/content';
import { ConteudoService } from '@app/core/conteudo.service';
import { PageHeader } from '@app/shared/components/page-header/page-header';
import { Secao } from '@app/shared/components/secao/secao';
import { Trechos } from '@app/shared/components/trechos/trechos';
import { HlmButton } from '@spartan-ng/helm/button';

const ID_JSON_LD = 'faq';

@Component({
  selector: 'zas-duvidas-page',
  imports: [RouterLink, PageHeader, Secao, Trechos, HlmButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <zas-page-header [titulo]="conteudo.titulo">
      <div>
        <a
          hlmBtn
          size="xl"
          class="min-h-14 px-8 text-lg"
          [routerLink]="[]"
          [fragment]="conteudo.blocos[0].id"
        >
          {{ conteudo.cta }}
        </a>
      </div>
      <nav [attr.aria-label]="ui.indiceDuvidas">
        <ul class="flex flex-wrap gap-2">
          @for (bloco of conteudo.blocos; track bloco.id) {
            <li>
              <a
                [routerLink]="[]"
                [fragment]="bloco.id"
                class="inline-flex min-h-11 items-center rounded-full border border-zas-bruma bg-white px-4 text-sm font-semibold text-zas-azul transition-colors hover:border-zas-azul hover:bg-zas-fundo"
              >
                {{ bloco.titulo }}
              </a>
            </li>
          }
        </ul>
      </nav>
    </zas-page-header>

    @for (bloco of conteudo.blocos; track bloco.id; let par = $even) {
      <zas-secao [id]="bloco.id" [titulo]="bloco.titulo" [tom]="par ? 'claro' : 'fundo'">
        <div class="flex flex-col gap-3">
          @for (item of bloco.perguntas; track item.id) {
            <details
              [id]="item.id"
              class="group scroll-mt-28 rounded-2xl border border-border bg-white shadow-[0_10px_30px_-24px_rgb(0_48_87/0.5)] open:border-zas-bruma"
            >
              <summary
                class="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-base font-bold text-zas-azul sm:px-6 sm:text-lg [&::-webkit-details-marker]:hidden"
              >
                <span>{{ item.pergunta }}</span>
                <span
                  aria-hidden="true"
                  class="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-zas-fundo text-2xl leading-none text-zas-azul transition-transform group-open:rotate-45 group-open:bg-zas-amarelo motion-safe:duration-200"
                  >+</span
                >
              </summary>
              <div class="px-5 pb-6 sm:px-6">
                <zas-trechos [trechos]="item.resposta" />
              </div>
            </details>
          }
        </div>
      </zas-secao>
    }
  `,
})
export class DuvidasPage {
  private readonly textos = inject(ConteudoService);
  protected get conteudo() {
    return this.textos.pacote().duvidas;
  }
  protected get ui() {
    return this.textos.pacote().ui;
  }

  constructor() {
    const duvidas = this.conteudo;
    const jsonLd = inject(JsonLdService);
    jsonLd.definir(ID_JSON_LD, {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: duvidas.blocos.flatMap((bloco) =>
        bloco.perguntas.map((item) => ({
          '@type': 'Question',
          name: item.pergunta,
          acceptedAnswer: { '@type': 'Answer', text: textoPlano(item.resposta) },
        })),
      ),
    });
    inject(DestroyRef).onDestroy(() => jsonLd.remover(ID_JSON_LD));
  }
}
