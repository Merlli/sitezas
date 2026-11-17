export type PaginaId =
  | 'home'
  | 'comoFunciona'
  | 'estacioneAgora'
  | 'tarifasERegras'
  | 'duvidas'
  | 'suporte'
  | 'naoEncontrada';

export interface Site {
  nome: string;
  url: string;
}

export interface ItemNavegacao {
  rotulo: string;
  /** Bloco da Home para onde o menu rola. */
  secao: string;
  /** Página completa do assunto, quando existe. */
  rota?: string;
}

export interface Navegacao {
  principal: ItemNavegacao[];
}

export interface LinkExterno {
  rotulo: string;
  url: string;
}

export interface Links {
  pqmVirtual: LinkExterno;
  cadastro: LinkExterno;
  baixeOZas: LinkExterno;
  googlePlay: LinkExterno;
  appStore: LinkExterno;
  /** Versão web do app, para quem não quer instalar. */
  versaoWeb: LinkExterno & { detalhe: string };
}

export interface Seo {
  titulo: string;
  descricao: string;
}

export type SeoPorPagina = Record<PaginaId, Seo>;

export interface Ui {
  rotuloInicio: string;
  pularParaConteudo: string;
  navegacaoPrincipal: string;
  navegacaoRodape: string;
  voltarInicio: string;
  baixarNoGooglePlay: string;
  baixarNaAppStore: string;
  rotuloEmail: string;
  indiceDuvidas: string;
  acessibilidade: string;
  altoContraste: string;
  aumentarTexto: string;
  diminuirTexto: string;
  abrirMenu: string;
  fecharMenu: string;
  parceiros: string;
  empresasParceiras: string;
  pausarFotos: string;
  continuarFotos: string;
  chatChamadaPergunta: string;
  chatChamadaAcao: string;
  chatAbrir: string;
  chatFecharChamada: string;
  chatTitulo: string;
  chatStatus: string;
  idioma: string;
  ingles: string;
  portugues: string;
  reproduzirVideo: string;
}

/** Bloco de texto corrido: parágrafo ou lista. `**trecho**` vira negrito; URLs viram link. */
export type Trecho = { paragrafo: string } | { lista: string[] };

export interface AcaoInterna {
  rotulo: string;
  rota: string;
}

export interface LinhaTarifa {
  regra: string;
  duracao: string;
  valor: string;
}

export interface TabelaTarifas {
  colunas: { regra: string; duracao: string; valor: string };
  linhas: LinhaTarifa[];
}

export interface Secao {
  id: string;
  titulo: string;
  trechos: Trecho[];
}

export interface HomeConteudo {
  principal: {
    titulo: string;
    subtitulo: string;
    ctaPrincipal: string;
    ctaSecundario: string;
  };
  oQueE: { titulo: string; paragrafos: string[]; chamadaLojas: string };
  voceEstacionou: { titulo: string; passos: string[]; acao: AcaoInterna; apoio: string };
  tarifas: { titulo: string; introducao: string; tabela: TabelaTarifas; acao: AcaoInterna };
  fiscalizacao: { titulo: string; texto: string };
  institucional: { titulo: string; texto: string };
  operacao: {
    rotulo: string;
    titulo: string;
    destaque: string;
    pontos: { titulo: string; texto: string }[];
  };
}

export interface ComoFuncionaConteudo {
  titulo: string;
  introducao: string[];
  destaque: { titulo: string; paragrafos: string[] };
  secoes: Secao[];
}

export interface PassoAtivacao {
  rotulo: string;
  titulo: string;
  trechos: Trecho[];
  /** Mostra os selos do Google Play e da App Store abaixo do texto. */
  lojas?: boolean;
}

export interface EstacioneAgoraConteudo {
  titulo: string;
  antesDeComecar: { titulo: string; itens: string[] };
  passos: PassoAtivacao[];
  semInternet: Secao;
}

export interface TarifasERegrasConteudo {
  titulo: string;
  introducao: string;
  tabela: TabelaTarifas;
  atencao: string;
}

export interface Pergunta {
  id: string;
  pergunta: string;
  resposta: Trecho[];
}

export interface BlocoDuvidas {
  id: string;
  titulo: string;
  perguntas: Pergunta[];
}

export interface DuvidasConteudo {
  titulo: string;
  cta: string;
  blocos: BlocoDuvidas[];
}

export interface SuporteConteudo {
  titulo: string;
  email: string;
}

export interface InstitucionalConteudo {
  titulo: string;
  paragrafos: string[];
}

/** Foto em `public/fotos/` (WebP/AVIF). `legenda` é opcional e aparece sobre a foto. */
export interface Foto {
  src: string;
  alt: string;
  largura: number;
  altura: number;
  legenda?: string;
  /** Ponto da foto que fica sempre visível quando ela é cortada (CSS object-position), ex.: "60% 30%". */
  posicao?: string;
  /** Mesmo que `posicao`, só para telas pequenas (quando a foto fica mais estreita). */
  posicaoCelular?: string;
  /** Versões da mesma foto em outras larguras, para o navegador baixar só a necessária. Ex.: { "1024": "/fotos/x-1024.webp" }. */
  versoes?: Partial<Record<string, string>>;
}

/** O editor escolhe um dos dois. `video` troca as fotos por um vídeo do YouTube. */
export type ModoMidia = 'imagem' | 'video';

/**
 * Lugar do site que aceita fotos ou um vídeo do YouTube.
 * Em `imagem`, valem `fotos`. Em `video`, valem `youtube` e `videoTitulo`.
 * As fotos continuam guardadas quando o modo é vídeo.
 */
export interface BlocoMidia {
  modo: ModoMidia;
  /** Link do YouTube, ou só o código de 11 caracteres. */
  youtube?: string;
  /** Nome do vídeo, lido por quem não o vê. */
  videoTitulo?: string;
  fotos: Foto[];
}

export interface Fotos {
  /** Foto grande do topo da home. */
  hero: BlocoMidia;
  /** Faixa "Quem faz o ZAS acontecer". Sem fotos e sem vídeo, a faixa some. */
  operacao: BlocoMidia;
}

export interface NaoEncontradaConteudo {
  titulo: string;
}
