import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HeroMidia } from '@app/shared/components/hero-midia/hero-midia';

@Component({
  selector: 'zas-page-header',
  imports: [HeroMidia],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block overflow-hidden bg-gradient-to-b from-white to-zas-fundo' },
  template: `
    <div
      class="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-10 pb-12 sm:pt-14 sm:pb-16"
      [class]="ilustracao() || cartao() ? 'lg:grid-cols-[1.25fr_0.75fr]' : ''"
    >
      <div class="flex flex-col gap-6">
        <span aria-hidden="true" class="h-2 w-16 rounded-full bg-zas-amarelo"></span>
        <h1
          class="max-w-4xl text-[2.125rem] leading-[1.1] font-extrabold tracking-tight text-balance text-zas-azul sm:text-5xl"
        >
          {{ titulo() }}
        </h1>
        <ng-content />
      </div>
      @if (cartao()) {
        <zas-hero-midia class="mx-auto w-full max-w-md lg:max-w-none" />
      } @else if (ilustracao(); as src) {
        <img
          [src]="src"
          alt=""
          width="320"
          height="280"
          fetchpriority="high"
          class="mx-auto hidden h-auto w-full max-w-sm lg:block"
        />
      }
    </div>
  `,
})
export class PageHeader {
  readonly titulo = input.required<string>();
  readonly ilustracao = input<string>();
  /** Mostra o cartão ilustrado (operador, vaga e cronômetro). */
  readonly cartao = input(false);
}
