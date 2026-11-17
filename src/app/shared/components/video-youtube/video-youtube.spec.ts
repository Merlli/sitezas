import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from '@app/app.routes';
import { VideoYoutube } from './video-youtube';

describe('VideoYoutube', () => {
  it('mostra a capa e só carrega o YouTube depois do clique', async () => {
    await TestBed.configureTestingModule({
      imports: [VideoYoutube],
      providers: [provideRouter(routes)],
    }).compileComponents();
    const fixture = TestBed.createComponent(VideoYoutube);
    fixture.componentRef.setInput('videoId', 'dQw4w9WgXcQ');
    fixture.componentRef.setInput('titulo', 'Como ativar');
    fixture.detectChanges();
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('iframe')).toBeNull();
    const botao = el.querySelector('button');
    expect(botao?.getAttribute('aria-label')).toBe('Play video: Como ativar');
    expect(el.querySelector('img')?.getAttribute('src')).toBe(
      'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    );

    botao?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const iframe = el.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toContain(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1',
    );
    expect(iframe?.getAttribute('title')).toBe('Como ativar');
  });
});
