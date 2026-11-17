import type {
  ComoFuncionaConteudo,
  DuvidasConteudo,
  EstacioneAgoraConteudo,
  Fotos,
  HomeConteudo,
  InstitucionalConteudo,
  Links,
  NaoEncontradaConteudo,
  Navegacao,
  SeoPorPagina,
  Site,
  SuporteConteudo,
  TarifasERegrasConteudo,
  Trecho,
  Ui,
} from './content.types';
import enComoFuncionaJson from './en/como-funciona.json';
import enDuvidasJson from './en/duvidas.json';
import enEstacioneAgoraJson from './en/estacione-agora.json';
import enFotosJson from './en/fotos.json';
import enHomeJson from './en/home.json';
import enInstitucionalJson from './en/institucional.json';
import enLinksJson from './en/links.json';
import enNaoEncontradaJson from './en/nao-encontrada.json';
import enNavegacaoJson from './en/navegacao.json';
import enSeoJson from './en/seo.json';
import enSuporteJson from './en/suporte.json';
import enTarifasERegrasJson from './en/tarifas-e-regras.json';
import enUiJson from './en/ui.json';
import ptComoFuncionaJson from './como-funciona.json';
import ptDuvidasJson from './duvidas.json';
import ptEstacioneAgoraJson from './estacione-agora.json';
import ptFotosJson from './fotos.json';
import ptHomeJson from './home.json';
import ptInstitucionalJson from './institucional.json';
import ptLinksJson from './links.json';
import ptNaoEncontradaJson from './nao-encontrada.json';
import ptNavegacaoJson from './navegacao.json';
import ptSeoJson from './seo.json';
import ptSuporteJson from './suporte.json';
import ptTarifasERegrasJson from './tarifas-e-regras.json';
import ptUiJson from './ui.json';
import siteJson from './site.json';

export interface PacoteConteudo {
  site: Site;
  navegacao: Navegacao;
  links: Links;
  seo: SeoPorPagina;
  ui: Ui;
  home: HomeConteudo;
  comoFunciona: ComoFuncionaConteudo;
  estacioneAgora: EstacioneAgoraConteudo;
  tarifasERegras: TarifasERegrasConteudo;
  duvidas: DuvidasConteudo;
  suporte: SuporteConteudo;
  institucional: InstitucionalConteudo;
  naoEncontrada: NaoEncontradaConteudo;
  fotos: Fotos;
}

function pacote(
  navegacao: Navegacao,
  links: Links,
  seo: SeoPorPagina,
  ui: Ui,
  home: HomeConteudo,
  comoFunciona: ComoFuncionaConteudo,
  estacioneAgora: EstacioneAgoraConteudo,
  tarifasERegras: TarifasERegrasConteudo,
  duvidas: DuvidasConteudo,
  suporte: SuporteConteudo,
  institucional: InstitucionalConteudo,
  naoEncontrada: NaoEncontradaConteudo,
  fotos: Fotos,
): PacoteConteudo {
  return {
    site: siteJson,
    navegacao,
    links,
    seo,
    ui,
    home,
    comoFunciona,
    estacioneAgora,
    tarifasERegras,
    duvidas,
    suporte,
    institucional,
    naoEncontrada,
    fotos,
  };
}

/** Inglês é o idioma padrão do site. */
export const EN: PacoteConteudo = pacote(
  enNavegacaoJson,
  enLinksJson,
  enSeoJson,
  enUiJson,
  enHomeJson,
  enComoFuncionaJson,
  enEstacioneAgoraJson,
  enTarifasERegrasJson,
  enDuvidasJson,
  enSuporteJson,
  enInstitucionalJson,
  enNaoEncontradaJson,
  enFotosJson as Fotos,
);

export const PT: PacoteConteudo = pacote(
  ptNavegacaoJson,
  ptLinksJson,
  ptSeoJson,
  ptUiJson,
  ptHomeJson,
  ptComoFuncionaJson,
  ptEstacioneAgoraJson,
  ptTarifasERegrasJson,
  ptDuvidasJson,
  ptSuporteJson,
  ptInstitucionalJson,
  ptNaoEncontradaJson,
  ptFotosJson as Fotos,
);

export const SITE = EN.site;
export const NAVEGACAO = EN.navegacao;
export const LINKS = EN.links;
export const SEO = EN.seo;
export const UI = EN.ui;
export const HOME = EN.home;
export const COMO_FUNCIONA = EN.comoFunciona;
export const ESTACIONE_AGORA = EN.estacioneAgora;
export const TARIFAS_E_REGRAS = EN.tarifasERegras;
export const DUVIDAS = EN.duvidas;
export const SUPORTE = EN.suporte;
export const INSTITUCIONAL = EN.institucional;
export const NAO_ENCONTRADA = EN.naoEncontrada;
export const FOTOS = EN.fotos;

/** Marcador de conteúdo ainda não fornecido; o build de produção falha enquanto existir. */
export function estaPendente(valor: string): boolean {
  return valor.startsWith('[PENDENTE');
}

export function textoPlano(trechos: Trecho[]): string {
  return trechos
    .map((trecho) => ('paragrafo' in trecho ? trecho.paragrafo : trecho.lista.join('; ')))
    .join(' ')
    .replaceAll('**', '');
}
