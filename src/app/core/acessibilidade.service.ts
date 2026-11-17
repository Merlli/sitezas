import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

const CHAVE = 'zas-acessibilidade';
const TAMANHOS = [100, 112, 125, 140] as const;

interface Preferencias {
  contraste: boolean;
  texto: number;
}

/** Barra de acessibilidade: alto contraste e tamanho do texto, lembrados no aparelho. */
@Injectable({ providedIn: 'root' })
export class AcessibilidadeService {
  private readonly documento = inject(DOCUMENT);
  private readonly noNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  readonly contraste = signal(false);
  readonly texto = signal<number>(100);
  readonly podeAumentar = () => this.texto() < TAMANHOS[TAMANHOS.length - 1];
  readonly podeDiminuir = () => this.texto() > TAMANHOS[0];

  constructor() {
    if (!this.noNavegador) return;
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? '{}') as Partial<Preferencias>;
      this.contraste.set(salvo.contraste === true);
      if (TAMANHOS.includes(salvo.texto as (typeof TAMANHOS)[number])) this.texto.set(salvo.texto!);
    } catch {
      /* preferências inválidas: mantém o padrão */
    }
  }

  alternarContraste(): void {
    this.contraste.update((ativo) => !ativo);
    this.aplicar();
  }

  aumentar(): void {
    const proximo = TAMANHOS.find((t) => t > this.texto());
    if (proximo) this.texto.set(proximo);
    this.aplicar();
  }

  diminuir(): void {
    const anterior = [...TAMANHOS].reverse().find((t) => t < this.texto());
    if (anterior) this.texto.set(anterior);
    this.aplicar();
  }

  private aplicar(): void {
    const raiz = this.documento.documentElement;
    raiz.classList.toggle('alto-contraste', this.contraste());
    raiz.style.setProperty('--tamanho-texto', `${this.texto()}%`);
    if (!this.noNavegador) return;
    try {
      const preferencias: Preferencias = { contraste: this.contraste(), texto: this.texto() };
      localStorage.setItem(CHAVE, JSON.stringify(preferencias));
    } catch {
      /* armazenamento indisponível: vale só nesta visita */
    }
  }
}
