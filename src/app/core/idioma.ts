export type Idioma = 'en' | 'pt';

export const IDIOMA_PADRAO: Idioma = 'en';

export function idiomaDaUrl(url: string): Idioma {
  const caminho = url.split(/[?#]/)[0];
  return caminho === '/pt' || caminho.startsWith('/pt/') ? 'pt' : 'en';
}

/** Coloca ou tira o prefixo /pt. Endereço externo volta igual. */
export function prefixarCaminho(idioma: Idioma, caminho: string): string {
  if (!caminho.startsWith('/')) return caminho;
  const hash = caminho.includes('#') ? caminho.slice(caminho.indexOf('#')) : '';
  const semHash = caminho.split('#')[0] || '/';
  if (idioma === 'en') return `${semHash}${hash}`;
  const base = semHash === '/' ? '/pt' : `/pt${semHash}`;
  return `${base}${hash}`;
}

/** Mesma página no outro idioma, com a âncora atual. */
export function caminhoDoIdioma(urlAtual: string, alvo: Idioma): string {
  const hash = urlAtual.includes('#') ? urlAtual.slice(urlAtual.indexOf('#')) : '';
  const semHash = urlAtual.split('#')[0];
  const path = semHash.split('?')[0];
  const neutro = path === '/pt' ? '/' : path.startsWith('/pt/') ? path.slice(3) || '/' : path;
  return prefixarCaminho(alvo, neutro) + hash;
}

export function ehPaginaInicial(url: string): boolean {
  const caminho = url.split(/[?#]/)[0];
  return caminho === '/' || caminho === '/pt' || caminho === '/pt/';
}
