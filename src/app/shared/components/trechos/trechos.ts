import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { Trecho } from '@app/content/content.types';
import { RichText } from '@app/shared/components/rich-text/rich-text';

@Component({
  selector: 'zas-trechos',
  imports: [RichText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-4' },
  template: `
    @for (trecho of normalizados(); track $index) {
      @if (trecho.paragrafo; as paragrafo) {
        <p class="max-w-prose text-base leading-relaxed text-zas-marinho/85 sm:text-lg">
          <zas-rich-text [texto]="paragrafo" />
        </p>
      }
      @if (trecho.lista; as itens) {
        <ul class="flex max-w-prose flex-col gap-3 text-base text-zas-marinho/85 sm:text-lg">
          @for (item of itens; track $index) {
            <li class="flex items-start gap-3 leading-relaxed">
              <span aria-hidden="true" class="mt-[0.6em] size-2.5 shrink-0 rounded-full bg-zas-amarelo-escuro"></span>
              <span><zas-rich-text [texto]="item" /></span>
            </li>
          }
        </ul>
      }
    }
  `,
})
export class Trechos {
  readonly trechos = input.required<Trecho[]>();

  protected readonly normalizados = computed(() =>
    this.trechos().map((trecho) => ({
      paragrafo: 'paragrafo' in trecho ? trecho.paragrafo : null,
      lista: 'lista' in trecho ? trecho.lista : null,
    })),
  );
}
