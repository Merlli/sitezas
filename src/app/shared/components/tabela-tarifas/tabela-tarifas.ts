import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { TabelaTarifas as Tabela } from '@app/content/content.types';

/**
 * No celular cada linha vira um cartão (regra e duração à esquerda, valor à direita).
 * Os papéis ARIA explícitos mantêm a semântica de tabela quando o layout muda.
 */
@Component({
  selector: 'zas-tabela-tarifas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'block rounded-3xl border border-border bg-white p-2 shadow-[0_20px_50px_-30px_rgb(0_48_87/0.35)] sm:p-4',
  },
  template: `
    <table role="table" class="w-full border-collapse text-left" [attr.aria-labelledby]="rotuladoPor()">
      <thead role="rowgroup" class="sr-only sm:not-sr-only sm:table-header-group">
        <tr role="row" class="text-sm font-bold tracking-wider text-zas-cinza uppercase">
          <th role="columnheader" scope="col" class="px-4 py-3 font-bold">{{ tabela().colunas.regra }}</th>
          <th role="columnheader" scope="col" class="px-4 py-3 font-bold">{{ tabela().colunas.duracao }}</th>
          <th role="columnheader" scope="col" class="px-4 py-3 text-right font-bold">
            {{ tabela().colunas.valor }}
          </th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        @for (linha of tabela().linhas; track linha.regra) {
          <tr
            role="row"
            class="grid grid-cols-[1fr_auto] items-center gap-x-3 border-t border-border px-3 py-3 first:border-t-0 sm:table-row sm:p-0 sm:first:border-t"
          >
            <th
              role="rowheader"
              scope="row"
              class="text-lg leading-snug font-bold text-zas-marinho sm:px-4 sm:py-4"
            >
              {{ linha.regra }}
            </th>
            <td role="cell" class="col-start-1 row-start-2 text-base text-muted-foreground sm:px-4 sm:py-4">
              {{ linha.duracao }}
            </td>
            <td role="cell" class="col-start-2 row-span-2 row-start-1 text-right sm:px-4 sm:py-4">
              <span
                class="inline-block rounded-full bg-zas-fundo px-3 py-1 text-xl font-extrabold whitespace-nowrap text-zas-azul tabular-nums sm:text-2xl"
              >
                {{ linha.valor }}
              </span>
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class TabelaTarifas {
  readonly tabela = input.required<Tabela>();
  readonly rotuladoPor = input<string>();
}
