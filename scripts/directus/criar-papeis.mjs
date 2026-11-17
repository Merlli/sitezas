import { entrar } from './api.mjs';

const { api } = await entrar();

const papel = await garantir('/roles', { name: 'Editor', icon: 'edit', description: 'Edita o conteúdo do site. Não gerencia usuários.' });
const politica = await garantir('/policies', {
  name: 'Editor',
  icon: 'edit',
  admin_access: false,
  app_access: true,
});

const acessos = (await api.get('/access')).data;
if (!acessos.some((item) => item.role === papel.id && item.policy === politica.id)) {
  await api.post('/access', { role: papel.id, policy: politica.id, sort: 1 });
}

const permissoes = (await api.get('/permissions?limit=-1')).data.filter((item) => item.policy === politica.id);
for (const item of permissoes) await api.del(`/permissions/${item.id}`);

const soEdita = [
  'site',
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
  'seo',
  'secao',
  'passo_ativacao',
  'item_navegacao',
];
const editaECria = ['bloco_duvidas', 'pergunta', 'trecho', 'foto'];

const travados = {
  site: ['url'],
  home: ['voceAcaoRota', 'tarifasAcaoRota'],
  secao: ['id', 'pagina'],
  passo_ativacao: ['id', 'pagina'],
  bloco_duvidas: ['id'],
  pergunta: ['id'],
  item_navegacao: ['id', 'secao', 'rota', 'menu'],
  foto: ['chave', 'largura', 'altura', 'versoes', 'src', 'galeria'],
  seo: ['id'],
  estacione_agora: ['semInternet'],
  trecho: ['chave', 'secao', 'passo', 'pergunta'],
};

for (const collection of soEdita) {
  await permitir(collection, 'read', ['*']);
  await permitir(collection, 'update', await camposDeUpdate(collection));
}
for (const collection of editaECria) {
  await permitir(collection, 'read', ['*']);
  await permitir(collection, 'create', ['*']);
  await permitir(collection, 'update', await camposDeUpdate(collection));
  await permitir(collection, 'delete', ['*']);
}

for (const action of ['create', 'read', 'update', 'delete']) {
  await permitir('directus_files', action, ['*']);
  await permitir('directus_versions', action, ['*']);
}
await permitir('directus_revisions', 'read', ['*']);

await garantirFluxoBusca();
console.log('Papel Editor pronto. A ficha de rótulos da interface fica oculta para ele.');

async function garantir(caminho, corpo) {
  const lista = (await api.get(caminho)).data;
  const achou = lista.find((item) => item.name === corpo.name);
  if (achou) return achou;
  return (await api.post(caminho, corpo)).data;
}

async function camposDeUpdate(collection) {
  const campos = (await api.get(`/fields/${collection}`)).data.map((item) => item.field);
  const bloqueados = new Set(['id', ...(travados[collection] ?? [])]);
  return campos.filter((campo) => !bloqueados.has(campo));
}

async function permitir(collection, action, fields) {
  await api.post('/permissions', {
    policy: politica.id,
    collection,
    action,
    fields,
    permissions: null,
    validation: null,
  });
}

async function garantirFluxoBusca() {
  const fluxos = (await api.get('/flows')).data;
  if (fluxos.some((item) => item.name === 'Busca sem criar nem apagar')) return;
  const fluxo = (
    await api.post('/flows', {
      name: 'Busca sem criar nem apagar',
      icon: 'lock',
      status: 'active',
      accountability: 'all',
      trigger: 'event',
      options: {
        type: 'filter',
        scope: ['items.create', 'items.delete'],
        collections: ['seo'],
      },
    })
  ).data;
  const operacao = (
    await api.post('/operations', {
      flow: fluxo.id,
      key: 'bloquear',
      type: 'exec',
      position_x: 19,
      position_y: 1,
      options: {
        code: 'module.exports = function () { throw new Error("As páginas de busca são fixas. Não crie nem apague."); };',
      },
    })
  ).data;
  await api.patch(`/flows/${fluxo.id}`, { operation: operacao.id });
}
