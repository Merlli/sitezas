import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { estaPendente } from '@app/content';
import { ConteudoService } from '@app/core/conteudo.service';
import { SecaoAtualService } from '@app/core/secao-atual.service';
import { fotosDoBloco, videoDoBloco } from '@app/content/midia';
import { FaixasFotos } from '@app/shared/components/faixas-fotos/faixas-fotos';
import { HeroMidia } from '@app/shared/components/hero-midia/hero-midia';
import { Lojas } from '@app/shared/components/lojas/lojas';
import { VideoYoutube } from '@app/shared/components/video-youtube/video-youtube';
import { TabelaTarifas } from '@app/shared/components/tabela-tarifas/tabela-tarifas';
import { HlmButton } from '@spartan-ng/helm/button';

const CENAS_DOS_PASSOS = [
  '/ilustracoes/passo-1-sinalizacao.svg',
  '/ilustracoes/passo-2-placa.svg',
  '/ilustracoes/passo-3-regra.svg',
  '/ilustracoes/passo-4-confirmacao.svg',
];

/** Ícones dos pontos da seção de operação, na mesma ordem do conteúdo: pessoas, local e cuidado. */
const ICONES_OPERACAO = [
  'M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M21 19v-1a4 4 0 0 0-3-3.87M15.5 4.13a3.5 3.5 0 0 1 0 6.74',
  'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5',
  'M19 14c1.5-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z',
];

/** Separa a última frase do parágrafo para que ela comece em linha nova no desktop, sem alterar o texto. */
function separarUltimaFrase(paragrafo: string): { inicio: string; fim: string } {
  const corte = paragrafo.lastIndexOf('. ', paragrafo.length - 2);
  if (corte < 0) return { inicio: '', fim: paragrafo };
  return { inicio: paragrafo.slice(0, corte + 2), fim: paragrafo.slice(corte + 2) };
}

function dividirTitulo(titulo: string): { pergunta: string; resposta: string } | null {
  const corte = titulo.indexOf('? ');
  if (corte < 0) return null;
  return { pergunta: titulo.slice(0, corte + 1), resposta: titulo.slice(corte + 2) };
}

@Component({
  selector: 'zas-home-page',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    HlmButton,
    Lojas,
    TabelaTarifas,
    HeroMidia,
    FaixasFotos,
    VideoYoutube,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Início -->
    @if (videoHero || fotosHero.length) {
      <section
        id="inicio"
        aria-labelledby="inicio-titulo"
        class="relative bg-white pt-8 sm:pt-12 lg:pt-16"
      >
        <div
          class="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-16"
        >
          <ng-container [ngTemplateOutlet]="tituloHero" />
          <div class="flex flex-col gap-6 lg:pb-2">
            <p class="text-lg leading-relaxed text-zas-marinho/75 sm:text-xl">
              {{ home.principal.subtitulo }}
            </p>
            <ng-container [ngTemplateOutlet]="acoesHero" />
          </div>
        </div>

        <div class="relative mx-auto mt-10 max-w-[88rem] px-3 sm:mt-12 sm:px-6 lg:mt-14">
          <div class="relative">
            <div
              class="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-zas-fundo sm:aspect-[16/8] sm:rounded-[2.25rem] lg:aspect-auto lg:h-[clamp(25rem,36vw,33rem)]"
            >
              @if (videoHero; as video) {
                <zas-video-youtube
                  [videoId]="video.id"
                  [titulo]="video.titulo"
                  [prioridade]="true"
                />
              } @else {
                <zas-hero-midia modo="fundo" [fotos]="fotosHero" class="zoom-lento size-full" />
              }
            </div>

            <div class="absolute top-1/2 left-10 hidden w-64 -translate-y-1/2 xl:block">
              <div class="surge" style="--atraso: 0.35s">
                <ng-container [ngTemplateOutlet]="cartaoApp" />
              </div>
            </div>
          </div>

          <div
            class="surge relative z-10 mx-auto -mt-8 max-w-sm px-3 sm:-mt-10 lg:absolute lg:top-8 lg:left-8 lg:mx-0 lg:mt-0 lg:px-0 xl:hidden"
            style="--atraso: 0.35s"
          >
            <div
              class="fundo-claro flutua-leve brilho mx-auto flex w-fit flex-col items-center gap-3 rounded-xl bg-white p-4 text-zas-marinho shadow-[0_24px_50px_-24px_rgb(14_46_66/0.45)] ring-1 ring-zas-marinho/5"
            >
              <div class="flex items-center gap-3">
                <span class="relative size-12 shrink-0">
                  <span
                    aria-hidden="true"
                    class="icone-chama-anel absolute inset-0 rounded-[22.5%] border-2 border-zas-amarelo opacity-0"
                  ></span>
                  <img
                    src="/marca/zas-icone-app.webp"
                    alt=""
                    width="192"
                    height="192"
                    class="icone-chama relative size-12 rounded-[22.5%] shadow-md"
                  />
                </span>
                <p class="text-lg leading-tight font-extrabold">{{ home.oQueE.chamadaLojas }}</p>
              </div>
              <!-- Largura fixa: o @container precisa dela para os selos ficarem lado a lado dentro de um cartão do tamanho do conteúdo. -->
              <div class="@container w-64">
                <zas-lojas [compacto]="true" class="justify-center" />
              </div>
            </div>
          </div>
        </div>

        <div
          class="surge relative z-10 mx-auto mt-6 max-w-5xl px-4 lg:-mt-14"
          style="--atraso: 0.2s"
        >
          <ul
            [attr.aria-label]="home.tarifas.titulo"
            class="grid grid-cols-3 overflow-hidden rounded-md bg-white text-zas-marinho sm:rounded-xl shadow-[0_24px_60px_-28px_rgb(14_46_66/0.5)] ring-1 ring-zas-marinho/8 lg:grid-cols-[repeat(3,1fr)_auto]"
          >
            @for (linha of tarifasRapidas; track linha.regra) {
              <li
                class="flex flex-col gap-0.5 border-l border-border px-4 py-4 first:border-l-0 sm:px-6 sm:py-5"
              >
                <span
                  class="hidden text-xs font-bold tracking-wider text-zas-cinza uppercase sm:block"
                  >{{ linha.regra }}</span
                >
                <span class="text-sm font-semibold text-zas-marinho/75 sm:text-base">{{
                  linha.duracao
                }}</span>
                <span
                  class="text-xl font-extrabold tracking-tight whitespace-nowrap tabular-nums sm:text-3xl"
                >
                  {{ linha.valor }}
                </span>
              </li>
            }
            <li class="col-span-3 border-t border-border lg:col-span-1 lg:border-t-0 lg:border-l">
              <a
                [routerLink]="prefixar(home.tarifas.acao.rota)"
                class="group flex h-full min-h-14 items-center justify-center gap-2 bg-zas-amarelo px-6 text-base font-bold text-zas-marinho transition-colors hover:bg-zas-amarelo-escuro"
              >
                {{ home.tarifas.acao.rotulo }}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  class="size-5 transition-transform group-hover:translate-x-1"
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </section>
    } @else {
      <section
        id="inicio"
        aria-labelledby="inicio-titulo"
        class="relative overflow-hidden bg-gradient-to-b from-white via-white to-zas-fundo"
      >
        <div
          class="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-8 pb-14 sm:pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-16 lg:pb-24"
        >
          <div class="flex max-w-xl flex-col gap-6">
            <ng-container [ngTemplateOutlet]="tituloHero" />
            <p class="text-lg leading-relaxed text-zas-marinho/75 sm:text-xl">
              {{ home.principal.subtitulo }}
            </p>
            <ng-container [ngTemplateOutlet]="acoesHero" />
          </div>
          <zas-hero-midia />
        </div>
      </section>
    }

    <ng-template #tituloHero>
      <div class="flex flex-col gap-5">
        <span aria-hidden="true" class="h-2 w-16 rounded-full bg-zas-amarelo"></span>
        <h1
          id="inicio-titulo"
          tabindex="-1"
          class="text-[2.25rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance text-zas-marinho sm:text-5xl lg:text-[3.75rem]"
        >
          @if (tituloEmPartes; as partes) {
            <span class="font-semibold text-zas-marinho">{{ partes.pergunta + ' ' }}</span
            ><span class="marca-texto">{{ partes.resposta }}</span>
          } @else {
            {{ home.principal.titulo }}
          }
        </h1>
      </div>
    </ng-template>

    <ng-template #acoesHero>
      <div id="inicio-acoes" class="flex flex-col gap-3 sm:flex-row">
        <a hlmBtn size="xl" class="min-h-14 px-8 text-lg" [href]="links.pqmVirtual.url">
          {{ home.principal.ctaPrincipal }}
        </a>
        @if (cadastroDisponivel) {
          <a
            hlmBtn
            variant="contorno"
            size="xl"
            class="min-h-14 px-8 text-lg text-zas-marinho"
            [href]="links.cadastro.url"
          >
            {{ home.principal.ctaSecundario }}
          </a>
        } @else {
          <a
            hlmBtn
            variant="contorno"
            size="xl"
            class="pointer-events-none min-h-14 px-8 text-lg text-zas-marinho opacity-45"
            aria-disabled="true"
          >
            {{ home.principal.ctaSecundario }}
          </a>
        }
      </div>
    </ng-template>

    <ng-template #cartaoApp>
      <div class="@container relative">
        <div
          aria-hidden="true"
          class="absolute -top-7 -right-7 size-24 rounded-full border-[12px] border-zas-amarelo @3xs:-top-12 @3xs:-right-12 @3xs:size-40 @3xs:border-[20px]"
        ></div>
        <div
          class="fundo-claro flutua relative rounded-xl bg-white p-2 text-zas-marinho shadow-[0_30px_60px_-20px_rgb(0_0_0/0.5)] @3xs:rounded-2xl @3xs:p-3"
        >
          <div class="flex items-center gap-2 px-1 pb-2 @3xs:gap-3 @3xs:pb-3">
            <img
              src="/marca/zas-icone-app.webp"
              alt=""
              width="192"
              height="192"
              class="size-9 shrink-0 rounded-[22.5%] shadow-md @3xs:size-14"
            />
            <p class="text-sm leading-tight font-extrabold @3xs:text-xl">
              {{ home.oQueE.chamadaLojas }}
            </p>
          </div>
          <div
            aria-hidden="true"
            class="relative h-40 overflow-hidden rounded-lg bg-zas-marinho @3xs:h-60 @3xs:rounded-xl"
          >
            <div
              class="absolute -top-10 -right-12 size-32 rounded-full border-[14px] border-zas-amarelo/90 @3xs:size-44 @3xs:border-[20px]"
            ></div>
            <div
              class="absolute -bottom-16 -left-10 size-32 rounded-full bg-white/5 @3xs:size-44"
            ></div>
            <img
              src="/ilustracoes/app-zas-inicio.svg"
              alt=""
              width="260"
              height="520"
              class="absolute top-4 left-1/2 w-24 -translate-x-1/2 rotate-[4deg] drop-shadow-[0_18px_24px_rgb(0_0_0/0.35)] @3xs:top-5 @3xs:w-36"
            />
          </div>
          <zas-lojas [compacto]="true" class="mt-2 px-0.5 @3xs:mt-3" />
        </div>
      </div>
    </ng-template>

    <!-- Você estacionou: 4 passos -->
    <section
      id="estacione-agora"
      aria-labelledby="estacione-agora-titulo"
      class="bg-white py-16 sm:py-24"
    >
      <div class="mx-auto flex max-w-6xl flex-col gap-12 px-4">
        <h2
          id="estacione-agora-titulo"
          tabindex="-1"
          class="entra mx-auto max-w-3xl text-center text-3xl font-extrabold tracking-tight text-balance text-zas-azul sm:text-4xl"
        >
          {{ home.voceEstacionou.titulo }}
        </h2>
        <ol class="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          @for (passo of home.voceEstacionou.passos; track $index) {
            <li class="entra relative flex flex-col items-center text-center">
              <span
                aria-hidden="true"
                class="absolute top-1 left-1 z-10 inline-flex size-12 items-center justify-center rounded-full bg-zas-azul text-xl font-extrabold text-zas-amarelo shadow-md"
              >
                {{ $index + 1 }}
              </span>
              <img
                [src]="cenas[$index]"
                alt=""
                width="320"
                height="280"
                loading="lazy"
                decoding="async"
                class="h-auto w-full max-w-80"
              />
              <p class="mt-3 max-w-64 text-lg leading-snug font-bold text-zas-marinho sm:text-xl">
                {{ passo }}
              </p>
            </li>
          }
        </ol>
        <div class="entra mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <p
            class="rounded-2xl bg-zas-amarelo-fundo px-5 py-4 text-base leading-relaxed text-zas-marinho sm:text-lg"
          >
            {{ home.voceEstacionou.apoio }}
          </p>
          <a
            hlmBtn
            variant="contorno"
            size="xl"
            class="text-zas-azul"
            [routerLink]="prefixar(home.voceEstacionou.acao.rota)"
          >
            {{ home.voceEstacionou.acao.rotulo }}
          </a>
        </div>
      </div>
    </section>

    <!-- Tarifas -->
    <section id="tarifas" aria-labelledby="tarifas-titulo" class="bg-zas-fundo py-16 sm:py-24">
      <div class="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div class="entra flex flex-col gap-5 lg:sticky lg:top-32">
          <span aria-hidden="true" class="h-2 w-16 rounded-full bg-zas-amarelo"></span>
          <h2
            id="tarifas-titulo"
            tabindex="-1"
            class="text-3xl font-extrabold tracking-tight text-zas-azul sm:text-5xl"
          >
            {{ home.tarifas.titulo }}
          </h2>
          <p class="text-lg leading-relaxed text-zas-marinho/80 sm:text-xl">
            {{ home.tarifas.introducao }}
          </p>
          <div>
            <a
              hlmBtn
              variant="contorno"
              size="xl"
              class="text-zas-azul"
              [routerLink]="prefixar(home.tarifas.acao.rota)"
            >
              {{ home.tarifas.acao.rotulo }}
            </a>
          </div>
        </div>
        <zas-tabela-tarifas
          class="entra"
          [tabela]="home.tarifas.tabela"
          rotuladoPor="tarifas-titulo"
        />
      </div>
    </section>

    <!-- Como funciona -->
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-titulo"
      class="bg-white py-16 sm:py-24"
    >
      <div class="mx-auto flex max-w-6xl flex-col gap-10 px-4">
        <h2
          id="como-funciona-titulo"
          tabindex="-1"
          class="entra max-w-3xl text-3xl font-extrabold tracking-tight text-balance text-zas-azul sm:text-4xl"
        >
          <a [routerLink]="prefixar('/como-funciona')" class="group inline rounded-lg hover:underline">
            {{ comoFunciona.titulo }}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              class="ml-1 inline size-8 align-[-0.2em] text-zas-medio transition-transform group-hover:translate-x-1"
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
        </h2>

        <div class="grid gap-6 lg:grid-cols-3">
          <article
            class="entra overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_20px_50px_-34px_rgb(0_48_87/0.45)] lg:col-span-2"
          >
            <div
              aria-hidden="true"
              class="flex items-center justify-center gap-2 bg-zas-amarelo-fundo px-4 py-6 sm:gap-6"
            >
              <img
                src="/ilustracoes/spot-credito.svg"
                alt=""
                width="240"
                height="180"
                loading="lazy"
                class="h-auto w-[42%] max-w-60"
              />
              <span class="text-5xl font-extrabold text-zas-azul sm:text-6xl">≠</span>
              <img
                src="/ilustracoes/spot-ativacao.svg"
                alt=""
                width="240"
                height="180"
                loading="lazy"
                class="h-auto w-[42%] max-w-60"
              />
            </div>
            <div class="flex flex-col gap-4 p-6 sm:p-8">
              <h3 class="text-2xl font-extrabold tracking-tight text-balance text-zas-azul">
                {{ comoFunciona.destaque.titulo }}
              </h3>
              @for (paragrafo of comoFunciona.destaque.paragrafos; track $index) {
                <p class="text-base leading-relaxed text-zas-marinho/85 sm:text-lg">
                  {{ paragrafo }}
                </p>
              }
            </div>
          </article>

          <article
            class="entra overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_20px_50px_-34px_rgb(0_48_87/0.45)]"
          >
            <div aria-hidden="true" class="flex items-center justify-center bg-zas-fundo px-4 py-6">
              <img
                src="/ilustracoes/spot-fiscalizacao.svg"
                alt=""
                width="240"
                height="180"
                loading="lazy"
                class="h-auto w-3/4 max-w-60"
              />
            </div>
            <div class="flex flex-col gap-4 p-6 sm:p-8">
              <h3 class="text-2xl font-extrabold tracking-tight text-zas-azul">
                {{ home.fiscalizacao.titulo }}
              </h3>
              <p class="text-base leading-relaxed text-zas-marinho/85 sm:text-lg">
                {{ home.fiscalizacao.texto }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Operação: fotos dos guardadores em movimento -->
    @if (videoOperacao || fotosOperacao.length) {
      <section
        id="operacao"
        aria-labelledby="operacao-titulo"
        class="overflow-hidden bg-white pb-16 sm:pb-24"
      >
        <div class="entra mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center">
          <p class="text-sm font-bold tracking-wider text-zas-medio uppercase">
            {{ home.operacao.rotulo }}
          </p>
          <h2
            id="operacao-titulo"
            tabindex="-1"
            class="text-3xl font-extrabold tracking-tight text-balance text-zas-azul sm:text-5xl"
          >
            {{ home.operacao.titulo }}
          </h2>
          <p class="text-xl font-bold text-balance text-zas-marinho sm:text-2xl">
            <span class="marca-texto">{{ home.operacao.destaque }}</span>
          </p>
        </div>
        <ul class="entra mx-auto mt-8 grid max-w-6xl gap-3 px-4 sm:mt-10 lg:grid-cols-3 lg:gap-6">
          @for (ponto of home.operacao.pontos; track $index) {
            <li class="flex items-start gap-4 rounded-2xl bg-zas-fundo p-5 sm:p-6">
              <span
                aria-hidden="true"
                class="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-zas-amarelo text-zas-azul"
              >
                <svg viewBox="0 0 24 24" class="size-6">
                  <path
                    [attr.d]="iconesOperacao[$index % iconesOperacao.length]"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <div class="flex flex-col gap-1">
                <h3 class="text-lg font-extrabold tracking-tight text-zas-azul">
                  {{ ponto.titulo }}
                </h3>
                <p class="text-base leading-relaxed text-pretty text-zas-marinho/80">
                  {{ ponto.texto }}
                </p>
              </div>
            </li>
          }
        </ul>
        @if (videoOperacao; as video) {
          <div class="mx-auto mt-10 max-w-6xl px-4 sm:mt-14">
            <div
              class="relative aspect-video overflow-hidden rounded-[1.75rem] bg-zas-marinho sm:rounded-[2rem]"
            >
              <zas-video-youtube [videoId]="video.id" [titulo]="video.titulo" />
            </div>
          </div>
        } @else {
          <zas-faixas-fotos [fotos]="fotosOperacao" class="mt-10 sm:mt-14" />
        }
        <ng-container [ngTemplateOutlet]="cartaoInstitucional" />
      </section>
    } @else {
      <div class="bg-white pb-16 sm:pb-24">
        <ng-container [ngTemplateOutlet]="cartaoInstitucional" />
      </div>
    }

    <ng-template #cartaoInstitucional>
      <div class="mx-auto mt-10 max-w-6xl px-4 sm:mt-14">
        <section
          id="institucional"
          aria-labelledby="institucional-titulo"
          class="entra grid gap-6 rounded-[2rem] border border-border p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:gap-10"
        >
          <div class="flex flex-col gap-4">
            <img
              src="/marca/zas-logo-sindguarda.webp"
              alt=""
              width="400"
              height="159"
              loading="lazy"
              class="h-12 w-auto self-start"
            />
            <h2
              id="institucional-titulo"
              tabindex="-1"
              class="text-2xl font-extrabold tracking-tight text-balance text-zas-azul sm:text-3xl"
            >
              {{ home.institucional.titulo }}
            </h2>
            <p class="text-base leading-relaxed text-pretty text-zas-marinho/85 sm:text-lg">
              {{ home.institucional.texto }}
            </p>
          </div>
          <div class="flex flex-col gap-3 rounded-2xl bg-zas-fundo p-5 sm:p-6">
            <svg aria-hidden="true" viewBox="0 0 24 24" class="size-8 text-zas-azul">
              <path
                d="M12 3l8 4v2H4V7zM5 9v8M9.5 9v8M14.5 9v8M19 9v8M3 20h18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            @for (paragrafo of institucional.paragrafos; track $index) {
              <p class="text-base leading-relaxed text-pretty text-zas-marinho/85">
                {{ paragrafo }}
              </p>
            }
          </div>
        </section>
      </div>
    </ng-template>

    <!-- Baixe o ZAS -->
    <section
      id="baixe-o-zas"
      aria-labelledby="baixe-o-zas-titulo"
      class="bg-white px-4 pb-16 sm:pb-24"
    >
      <div
        class="fundo-escuro entra relative mx-auto grid max-w-6xl items-center gap-10 overflow-hidden rounded-[2.5rem] bg-zas-marinho px-6 py-12 text-white sm:px-12 lg:grid-cols-[1.2fr_0.8fr] lg:py-16"
      >
        <div
          aria-hidden="true"
          class="absolute -top-24 -right-24 hidden size-72 rounded-full border-[28px] border-zas-amarelo/80 lg:block"
        ></div>
        <div
          aria-hidden="true"
          class="absolute -bottom-32 left-1/3 size-80 rounded-full bg-white/5"
        ></div>
        <div class="relative flex flex-col gap-6">
          <h2
            id="baixe-o-zas-titulo"
            tabindex="-1"
            class="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
          >
            {{ home.oQueE.titulo }}
          </h2>
          @for (paragrafo of oQueEParagrafos; track $index) {
            <p class="max-w-xl text-lg leading-relaxed text-white/85">
              {{ paragrafo.inicio }}<br class="hidden md:inline" />{{ paragrafo.fim }}
            </p>
          }
          <div class="flex flex-col gap-3">
            <p class="text-lg font-bold text-zas-amarelo">{{ home.oQueE.chamadaLojas }}</p>
            <zas-lojas />
          </div>
        </div>
        <div class="relative flex justify-center">
          <img
            src="/ilustracoes/app-zas-inicio.svg"
            alt=""
            width="260"
            height="520"
            loading="lazy"
            class="h-auto w-56 drop-shadow-[0_30px_40px_rgb(0_0_0/0.35)] sm:w-64 lg:-mb-28 lg:rotate-[4deg]"
          />
        </div>
      </div>
    </section>

    <!-- Dúvidas -->
    <section id="duvidas" aria-labelledby="duvidas-titulo" class="bg-zas-fundo py-16 sm:py-24">
      <div class="mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 text-center">
        <h2
          id="duvidas-titulo"
          tabindex="-1"
          class="entra text-3xl font-extrabold tracking-tight text-balance text-zas-azul sm:text-4xl"
        >
          {{ duvidas.titulo }}
        </h2>
        <ul class="entra flex flex-wrap justify-center gap-2 sm:gap-3">
          @for (bloco of duvidas.blocos; track bloco.id) {
            <li>
              <a
                [routerLink]="prefixar('/duvidas')"
                [fragment]="bloco.id"
                class="inline-flex min-h-11 items-center rounded-full border border-zas-bruma bg-white px-4 text-base font-semibold text-zas-azul transition-colors hover:border-zas-medio hover:bg-zas-amarelo-fundo"
              >
                {{ bloco.titulo }}
              </a>
            </li>
          }
        </ul>
        <a hlmBtn size="xl" class="entra min-h-14 px-8 text-lg" [routerLink]="prefixar('/duvidas')">
          {{ duvidas.cta }}
        </a>
      </div>
    </section>

    <!-- Suporte -->
    <div class="bg-white py-16 sm:py-24">
      <div class="mx-auto max-w-6xl px-4">
        <section
          id="suporte"
          aria-labelledby="suporte-titulo"
          class="entra flex flex-col justify-between gap-6 rounded-[2rem] bg-zas-amarelo p-6 text-zas-marinho sm:p-10 lg:flex-row lg:items-center"
        >
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <svg aria-hidden="true" viewBox="0 0 48 48" class="size-14">
              <rect x="4" y="10" width="40" height="28" rx="6" fill="#0e2e42" />
              <path
                d="M8 15l16 11 16-11"
                fill="none"
                stroke="#f2ec33"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <h2
              id="suporte-titulo"
              tabindex="-1"
              class="text-2xl font-extrabold tracking-tight sm:text-3xl"
            >
              {{ suporte.titulo }}
            </h2>
          </div>
          <p class="flex flex-col gap-1">
            <span class="text-sm font-bold tracking-wider uppercase">{{ ui.rotuloEmail }}</span>
            <a
              [href]="'mailto:' + suporte.email"
              class="text-lg font-extrabold break-all underline decoration-2 underline-offset-4 sm:text-xl"
            >
              {{ suporte.email }}
            </a>
          </p>
        </section>
      </div>
    </div>
  `,
})
export class HomePage {
  private readonly conteudo = inject(ConteudoService);
  protected get home() {
    return this.conteudo.pacote().home;
  }
  protected get comoFunciona() {
    return this.conteudo.pacote().comoFunciona;
  }
  protected get duvidas() {
    return this.conteudo.pacote().duvidas;
  }
  protected get suporte() {
    return this.conteudo.pacote().suporte;
  }
  protected get institucional() {
    return this.conteudo.pacote().institucional;
  }
  protected get fotos() {
    return this.conteudo.pacote().fotos;
  }
  protected get videoHero() {
    return videoDoBloco(this.fotos.hero);
  }
  protected get fotosHero() {
    return fotosDoBloco(this.fotos.hero);
  }
  protected get videoOperacao() {
    return videoDoBloco(this.fotos.operacao);
  }
  protected get fotosOperacao() {
    return fotosDoBloco(this.fotos.operacao);
  }
  protected get links() {
    return this.conteudo.pacote().links;
  }
  protected get ui() {
    return this.conteudo.pacote().ui;
  }
  protected readonly cenas = CENAS_DOS_PASSOS;
  protected readonly iconesOperacao = ICONES_OPERACAO;
  protected get cadastroDisponivel() {
    return !estaPendente(this.links.cadastro.url);
  }
  protected get oQueEParagrafos() {
    return this.home.oQueE.paragrafos.map(separarUltimaFrase);
  }
  protected get tarifasRapidas() {
    return this.home.tarifas.tabela.linhas.slice(0, 3);
  }
  /** Separa a pergunta da resposta no título para destacar a resposta, sem alterar o texto. */
  protected get tituloEmPartes() {
    return dividirTitulo(this.home.principal.titulo);
  }
  protected prefixar(caminho: string): string {
    return this.conteudo.prefixar(caminho);
  }

  constructor() {
    const secaoAtual = inject(SecaoAtualService);
    afterNextRender(() =>
      secaoAtual.observar(
        this.conteudo.pacote().navegacao.principal.map((item) => item.secao),
        'inicio-acoes',
      ),
    );
    inject(DestroyRef).onDestroy(() => secaoAtual.parar());
  }
}
