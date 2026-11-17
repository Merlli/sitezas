import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface Segmento {
  tipo: 'texto' | 'negrito' | 'link';
  valor: string;
}

const MARCACAO = /(\*\*[^*]+\*\*|https?:\/\/\S+)/g;

export function segmentar(texto: string): Segmento[] {
  return texto
    .split(MARCACAO)
    .filter((parte) => parte !== '')
    .map((parte) => {
      if (parte.startsWith('**') && parte.endsWith('**')) {
        return { tipo: 'negrito', valor: parte.slice(2, -2) };
      }
      if (/^https?:\/\//.test(parte)) {
        return { tipo: 'link', valor: parte };
      }
      return { tipo: 'texto', valor: parte };
    });
}

@Component({
  selector: 'zas-rich-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (s of segmentos(); track $index) {
    @switch (s.tipo) {
      @case ('negrito') {
        <strong class="font-bold text-zas-azul">{{ s.valor }}</strong>
      }
      @case ('link') {
        <a
          [href]="s.valor"
          class="break-all text-foreground underline underline-offset-4 hover:no-underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >{{ s.valor }}</a
        >
      }
      @default {
        {{ s.valor }}
      }
    }
  }`,
})
export class RichText {
  readonly texto = input.required<string>();
  protected readonly segmentos = computed(() => segmentar(this.texto()));
}
