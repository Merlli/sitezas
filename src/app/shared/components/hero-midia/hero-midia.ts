import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ConteudoService } from '@app/core/conteudo.service';
import type { Foto } from '@app/content/content.types';

const INTERVALO_MS = 6000;

/**
 * Fotos da equipe do ZAS que trocam sozinhas. Sem fotos, mostra a ilustração.
 * Troca automática tem botão de pausa (WCAG 2.2.2) e fica parada com "reduzir movimento".
 */
@Component({
  selector: 'zas-hero-midia',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block' },
  template: `
    @if (modo() === 'fundo') {
      <div class="relative size-full">
        <ng-container [ngTemplateOutlet]="fotosTpl" />
      </div>
    } @else {
      <div aria-hidden="true" class="absolute -top-6 -right-6 size-40 rounded-full bg-zas-amarelo/70 blur-0 sm:size-56"></div>
      <div aria-hidden="true" class="absolute -bottom-8 -left-6 size-32 rounded-full border-[14px] border-zas-claro/40 sm:size-44"></div>

      <div class="relative overflow-hidden rounded-[2rem] bg-zas-amarelo-fundo shadow-[0_24px_60px_-28px_rgb(0_48_87/0.45)]">
        @if (fotos().length) {
          <div class="relative aspect-[5/4]">
            <ng-container [ngTemplateOutlet]="fotosTpl" />
          </div>
        } @else {
          <img
            src="/ilustracoes/hero-zona-azul.svg"
            alt=""
            width="560"
            height="440"
            fetchpriority="high"
            class="block h-auto w-full"
          />
        }
      </div>
    }

    <ng-template #fotosTpl>
      @for (foto of fotos(); track foto.src; let i = $index) {
        <figure
          class="absolute inset-0 m-0 transition-opacity duration-700"
          [class.opacity-0]="i !== atual()"
          [attr.aria-hidden]="i !== atual()"
        >
          <img
            [src]="foto.src"
            [attr.srcset]="foto.versoes ? srcset(foto.versoes) : null"
            [attr.sizes]="foto.versoes ? tamanhos() : null"
            [alt]="foto.alt"
            [width]="foto.largura"
            [height]="foto.altura"
            [attr.loading]="i === 0 ? 'eager' : 'lazy'"
            [attr.fetchpriority]="i === 0 ? 'high' : null"
            class="size-full object-cover object-[var(--pos-cel)] lg:object-[var(--pos)]"
            [style.--pos]="foto.posicao ?? 'center'"
            [style.--pos-cel]="foto.posicaoCelular ?? foto.posicao ?? 'center'"
          />
          @if (foto.legenda) {
            <figcaption
              class="absolute right-4 bottom-4 left-4 rounded-2xl bg-white/90 px-4 py-3 text-base font-semibold text-zas-marinho backdrop-blur"
            >
              {{ foto.legenda }}
            </figcaption>
          }
        </figure>
      }
      @if (fotos().length > 1) {
        <button
          type="button"
          class="absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-full bg-white/90 text-zas-marinho shadow"
          [attr.aria-label]="pausado() ? ui.continuarFotos : ui.pausarFotos"
          [attr.aria-pressed]="pausado()"
          (click)="alternarPausa()"
        >
          @if (pausado()) {
            <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
          } @else {
            <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /></svg>
          }
        </button>
      }
    </ng-template>
  `,
})
export class HeroMidia {
  readonly fotos = input<Foto[]>([]);
  /** `cartao`: quadro arredondado ao lado do texto; `fundo`: ocupa todo o espaço do pai, de ponta a ponta. */
  readonly modo = input<'cartao' | 'fundo'>('cartao');

  private readonly conteudo = inject(ConteudoService);
  protected get ui() {
    return this.conteudo.pacote().ui;
  }
  /** No celular a moldura é mais alta que a foto panorâmica, então o corte pede uma imagem mais larga que a tela. */
  protected readonly tamanhos = computed(() =>
    this.modo() === 'fundo'
      ? '(min-width: 1024px) min(100vw, 88rem), (min-width: 640px) 134vw, 200vw'
      : '(min-width: 1024px) 40vw, 100vw',
  );
  protected readonly atual = signal(0);
  protected readonly pausado = signal(false);

  private temporizador?: ReturnType<typeof setInterval>;

  constructor() {
    const noNavegador = isPlatformBrowser(inject(PLATFORM_ID));
    afterNextRender(() => {
      if (!noNavegador || this.fotos().length < 2) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.pausado.set(true);
      this.iniciar();
    });
    inject(DestroyRef).onDestroy(() => clearInterval(this.temporizador));
  }

  protected srcset(versoes: Partial<Record<string, string>>): string {
    return Object.entries(versoes)
      .map(([largura, src]) => `${src} ${largura}w`)
      .join(', ');
  }

  protected alternarPausa(): void {
    this.pausado.update((p) => !p);
  }

  private iniciar(): void {
    this.temporizador = setInterval(() => {
      if (!this.pausado()) this.atual.update((i) => (i + 1) % this.fotos().length);
    }, INTERVALO_MS);
  }
}
