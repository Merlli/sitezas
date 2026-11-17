import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { DUVIDAS, EN, LINKS, NAVEGACAO, PT, SEO, UI } from '@app/content';
import { HomePage } from '@app/pages/home/home-page';
import { segmentar } from '@app/shared/components/rich-text/rich-text';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('renderiza o skip link apontando para o conteúdo principal', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const skip = el.querySelector('a[href="#conteudo"]');
    expect(skip?.textContent?.trim()).toBe(UI.pularParaConteudo);
    expect(el.querySelector('main#conteudo')).not.toBeNull();
  });

  it('troca para português em /pt', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/pt');
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a[href="#conteudo"]')?.textContent?.trim()).toBe(PT.ui.pularParaConteudo);
    expect(el.querySelector('nav[aria-label="Idioma"] a[aria-current="true"]')?.textContent?.trim()).toBe('PT');
  });

  it('renderiza um link de navegação para cada item do menu', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll(`header nav[aria-label="${UI.navegacaoPrincipal}"] a`);
    expect(links.length).toBe(NAVEGACAO.principal.length);
  });
});

describe('Conteúdo', () => {
  it('inglês e português têm as mesmas perguntas', () => {
    const ids = (pacote: typeof EN) => pacote.duvidas.blocos.flatMap((bloco) => bloco.perguntas.map((item) => item.id));
    expect(ids(EN)).toEqual(ids(PT));
    expect(EN.navegacao.principal.map((item) => item.secao)).toEqual(
      PT.navegacao.principal.map((item) => item.secao),
    );
  });

  it('Dúvidas tem as 31 perguntas em 9 blocos, com ids únicos', () => {
    const perguntas = DUVIDAS.blocos.flatMap((bloco) => bloco.perguntas);
    expect(DUVIDAS.blocos.length).toBe(9);
    expect(perguntas.length).toBe(31);
    expect(new Set(perguntas.map((item) => item.id)).size).toBe(31);
  });

  it('o link de ativação e os das lojas são URLs https', () => {
    for (const link of [LINKS.pqmVirtual, LINKS.googlePlay, LINKS.appStore]) {
      expect(link.url.startsWith('https://')).toBe(true);
    }
  });
});

describe('segmentar', () => {
  it('separa negrito, link e texto sem perder caracteres', () => {
    const texto = '**Atenção:** veja https://exemplo.gov.br/rza agora';
    const segmentos = segmentar(texto);
    expect(segmentos.map((s) => s.tipo)).toEqual(['negrito', 'texto', 'link', 'texto']);
    expect(segmentos.map((s) => s.valor).join('')).toBe(texto.replaceAll('**', ''));
  });
});

function folhas(lista: typeof routes): typeof routes {
  return lista.flatMap((rota) => (rota.children ? folhas(rota.children) : [rota]));
}

describe('Rotas', () => {
  it('toda rota com página declara SEO definido', () => {
    for (const rota of folhas(routes).filter((item) => item.loadComponent)) {
      const pagina: unknown = rota.data?.['pagina'];
      expect(typeof pagina === 'string' && Object.hasOwn(SEO, pagina)).toBe(true);
    }
  });

  it('a página completa de cada item do menu existe', () => {
    const caminhos = routes.map((rota) => `/${rota.path ?? ''}`);
    for (const item of NAVEGACAO.principal.filter((i) => i.rota)) {
      expect(caminhos).toContain(item.rota);
    }
  });
});

describe('Home', () => {
  it('tem um bloco para cada item do menu, com título para receber o foco', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter(routes)],
    }).compileComponents();
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    for (const item of NAVEGACAO.principal) {
      expect(el.querySelector(`#${item.secao}`)).not.toBeNull();
      expect(el.querySelector(`#${item.secao}-titulo`)).not.toBeNull();
    }
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.querySelector('img[src="/fotos/hero-pelourinho-2048.webp"]')).not.toBeNull();
    expect(el.querySelector('zas-video-youtube')).toBeNull();
  });
});
