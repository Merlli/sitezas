import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AcessibilidadeService } from '@app/core/acessibilidade.service';
import { ConteudoService } from '@app/core/conteudo.service';
import { ehPaginaInicial } from '@app/core/idioma';
import { SecaoAtualService } from '@app/core/secao-atual.service';
import { SeletorIdioma } from '@app/layout/seletor-idioma';
import { HlmButton } from '@spartan-ng/helm/button';
import { filter, map } from 'rxjs';

/** Barra de alto contraste e tamanho do texto: oculta por enquanto. Ao reativar, reative também o script em `index.html`. */
const BARRA_ACESSIBILIDADE_VISIVEL = false;

function ehHome(url: string): boolean {
  return ehPaginaInicial(url);
}

@Component({
  selector: 'zas-site-header',
  imports: [RouterLink, HlmButton, SeletorIdioma],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    @if (barraAcessibilidadeVisivel) {
      <div
        [attr.aria-label]="ui.acessibilidade"
        role="region"
        class="fundo-escuro bg-zas-marinho text-white"
      >
        <div class="mx-auto flex max-w-6xl items-center justify-end gap-1 px-3 py-1 sm:px-4">
          <button
            type="button"
            class="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold hover:bg-white/15"
            [attr.aria-pressed]="acessibilidade.contraste()"
            (click)="acessibilidade.alternarContraste()"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
              <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" />
            </svg>
            {{ ui.altoContraste }}
          </button>
          <button
            type="button"
            class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-sm font-bold hover:bg-white/15 disabled:opacity-40"
            [attr.aria-label]="ui.diminuirTexto"
            [disabled]="!acessibilidade.podeDiminuir()"
            (click)="acessibilidade.diminuir()"
          >
            A−
          </button>
          <button
            type="button"
            class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-base font-bold hover:bg-white/15 disabled:opacity-40"
            [attr.aria-label]="ui.aumentarTexto"
            [disabled]="!acessibilidade.podeAumentar()"
            (click)="acessibilidade.aumentar()"
          >
            A+
          </button>
        </div>
      </div>
    }

    <header class="fundo-escuro sticky top-0 z-40 bg-zas-marinho text-white">
      <div class="mx-auto flex h-16 max-w-7xl items-center gap-1.5 px-3 sm:gap-4 sm:px-4 xl:h-20">
        <a [routerLink]="prefixar('/')" [attr.aria-label]="ui.rotuloInicio" class="shrink-0 rounded-lg p-1">
          <img
            src="/marca/zas-logo-fundo-escuro.webp"
            alt=""
            width="480"
            height="157"
            class="h-7 w-auto sm:h-9 xl:h-11"
          />
        </a>

        <div class="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
        <nav [attr.aria-label]="ui.navegacaoPrincipal" class="hidden xl:block">
          <ul class="flex items-center gap-0.5">
            @for (item of navegacao.principal; track item.secao) {
              <li>
                <a
                  [routerLink]="prefixar('/')"
                  [fragment]="item.secao"
                  [attr.aria-current]="ativo(item.secao) ? 'true' : null"
                  class="relative inline-flex min-h-11 items-center rounded-full px-3 text-[0.9375rem] font-semibold whitespace-nowrap text-white/80 transition-colors hover:bg-white/10 hover:text-white aria-[current]:bg-white/15 aria-[current]:text-white"
                >
                  {{ item.rotulo }}
                </a>
              </li>
            }
          </ul>
        </nav>

        <div
          class="transition-[max-width,margin,opacity,visibility] duration-300 ease-out motion-reduce:transition-none"
          [class]="classeAtivar()"
        >
          <a
            hlmBtn
            variant="destaque"
            size="xl"
            class="min-h-11 px-3 text-sm sm:px-4 sm:text-base"
            [href]="links.pqmVirtual.url"
          >
            {{ links.pqmVirtual.rotulo }}
          </a>
        </div>

        <zas-seletor-idioma />

        <button
          #botaoMenu
          type="button"
          class="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/15 xl:hidden"
          [attr.aria-label]="ui.abrirMenu"
          aria-controls="menu-celular"
          [attr.aria-expanded]="menuAberto()"
          (click)="abrirMenu()"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" class="size-7">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
            />
          </svg>
        </button>
        </div>
      </div>
    </header>

    @if (menuAberto()) {
      <div
        #painel
        id="menu-celular"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="ui.navegacaoPrincipal"
        class="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white xl:hidden"
        (keydown.escape)="fecharMenu()"
        (keydown.tab)="prenderFoco($event)"
      >
        <div class="flex h-16 items-center justify-between border-b border-border px-3 sm:px-4">
          <img
            src="/marca/zas-logo.webp"
            alt=""
            width="320"
            height="104"
            class="h-7 w-auto sm:h-9"
          />
          <div class="flex items-center gap-1">
          <zas-seletor-idioma [claro]="true" />
          <button
            #botaoFechar
            type="button"
            class="inline-flex size-11 items-center justify-center rounded-full text-zas-marinho hover:bg-zas-fundo"
            [attr.aria-label]="ui.fecharMenu"
            (click)="fecharMenu()"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" class="size-7">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linecap="round"
              />
            </svg>
          </button>
          </div>
        </div>
        <nav [attr.aria-label]="ui.navegacaoPrincipal" class="flex-1 px-3 py-4 sm:px-4">
          <ul class="flex flex-col">
            @for (item of navegacao.principal; track item.secao) {
              <li class="border-b border-border/70">
                <a
                  [routerLink]="prefixar('/')"
                  [fragment]="item.secao"
                  (click)="fecharMenu(false)"
                  class="flex min-h-14 items-center justify-between rounded-xl px-3 text-xl font-bold text-zas-marinho hover:bg-zas-fundo"
                >
                  {{ item.rotulo }}
                  <svg aria-hidden="true" viewBox="0 0 24 24" class="size-6 text-zas-medio">
                    <path
                      d="M9 6l6 6-6 6"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </a>
              </li>
            }
          </ul>
        </nav>
        <div class="flex flex-col gap-3 border-t border-border bg-zas-fundo p-4">
          <a hlmBtn size="xl" class="w-full" [href]="links.pqmVirtual.url">{{
            links.pqmVirtual.rotulo
          }}</a>
        </div>
      </div>
    }
  `,
})
export class SiteHeader {
  private readonly conteudo = inject(ConteudoService);
  protected get navegacao() {
    return this.conteudo.pacote().navegacao;
  }
  protected get links() {
    return this.conteudo.pacote().links;
  }
  protected get ui() {
    return this.conteudo.pacote().ui;
  }
  protected prefixar(caminho: string): string {
    return this.conteudo.prefixar(caminho);
  }
  protected readonly barraAcessibilidadeVisivel = BARRA_ACESSIBILIDADE_VISIVEL;
  protected readonly acessibilidade = inject(AcessibilidadeService);

  private readonly documento = inject(DOCUMENT);
  private readonly secaoAtual = inject(SecaoAtualService);
  private readonly router = inject(Router);
  private readonly naHome = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map((evento) => ehHome(evento.urlAfterRedirects)),
    ),
    { initialValue: ehHome(this.router.url) },
  );

  protected readonly menuAberto = signal(false);
  private readonly botaoMenu = viewChild<ElementRef<HTMLButtonElement>>('botaoMenu');
  private readonly botaoFechar = viewChild<ElementRef<HTMLButtonElement>>('botaoFechar');
  private readonly painel = viewChild<ElementRef<HTMLElement>>('painel');

  constructor() {
    afterRenderEffect(() => {
      const aberto = this.menuAberto();
      this.documento.body.style.overflow = aberto ? 'hidden' : '';
      this.documento.body.classList.toggle('menu-aberto', aberto);
      if (aberto) this.botaoFechar()?.nativeElement.focus();
    });
  }

  protected readonly ocultarAtivar = computed(
    () => this.naHome() && this.secaoAtual.acoesInicioVisiveis(),
  );
  /** Escondido, o botão encolhe a zero para o menu ocupar o espaço, sem deixar buraco. */
  protected readonly classeAtivar = computed(() =>
    this.ocultarAtivar() ? 'invisible min-w-0 max-w-0 overflow-hidden opacity-0 xl:ml-0' : 'max-w-xs xl:ml-3',
  );

  protected ativo(secao: string): boolean {
    return this.naHome() && this.secaoAtual.secao() === secao;
  }

  protected abrirMenu(): void {
    this.menuAberto.set(true);
  }

  protected fecharMenu(devolverFoco = true): void {
    this.menuAberto.set(false);
    if (devolverFoco) queueMicrotask(() => this.botaoMenu()?.nativeElement.focus());
  }

  protected prenderFoco(evento: Event): void {
    const painel = this.painel()?.nativeElement;
    if (!painel) return;
    const focaveis = painel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    const teclado = evento as KeyboardEvent;
    if (teclado.shiftKey && this.documento.activeElement === primeiro) {
      teclado.preventDefault();
      ultimo.focus();
    } else if (!teclado.shiftKey && this.documento.activeElement === ultimo) {
      teclado.preventDefault();
      primeiro.focus();
    }
  }
}
