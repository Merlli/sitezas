import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ConteudoService } from '@app/core/conteudo.service';

/**
 * Vídeo do YouTube no lugar de uma foto.
 * A capa aparece primeiro. O iframe só entra depois do clique, sem cookie até lá.
 */
@Component({
  selector: 'zas-video-youtube',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block size-full' },
  template: `
    @if (tocando()) {
      <iframe
        class="absolute inset-0 size-full"
        [src]="embed()"
        [title]="titulo()"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    } @else {
      <button
        type="button"
        class="group absolute inset-0 size-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-white"
        [attr.aria-label]="ui.reproduzirVideo + ': ' + titulo()"
        (click)="tocando.set(true)"
      >
        <img
          [src]="capa()"
          alt=""
          class="size-full object-cover"
          [attr.fetchpriority]="prioridade() ? 'high' : null"
          [attr.loading]="prioridade() ? 'eager' : 'lazy'"
          decoding="async"
        />
        <span
          aria-hidden="true"
          class="absolute inset-0 bg-zas-marinho/25 transition-colors group-hover:bg-zas-marinho/35"
        ></span>
        <span
          aria-hidden="true"
          class="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-zas-amarelo text-zas-marinho shadow-lg sm:size-20"
        >
          <svg viewBox="0 0 24 24" class="size-8 translate-x-0.5 sm:size-10">
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
        </span>
      </button>
    }
  `,
})
export class VideoYoutube {
  private readonly conteudo = inject(ConteudoService);
  protected get ui() {
    return this.conteudo.pacote().ui;
  }

  readonly videoId = input.required<string>();
  readonly titulo = input.required<string>();
  /** Capa do topo da home: carrega junto com o texto, porque pode ser a maior imagem da página. */
  readonly prioridade = input(false);

  protected readonly tocando = signal(false);
  protected readonly capa = computed(
    () => `https://i.ytimg.com/vi/${this.videoId()}/hqdefault.jpg`,
  );
  protected readonly embed = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${this.videoId()}?autoplay=1&rel=0`,
    ),
  );

  private readonly sanitizer = inject(DomSanitizer);
}
