import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { entrar, raiz } from './api.mjs';

// A duração dos eventos entra como "Variável", texto da página de tarifas.
// A home hoje diz "Conforme evento". A Mobparking ainda confirma o texto final.
// Está anotado no CHECKLIST-ENTREGA.md.

const UNICAS = [
  'site',
  'ui',
  'links',
  'home',
  'tabela_tarifas',
  'como_funciona',
  'estacione_agora',
  'tarifas_e_regras',
  'duvidas',
  'suporte',
  'institucional',
  'nao_encontrada',
  'navegacao',
  'fotos',
];
const LISTAS = ['secao', 'passo_ativacao', 'bloco_duvidas', 'pergunta', 'trecho', 'item_navegacao', 'seo', 'foto'];
const CONTEUDO = [...UNICAS, ...LISTAS];
const FRASE = 'SOBRESCREVER';

const { api } = await entrar();
await travar();

const site = ler('site.json');
const ui = ler('ui.json');
const links = ler('links.json');
const home = ler('home.json');
const como = ler('como-funciona.json');
const estacione = ler('estacione-agora.json');
const tarifas = ler('tarifas-e-regras.json');
const duvidas = ler('duvidas.json');
const suporte = ler('suporte.json');
const institucional = ler('institucional.json');
const naoEncontrada = ler('nao-encontrada.json');
const seo = ler('seo.json');
const navegacao = ler('navegacao.json');
const fotos = ler('fotos.json');

await gravarUnico('site', { nome: site.nome, url: site.url });
await gravarUnico('ui', ui);
await gravarUnico('links', {
  pqmRotulo: links.pqmVirtual.rotulo,
  pqmUrl: links.pqmVirtual.url,
  cadastroRotulo: links.cadastro.rotulo,
  cadastroUrl: links.cadastro.url,
  baixeRotulo: links.baixeOZas.rotulo,
  baixeUrl: links.baixeOZas.url,
  playRotulo: links.googlePlay.rotulo,
  playUrl: links.googlePlay.url,
  appleRotulo: links.appStore.rotulo,
  appleUrl: links.appStore.url,
  webDetalhe: links.versaoWeb.detalhe,
  webRotulo: links.versaoWeb.rotulo,
  webUrl: links.versaoWeb.url,
});
await gravarUnico('home', {
  principalTitulo: home.principal.titulo,
  principalSubtitulo: home.principal.subtitulo,
  ctaPrincipal: home.principal.ctaPrincipal,
  ctaSecundario: home.principal.ctaSecundario,
  oQueETitulo: home.oQueE.titulo,
  oQueEParagrafos: blocos(home.oQueE.paragrafos),
  chamadaLojas: home.oQueE.chamadaLojas,
  voceTitulo: home.voceEstacionou.titulo,
  vocePassos: blocos(home.voceEstacionou.passos),
  voceAcaoRotulo: home.voceEstacionou.acao.rotulo,
  voceAcaoRota: home.voceEstacionou.acao.rota,
  voceApoio: home.voceEstacionou.apoio,
  tarifasTitulo: home.tarifas.titulo,
  tarifasIntroducao: home.tarifas.introducao,
  tarifasAcaoRotulo: home.tarifas.acao.rotulo,
  tarifasAcaoRota: home.tarifas.acao.rota,
  fiscalTitulo: home.fiscalizacao.titulo,
  fiscalTexto: home.fiscalizacao.texto,
  instTitulo: home.institucional.titulo,
  instTexto: home.institucional.texto,
  operacaoRotulo: home.operacao.rotulo,
  operacaoTitulo: home.operacao.titulo,
  operacaoDestaque: home.operacao.destaque,
  operacaoPontos: home.operacao.pontos,
});
await gravarUnico('tabela_tarifas', {
  colunaRegra: tarifas.tabela.colunas.regra,
  colunaDuracao: tarifas.tabela.colunas.duracao,
  colunaValor: tarifas.tabela.colunas.valor,
  linhas: tarifas.tabela.linhas,
});
await gravarUnico('como_funciona', {
  titulo: como.titulo,
  introducao: blocos(como.introducao),
  destaqueTitulo: como.destaque.titulo,
  destaqueParagrafos: blocos(como.destaque.paragrafos),
});
const estacioneId = await gravarUnico('estacione_agora', {
  titulo: estacione.titulo,
  antesTitulo: estacione.antesDeComecar.titulo,
  antesItens: blocos(estacione.antesDeComecar.itens),
});
await gravarUnico('tarifas_e_regras', {
  titulo: tarifas.titulo,
  introducao: tarifas.introducao,
  atencao: tarifas.atencao,
});
const duvidasId = await gravarUnico('duvidas', { titulo: duvidas.titulo, cta: duvidas.cta });
await gravarUnico('suporte', suporte);
await gravarUnico('institucional', {
  titulo: institucional.titulo,
  paragrafos: blocos(institucional.paragrafos),
});
await gravarUnico('nao_encontrada', naoEncontrada);
const navId = await gravarUnico('navegacao', {});
const fotosId = await gravarUnico('fotos', {
  heroModo: fotos.hero.modo,
  heroYoutube: fotos.hero.youtube ?? null,
  heroVideoTitulo: fotos.hero.videoTitulo ?? null,
  operacaoModo: fotos.operacao.modo,
  operacaoYoutube: fotos.operacao.youtube ?? null,
  operacaoVideoTitulo: fotos.operacao.videoTitulo ?? null,
});
const comoId = (await api.get('/items/como_funciona')).data.id;

for (const [chave, ficha] of Object.entries(seo)) {
  await gravarId('seo', chave, { titulo: ficha.titulo, descricao: ficha.descricao });
}

for (const [i, item] of navegacao.principal.entries()) {
  await gravarId('item_navegacao', item.secao, {
    rotulo: item.rotulo,
    secao: item.secao,
    rota: item.rota ?? null,
    ordem: i + 1,
    menu: navId,
  });
}

for (const [i, secao] of como.secoes.entries()) {
  await gravarId('secao', secao.id, { titulo: secao.titulo, ordem: i + 1, pagina: comoId });
  await gravarTrechos(secao.id, secao.trechos, { secao: secao.id });
}

await gravarId('secao', estacione.semInternet.id, {
  titulo: estacione.semInternet.titulo,
  ordem: 1,
  pagina: null,
});
await gravarTrechos(estacione.semInternet.id, estacione.semInternet.trechos, {
  secao: estacione.semInternet.id,
});
await api.patch('/items/estacione_agora', { semInternet: estacione.semInternet.id });

for (const [i, passo] of estacione.passos.entries()) {
  const id = `passo-${i + 1}`;
  await gravarId('passo_ativacao', id, {
    rotulo: passo.rotulo,
    titulo: passo.titulo,
    lojas: Boolean(passo.lojas),
    ordem: i + 1,
    pagina: estacioneId,
  });
  await gravarTrechos(id, passo.trechos, { passo: id });
}

for (const [i, bloco] of duvidas.blocos.entries()) {
  await gravarId('bloco_duvidas', bloco.id, { titulo: bloco.titulo, ordem: i + 1, pagina: duvidasId });
  for (const [j, pergunta] of bloco.perguntas.entries()) {
    await gravarId('pergunta', pergunta.id, {
      pergunta: pergunta.pergunta,
      ordem: j + 1,
      bloco: bloco.id,
    });
    await gravarTrechos(pergunta.id, pergunta.resposta, { pergunta: pergunta.id });
  }
}

await gravarFotos(fotos.hero.fotos, 'hero', fotosId);
await gravarFotos(fotos.operacao.fotos, 'operacao', fotosId);

console.log('Conteúdo importado.');

async function travar() {
  const publicados = [];
  for (const collection of UNICAS) {
    const n = await contarUnico(collection);
    if (n > 0) publicados.push(`${collection}: ${n}`);
  }
  for (const collection of LISTAS) {
    const n = await contarLista(collection);
    if (n > 0) publicados.push(`${collection}: ${n}`);
  }
  const revisoes = await contarRevisoes();
  if (publicados.length === 0 && revisoes.length === 0) return;

  console.error('Já há conteúdo no painel.');
  if (publicados.length) {
    console.error('Publicado:');
    for (const linha of publicados) console.error(`- ${linha}`);
  }
  if (revisoes.length) {
    console.error('Revisões:');
    for (const linha of revisoes) console.error(`- ${linha}`);
  }
  if (!process.argv.includes('--forcar-sobrescrita')) {
    console.error('Importação abortada. Nada foi alterado.');
    console.error('Para repor o JSON por cima, rode de novo com --forcar-sobrescrita.');
    process.exit(1);
  }
  const rl = createInterface({ input: stdin, output: stdout });
  const resposta = await rl.question(`Digite ${FRASE} para repor o conteúdo publicado com o JSON: `);
  rl.close();
  if (resposta.trim() !== FRASE) {
    console.error('Confirmação não confere. Nada foi alterado.');
    process.exit(1);
  }
  console.log('Repondo o JSON por cima do conteúdo publicado.');
}

async function contarUnico(collection) {
  try {
    const res = await api.get(`/items/${collection}`);
    return res.data ? 1 : 0;
  } catch (erro) {
    if (erro.status === 404) return 0;
    throw erro;
  }
}

async function contarLista(collection) {
  const res = await api.get(`/items/${collection}?aggregate[count]=id`);
  return Number(res.data?.[0]?.count?.id ?? 0);
}

async function contarRevisoes() {
  const filtro = CONTEUDO.join(',');
  const res = await api.get(
    `/revisions?filter[collection][_in]=${filtro}&aggregate[count]=id&groupBy[]=collection&limit=-1`,
  );
  return (res.data ?? [])
    .map((linha) => ({ collection: linha.collection, n: Number(linha.count?.id ?? linha.count ?? 0) }))
    .filter((linha) => linha.n > 0)
    .map((linha) => `${linha.collection}: ${linha.n}`);
}

function ler(nome) {
  return JSON.parse(readFileSync(resolve(raiz, 'src/app/content', nome), 'utf8'));
}

function blocos(lista) {
  return lista.map((texto) => ({ texto }));
}

function montarVersoes(id, versoes, largura) {
  const cortes = versoes ? Object.keys(versoes) : [];
  const saida = {};
  for (const corte of cortes) {
    saida[corte] = `/assets/${id}?width=${corte}&format=webp&quality=80`;
  }
  if (Object.keys(saida).length === 0) {
    saida[String(largura)] = `/assets/${id}?width=${largura}&format=webp&quality=80`;
  }
  return saida;
}

async function gravarFotos(lista, grupo, fotosId) {
  for (const [i, foto] of lista.entries()) {
    const nome = foto.src.split('/').pop();
    const arquivo = await enviarFoto(resolve(raiz, 'public/fotos', nome));
    const largura = arquivo.width || foto.largura;
    const altura = arquivo.height || foto.altura;
    const cortes = montarVersoes(arquivo.id, foto.versoes, largura);
    const maior = String(Math.max(...Object.keys(cortes).map(Number)));
    await gravarChave('foto', `${grupo}-${i + 1}`, {
      arquivo: arquivo.id,
      alt: foto.alt,
      legenda: foto.legenda ?? null,
      posicao: foto.posicao ?? null,
      posicaoCelular: foto.posicaoCelular ?? null,
      grupo,
      ordem: i + 1,
      galeria: fotosId,
      largura,
      altura,
      versoes: cortes,
      src: cortes[maior],
    });
  }
}

async function gravarUnico(collection, dados) {
  try {
    const res = await api.get(`/items/${collection}`);
    if (res.data?.id) {
      await api.patch(`/items/${collection}`, dados);
      return res.data.id;
    }
  } catch (erro) {
    if (erro.status !== 404) throw erro;
  }
  const criado = await api.post(`/items/${collection}`, dados);
  return criado.data.id;
}

async function gravarId(collection, id, dados) {
  const caminho = `/items/${collection}/${encodeURIComponent(id)}`;
  try {
    await api.get(caminho);
    await api.patch(caminho, dados);
  } catch (erro) {
    if (erro.status !== 404) throw erro;
    await api.post(`/items/${collection}`, { id, ...dados });
  }
}

async function gravarChave(collection, chave, dados) {
  const achou = await api.get(
    `/items/${collection}?filter[chave][_eq]=${encodeURIComponent(chave)}&limit=1`,
  );
  const atual = achou.data?.[0];
  if (atual) {
    await api.patch(`/items/${collection}/${atual.id}`, { chave, ...dados });
    return atual.id;
  }
  const criado = await api.post(`/items/${collection}`, { chave, ...dados });
  return criado.data.id;
}

async function gravarTrechos(pai, lista, fk) {
  for (const [i, trecho] of lista.entries()) {
    const dados = {
      ordem: i + 1,
      secao: null,
      passo: null,
      pergunta: null,
      ...fk,
    };
    if ('paragrafo' in trecho) {
      dados.tipo = 'paragrafo';
      dados.paragrafo = trecho.paragrafo;
      dados.itens = [];
    } else {
      dados.tipo = 'lista';
      dados.paragrafo = null;
      dados.itens = trecho.lista.map((texto) => ({ texto }));
    }
    await gravarChave('trecho', `${pai}--${i + 1}`, dados);
  }
}

async function enviarFoto(caminho) {
  const nome = caminho.split('/').pop();
  const busca = await api.get(`/files?filter[filename_download][_eq]=${encodeURIComponent(nome)}&limit=1`);
  if (busca.data?.[0]) return busca.data[0];
  const bytes = readFileSync(caminho);
  const form = new FormData();
  form.append('title', nome.replace(/\.[^.]+$/, ''));
  form.append('file', new Blob([bytes], { type: 'image/webp' }), nome);
  const criado = await api.form('/files', form);
  return criado.data;
}
