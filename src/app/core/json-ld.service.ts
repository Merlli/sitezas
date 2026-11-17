import { DOCUMENT, Injectable, inject } from '@angular/core';

/** Dados estruturados (schema.org) no <head>, gerados no build para o Google ler sem JavaScript. */
@Injectable({ providedIn: 'root' })
export class JsonLdService {
  private readonly document = inject(DOCUMENT);

  definir(id: string, dados: Record<string, unknown>): void {
    let script = this.encontrar(id);
    if (!script) {
      script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-json-ld', id);
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(dados).replaceAll('<', '\\u003c');
  }

  remover(id: string): void {
    this.encontrar(id)?.remove();
  }

  private encontrar(id: string): HTMLScriptElement | null {
    return this.document.head.querySelector<HTMLScriptElement>(`script[data-json-ld="${id}"]`);
  }
}
