import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'zas-secao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
    '[class.bg-zas-fundo]': "tom() === 'fundo'",
    '[class.bg-white]': "tom() === 'claro'",
  },
  template: `
    <section [id]="id()" [attr.aria-labelledby]="id() + '-titulo'" class="scroll-mt-24">
      <div
        class="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:py-16 md:items-start"
        [class]="ilustracao() ? 'md:grid-cols-[1fr_15rem] lg:grid-cols-[1fr_18rem]' : ''"
      >
        <div class="flex min-w-0 flex-col gap-6">
          <h2
            [id]="id() + '-titulo'"
            tabindex="-1"
            class="text-2xl font-extrabold tracking-tight text-balance text-zas-azul sm:text-3xl"
          >
            {{ titulo() }}
          </h2>
          <ng-content />
        </div>
        @if (ilustracao(); as src) {
          <div
            aria-hidden="true"
            class="entra order-first mx-auto w-full max-w-64 rounded-[2rem] p-4 md:order-none md:max-w-none"
            [class.bg-zas-fundo]="tom() === 'claro'"
            [class.bg-white]="tom() === 'fundo'"
          >
            <img [src]="src" alt="" width="240" height="180" loading="lazy" decoding="async" class="h-auto w-full" />
          </div>
        }
      </div>
    </section>
  `,
})
export class Secao {
  readonly id = input.required<string>();
  readonly titulo = input.required<string>();
  readonly ilustracao = input<string>();
  readonly tom = input<'claro' | 'fundo'>('claro');
}
