import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ConteudoService } from '@app/core/conteudo.service';
import type { Foto } from '@app/content/content.types';

/** Altura das fotos (px) no celular, a partir de 640px e a partir de 1024px. Igual às classes h-44, sm:h-56 e lg:h-72. */
const ALTURAS = [176, 224, 288];
/** Cada faixa repete as fotos para cobrir telas largas sem deixar buraco no fim do ciclo. */
const REPETICOES = 2;
const DURACOES = ['75s', '90s'];

interface ItemFaixa {
  foto: Foto;
  srcset: string | null;
  tamanhos: string;
  /** Só a primeira aparição de cada foto é lida pelo leitor de tela. */
  descrita: boolean;
}

/**
 * Duas faixas de fotos que deslizam em sentidos opostos.
 * Tem botão de pausa (WCAG 2.2.2), para ao passar o mouse e fica parada com "reduzir movimento".
 */
@Component({
  selector: 'zas-faixas-fotos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block' },
  template: `
    <div class="faixas flex flex-col gap-3 sm:gap-4" [class.faixas-pausadas]="pausado()">
      @for (faixa of faixas(); track $index; let f = $index) {
        <div class="overflow-hidden">
          <div
            class="faixa-trilho flex w-max"
            [class.faixa-reversa]="f % 2 === 1"
            [style.--duracao]="duracoes[f % duracoes.length]"
          >
            @for (copia of copias; track copia) {
              <div class="flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4" [attr.aria-hidden]="copia > 0 || f > 0 ? 'true' : null">
                @for (item of faixa; track $index) {
                  <div
                    class="h-44 shrink-0 overflow-hidden rounded-xl bg-zas-fundo sm:h-56 sm:rounded-2xl lg:h-72"
                    [style.aspect-ratio]="item.foto.largura + ' / ' + item.foto.altura"
                  >
                    <img
                      [src]="item.foto.src"
                      [attr.srcset]="item.srcset"
                      [attr.sizes]="item.tamanhos"
                      [alt]="copia === 0 && item.descrita ? item.foto.alt : ''"
                      [width]="item.foto.largura"
                      [height]="item.foto.altura"
                      loading="lazy"
                      decoding="async"
                      class="size-full object-cover"
                    />
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>

    <button
      type="button"
      class="absolute bottom-4 left-4 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/90 text-zas-marinho shadow motion-reduce:hidden sm:bottom-6 sm:left-6"
      [attr.aria-label]="pausado() ? ui.continuarFotos : ui.pausarFotos"
      [attr.aria-pressed]="pausado()"
      (click)="pausado.set(!pausado())"
    >
      @if (pausado()) {
        <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
      } @else {
        <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /></svg>
      }
    </button>
  `,
})
export class FaixasFotos {
  readonly fotos = input<Foto[]>([]);

  private readonly conteudo = inject(ConteudoService);
  protected get ui() {
    return this.conteudo.pacote().ui;
  }
  protected readonly copias = [0, 1];
  protected readonly duracoes = DURACOES;
  protected readonly pausado = signal(false);

  /** A segunda faixa começa em outra foto, para a mesma foto não ficar alinhada nas duas. */
  protected readonly faixas = computed(() => {
    const itens = this.fotos().map((foto) => itemDaFaixa(foto));
    if (!itens.length) return [];
    const deslocamento = Math.floor(itens.length / 2);
    const segunda = [...itens.slice(deslocamento), ...itens.slice(0, deslocamento)];
    return [itens, segunda].map((base, f) =>
      Array.from({ length: REPETICOES }, (_, r) =>
        base.map((item) => ({ ...item, descrita: f === 0 && r === 0 })),
      ).flat(),
    );
  });
}

function itemDaFaixa(foto: Foto): ItemFaixa {
  const proporcao = foto.largura / foto.altura;
  const [celular, tablet, desktop] = ALTURAS.map((altura) => Math.round(altura * proporcao));
  return {
    foto,
    srcset: foto.versoes
      ? Object.entries(foto.versoes)
          .map(([largura, src]) => `${src} ${largura}w`)
          .join(', ')
      : null,
    tamanhos: `(min-width: 1024px) ${desktop}px, (min-width: 640px) ${tablet}px, ${celular}px`,
    descrita: false,
  };
}
