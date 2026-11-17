import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConteudoService } from '@app/core/conteudo.service';
import { PageHeader } from '@app/shared/components/page-header/page-header';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'zas-nao-encontrada-page',
  imports: [PageHeader, RouterLink, HlmButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <zas-page-header [titulo]="conteudo.titulo" ilustracao="/ilustracoes/passo-1-sinalizacao.svg">
      <div>
        <a hlmBtn size="xl" [routerLink]="prefixar('/')" class="min-h-14 px-8 text-lg">{{ ui.voltarInicio }}</a>
      </div>
    </zas-page-header>
  `,
})
export class NaoEncontradaPage {
  private readonly textos = inject(ConteudoService);
  protected get conteudo() {
    return this.textos.pacote().naoEncontrada;
  }
  protected get ui() {
    return this.textos.pacote().ui;
  }
  protected prefixar(caminho: string): string {
    return this.textos.prefixar(caminho);
  }
}
