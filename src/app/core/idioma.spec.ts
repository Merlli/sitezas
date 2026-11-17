import { caminhoDoIdioma, ehPaginaInicial, idiomaDaUrl, prefixarCaminho } from './idioma';

describe('idioma', () => {
  it('trata a raiz como inglês e /pt como português', () => {
    expect(idiomaDaUrl('/')).toBe('en');
    expect(idiomaDaUrl('/estacione-agora')).toBe('en');
    expect(idiomaDaUrl('/pt')).toBe('pt');
    expect(idiomaDaUrl('/pt/duvidas#pagamento')).toBe('pt');
  });

  it('leva a mesma página para o outro idioma', () => {
    expect(caminhoDoIdioma('/estacione-agora#passo', 'pt')).toBe('/pt/estacione-agora#passo');
    expect(caminhoDoIdioma('/pt/duvidas', 'en')).toBe('/duvidas');
    expect(caminhoDoIdioma('/pt', 'en')).toBe('/');
    expect(prefixarCaminho('pt', '/')).toBe('/pt');
    expect(prefixarCaminho('en', 'https://app.zaszonaazul.com.br/')).toBe('https://app.zaszonaazul.com.br/');
  });

  it('reconhece a home nos dois idiomas', () => {
    expect(ehPaginaInicial('/')).toBe(true);
    expect(ehPaginaInicial('/pt')).toBe(true);
    expect(ehPaginaInicial('/pt/duvidas')).toBe(false);
  });
});
