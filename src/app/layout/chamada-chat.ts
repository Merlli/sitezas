import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ConteudoService } from '@app/core/conteudo.service';

const CHAVE_FECHADA = 'zas-chamada-chat-fechada';
const ATRASO_MS = 1500;

/**
 * Balão "Fale com o ZAS" ao lado do botão do chat (public/chat/widget-channel.js).
 * Só aparece depois que o widget existe; some ao abrir o chat ou ao fechar o aviso, até o fim da visita.
 */
@Component({
  selector: 'zas-chamada-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    @if (visivel()) {
      <div
        class="chamada-chat fundo-claro fixed right-[5.75rem] bottom-6 z-[9999] flex max-w-[calc(100vw-7rem)] items-center gap-1 rounded-2xl bg-white py-2 pr-2 pl-2 text-zas-marinho shadow-[0_18px_40px_-14px_rgb(14_46_66/0.55)] ring-1 ring-zas-marinho/10"
      >
        <button
          type="button"
          class="flex flex-col items-start rounded-xl px-4 py-1.5 text-left hover:bg-zas-fundo"
          (click)="abrir()"
        >
          <span class="text-sm leading-tight text-zas-cinza">{{ ui.chatChamadaPergunta }}</span>
          <span class="text-base leading-tight font-extrabold">{{ ui.chatChamadaAcao }}</span>
        </button>
        <button
          type="button"
          class="inline-flex size-8 shrink-0 items-center justify-center self-start rounded-full text-zas-cinza hover:bg-zas-fundo hover:text-zas-marinho"
          [attr.aria-label]="ui.chatFecharChamada"
          (click)="fechar()"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" class="size-4">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              stroke-width="2.6"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <span
          aria-hidden="true"
          class="absolute top-1/2 -right-1.5 size-3 -translate-y-1/2 rotate-45 bg-white"
        ></span>
      </div>
    }
  `,
})
export class ChamadaChat {
  private readonly conteudo = inject(ConteudoService);
  protected get ui() {
    return this.conteudo.pacote().ui;
  }
  protected readonly visivel = signal(false);

  private readonly documento = inject(DOCUMENT);
  private observador?: MutationObserver;
  private temporizador?: ReturnType<typeof setTimeout>;
  private chamadaEncerrada = false;
  private personalizado = false;

  constructor() {
    effect(() => {
      const ui = this.conteudo.pacote().ui;
      const titulo = this.documento.querySelector('.zas-chat-titulo');
      if (titulo) titulo.textContent = ui.chatTitulo;
      const status = this.documento.querySelector('.zas-chat-status');
      if (status) status.textContent = ui.chatStatus;
      this.botaoDoChat()?.setAttribute('aria-label', ui.chatAbrir);
      this.documento.getElementById('channel-chat-container')?.setAttribute('aria-label', ui.chatTitulo);
    });
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    afterNextRender(() => {
      this.chamadaEncerrada = this.jaFechada();
      this.observador = new MutationObserver(() => this.verificar());
      this.observador.observe(this.documento.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
      });
      this.verificar();
    });
    inject(DestroyRef).onDestroy(() => {
      this.observador?.disconnect();
      clearTimeout(this.temporizador);
    });
  }

  protected abrir(): void {
    this.botaoDoChat()?.click();
  }

  protected fechar(): void {
    this.encerrar();
  }

  private verificar(): void {
    const botao = this.botaoDoChat();
    if (!botao) return;
    if (!this.personalizado) this.personalizar(botao);
    if (this.chamadaEncerrada) {
      this.observador?.disconnect();
      return;
    }
    if (this.documento.getElementById('channel-chat-container')?.classList.contains('show')) {
      this.encerrar();
      return;
    }
    if (!this.visivel() && !this.temporizador) {
      this.temporizador = setTimeout(() => this.visivel.set(true), ATRASO_MS);
    }
  }

  /** Identidade do ZAS no topo do chat: o título e a sessão do fornecedor ficam ocultos pelo CSS. */
  private personalizar(botao: HTMLElement): void {
    const cabecalho = this.documento.getElementById('channel-chat-header');
    if (!cabecalho) return;
    botao.setAttribute('aria-label', this.ui.chatAbrir);

    const identidade = this.documento.createElement('div');
    identidade.className = 'zas-chat-identidade';
    const logo = this.documento.createElement('img');
    logo.src = '/marca/zas-icone-app.webp';
    logo.alt = '';
    logo.width = 48;
    logo.height = 48;
    logo.className = 'zas-chat-logo';
    const textos = this.documento.createElement('div');
    const titulo = this.documento.createElement('p');
    titulo.className = 'zas-chat-titulo';
    titulo.textContent = this.ui.chatTitulo;
    const status = this.documento.createElement('p');
    status.className = 'zas-chat-status';
    status.textContent = this.ui.chatStatus;
    textos.append(titulo, status);
    identidade.append(logo, textos);
    cabecalho.prepend(identidade);

    const painel = this.documento.getElementById('channel-chat-container');
    painel?.setAttribute('role', 'dialog');
    painel?.setAttribute('aria-label', this.ui.chatTitulo);
    this.personalizado = true;
  }

  private encerrar(): void {
    this.visivel.set(false);
    this.chamadaEncerrada = true;
    this.observador?.disconnect();
    clearTimeout(this.temporizador);
    try {
      sessionStorage.setItem(CHAVE_FECHADA, '1');
    } catch {
      /* armazenamento indisponível: o aviso só volta se a página recarregar */
    }
  }

  private jaFechada(): boolean {
    try {
      return sessionStorage.getItem(CHAVE_FECHADA) === '1';
    } catch {
      return false;
    }
  }

  private botaoDoChat(): HTMLElement | null {
    return this.documento.getElementById('channel-chat-button');
  }
}
