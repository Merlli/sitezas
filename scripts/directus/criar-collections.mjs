import { entrar } from './api.mjs';

const PASTA = 'conteudo_zas';

function rotulos(nome) {
  return [
    { language: 'pt-BR', translation: nome },
    { language: 'en-US', translation: nome },
  ];
}

function texto(field, nome, ajuda, { limite = 180, obrigatorio = true, grupo = null } = {}) {
  const longo = limite > 255;
  return {
    field,
    type: longo ? 'text' : 'string',
    meta: {
      interface: limite > 120 ? 'input-multiline' : 'input',
      required: obrigatorio,
      note: ajuda,
      width: 'full',
      group: grupo,
      translations: rotulos(nome),
      options: { trim: true },
    },
    schema: {
      is_nullable: !obrigatorio,
      ...(longo ? {} : { max_length: limite }),
    },
  };
}

function lista(field, nome, ajuda, { grupo = null, obrigatorio = true, oculto = false } = {}) {
  return {
    field,
    type: 'json',
    meta: {
      interface: 'list',
      special: ['cast-json'],
      required: obrigatorio,
      hidden: oculto,
      note: ajuda,
      width: 'full',
      group: grupo,
      translations: rotulos(nome),
      options: {
        template: '{{texto}}',
        fields: [
          {
            field: 'texto',
            name: 'Texto',
            type: 'string',
            meta: {
              interface: 'input-multiline',
              required: true,
              width: 'full',
              note: 'Para negrito, escreva **assim**. Um endereço http ou https vira link.',
              options: { trim: true },
            },
          },
        ],
      },
    },
    schema: { is_nullable: !obrigatorio },
  };
}

function fk(field, type) {
  return {
    field,
    type,
    meta: { hidden: true, interface: 'input', translations: rotulos(field) },
    schema: { is_nullable: true, ...(type === 'string' ? { max_length: 80 } : {}) },
  };
}

function ordem() {
  return {
    field: 'ordem',
    type: 'integer',
    meta: { interface: 'input', hidden: true, translations: rotulos('Ordem'), note: 'Posição na página.' },
    schema: { is_nullable: true },
  };
}

function grupo(field, nome) {
  return {
    field,
    type: 'alias',
    meta: {
      interface: 'group-detail',
      special: ['alias', 'no-data', 'group'],
      translations: rotulos(nome),
      width: 'full',
    },
  };
}

const YOUTUBE =
  '^(https?:\\/\\/)?(www\\.|m\\.)?(youtube\\.com\\/watch\\?([^\\s#]*&)?v=|youtu\\.be\\/|youtube\\.com\\/(embed|shorts|live)\\/|youtube-nocookie\\.com\\/embed\\/)[A-Za-z0-9_-]{11}([?&#][^\\s]*)?$|^[A-Za-z0-9_-]{11}$';

function modoMidia(field, nome, ajuda, grupoCampo) {
  return {
    field,
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      required: true,
      width: 'full',
      group: grupoCampo,
      note: ajuda,
      translations: rotulos(nome),
      options: {
        choices: [
          { value: 'imagem', text: 'Imagem' },
          { value: 'video', text: 'Vídeo do YouTube' },
        ],
      },
    },
    schema: { is_nullable: false, max_length: 20, default_value: 'imagem' },
  };
}

function campoYoutube(field, nome, modo, grupoCampo) {
  return {
    field,
    type: 'string',
    meta: {
      interface: 'input',
      required: false,
      hidden: true,
      width: 'full',
      group: grupoCampo,
      note: 'Cole o link do YouTube. Exemplo: https://www.youtube.com/watch?v=…',
      translations: rotulos(nome),
      options: { trim: true, placeholder: 'https://www.youtube.com/watch?v=…' },
      validation: {
        _or: [
          { [field]: { _null: true } },
          { [field]: { _empty: true } },
          { [field]: { _regex: YOUTUBE } },
        ],
      },
      validation_message: 'Cole um link do YouTube, ou só o código de 11 caracteres do vídeo.',
      conditions: [
        {
          name: 'Quando é vídeo',
          rule: { _and: [{ [modo]: { _eq: 'video' } }] },
          hidden: false,
          required: true,
        },
      ],
    },
    schema: { is_nullable: true, max_length: 300 },
  };
}

function tituloVideo(field, modo, grupoCampo) {
  const campo = texto('videoTitulo', 'Título do vídeo', 'Nome do vídeo, para quem não o vê.', {
    limite: 180,
    obrigatorio: false,
    grupo: grupoCampo,
  });
  campo.field = field;
  campo.meta.hidden = true;
  campo.meta.conditions = [
    {
      name: 'Quando é vídeo',
      rule: { _and: [{ [modo]: { _eq: 'video' } }] },
      hidden: false,
      required: true,
    },
  ];
  return campo;
}

function numeroSomenteLeitura(field, nome, ajuda) {
  return {
    field,
    type: 'integer',
    meta: {
      interface: 'input',
      readonly: true,
      hidden: true,
      note: ajuda,
      translations: rotulos(nome),
    },
    schema: { is_nullable: true },
  };
}

function idTexto(ajuda) {
  return {
    field: 'id',
    type: 'string',
    meta: {
      interface: 'input',
      required: true,
      width: 'half',
      note: ajuda,
      translations: rotulos('Identificador'),
      options: { trim: true },
    },
    schema: { is_primary_key: true, has_auto_increment: false, is_nullable: false, max_length: 80 },
  };
}

function ficha(nome, nota, ordemPainel, extra = {}) {
  return {
    icon: extra.singleton ? 'article' : 'list',
    note: nota,
    singleton: Boolean(extra.singleton),
    versioning: true,
    accountability: 'all',
    group: PASTA,
    translations: rotulos(nome),
    display_template: extra.modelo ?? null,
    sort: ordemPainel,
  };
}

const paragrafo = texto(
  'paragrafo',
  'Parágrafo',
  'Para negrito, escreva **assim**. Um endereço http ou https vira link.',
  { limite: 1200, obrigatorio: false },
);
paragrafo.meta.hidden = true;
paragrafo.meta.conditions = [
  {
    name: 'Quando é parágrafo',
    rule: { _and: [{ tipo: { _eq: 'paragrafo' } }] },
    hidden: false,
    required: true,
  },
];

const itens = lista('itens', 'Itens da lista', 'Um item por linha.', { obrigatorio: false, oculto: true });
itens.meta.conditions = [
  {
    name: 'Quando é lista',
    rule: { _and: [{ tipo: { _eq: 'lista' } }] },
    hidden: false,
    required: true,
  },
];

const colecoes = [
  {
    collection: 'site',
    meta: ficha('Site', 'Nome e endereço publicados do site.', 1, { singleton: true }),
    campos: [
      texto('nome', 'Nome', 'Nome curto do produto.', { limite: 40 }),
      texto('url', 'Endereço do site', 'Endereço público, com https://. O Editor não altera.', { limite: 200 }),
    ],
  },
  {
    collection: 'ui',
    meta: ficha('Rótulos da interface', 'Textos de menu, acessibilidade e chat. O Editor não vê esta ficha.', 2, {
      singleton: true,
    }),
    campos: [
      ['rotuloInicio', 'Página inicial'],
      ['pularParaConteudo', 'Pular para o conteúdo'],
      ['navegacaoPrincipal', 'Navegação principal'],
      ['navegacaoRodape', 'Navegação do rodapé'],
      ['voltarInicio', 'Voltar ao início'],
      ['baixarNoGooglePlay', 'Selo do Google Play'],
      ['baixarNaAppStore', 'Selo da App Store'],
      ['rotuloEmail', 'E-mail'],
      ['indiceDuvidas', 'Índice de dúvidas'],
      ['acessibilidade', 'Acessibilidade'],
      ['altoContraste', 'Alto contraste'],
      ['aumentarTexto', 'Aumentar texto'],
      ['diminuirTexto', 'Diminuir texto'],
      ['abrirMenu', 'Abrir menu'],
      ['fecharMenu', 'Fechar menu'],
      ['parceiros', 'Parceiros'],
      ['empresasParceiras', 'Empresas parceiras'],
      ['pausarFotos', 'Pausar fotos'],
      ['continuarFotos', 'Continuar fotos'],
      ['chatChamadaPergunta', 'Chamada do chat'],
      ['chatChamadaAcao', 'Ação do chat'],
      ['chatAbrir', 'Abrir chat'],
      ['chatFecharChamada', 'Fechar aviso do chat'],
      ['chatTitulo', 'Título do chat'],
      ['chatStatus', 'Status do chat'],
      ['idioma', 'Idioma'],
      ['ingles', 'Inglês'],
      ['portugues', 'Português'],
      ['reproduzirVideo', 'Reproduzir vídeo'],
    ].map(([field, nome]) => texto(field, nome, 'Texto de interface.', { limite: 120 })),
  },
  {
    collection: 'links',
    meta: ficha('Links', 'Botões que saem do site.', 3, { singleton: true }),
    campos: [
      grupo('gAtivar', 'Ativar estacionamento'),
      texto('pqmRotulo', 'Rótulo', 'Texto do botão.', { limite: 80, grupo: 'gAtivar' }),
      texto('pqmUrl', 'Endereço', 'Endereço completo.', { limite: 300, grupo: 'gAtivar' }),
      grupo('gCadastro', 'Cadastro'),
      texto('cadastroRotulo', 'Rótulo', 'Texto do botão.', { limite: 80, grupo: 'gCadastro' }),
      texto('cadastroUrl', 'Endereço', 'Endereço completo.', { limite: 300, grupo: 'gCadastro' }),
      grupo('gBaixe', 'Baixe o ZAS'),
      texto('baixeRotulo', 'Rótulo', 'Texto do link.', { limite: 80, grupo: 'gBaixe' }),
      texto('baixeUrl', 'Endereço', 'Pode ser um caminho interno, como /#baixe-o-zas.', { limite: 300, grupo: 'gBaixe' }),
      grupo('gPlay', 'Google Play'),
      texto('playRotulo', 'Rótulo', 'Texto do selo.', { limite: 80, grupo: 'gPlay' }),
      texto('playUrl', 'Endereço', 'Endereço da ficha na loja.', { limite: 300, grupo: 'gPlay' }),
      grupo('gApple', 'App Store'),
      texto('appleRotulo', 'Rótulo', 'Texto do selo.', { limite: 80, grupo: 'gApple' }),
      texto('appleUrl', 'Endereço', 'Endereço da ficha na loja.', { limite: 300, grupo: 'gApple' }),
      grupo('gWeb', 'Versão web'),
      texto('webDetalhe', 'Detalhe', 'Linha pequena acima do rótulo.', { limite: 40, grupo: 'gWeb' }),
      texto('webRotulo', 'Rótulo', 'Texto do botão.', { limite: 80, grupo: 'gWeb' }),
      texto('webUrl', 'Endereço', 'Endereço do aplicativo no navegador.', { limite: 300, grupo: 'gWeb' }),
    ],
  },
  {
    collection: 'home',
    meta: ficha('Home', 'Textos da página inicial. A tabela de preços fica em Tarifas.', 4, { singleton: true }),
    campos: [
      grupo('gPrincipal', 'Abertura'),
      texto('principalTitulo', 'Título', 'Título grande da home.', { limite: 180, grupo: 'gPrincipal' }),
      texto('principalSubtitulo', 'Subtítulo', 'Parágrafo ao lado do título.', { limite: 300, grupo: 'gPrincipal' }),
      texto('ctaPrincipal', 'Botão principal', 'Vai para a ativação.', { limite: 80, grupo: 'gPrincipal' }),
      texto('ctaSecundario', 'Botão secundário', 'Vai para o cadastro.', { limite: 80, grupo: 'gPrincipal' }),
      grupo('gOQueE', 'O que é'),
      texto('oQueETitulo', 'Título', 'Título da seção.', { limite: 180, grupo: 'gOQueE' }),
      lista('oQueEParagrafos', 'Parágrafos', 'Um bloco por parágrafo.', { grupo: 'gOQueE' }),
      texto('chamadaLojas', 'Chamada das lojas', 'Frase acima dos selos.', { limite: 80, grupo: 'gOQueE' }),
      grupo('gVoce', 'Você estacionou'),
      texto('voceTitulo', 'Título', 'Título da seção.', { limite: 180, grupo: 'gVoce' }),
      lista('vocePassos', 'Passos', 'Um passo por linha, na ordem da home.', { grupo: 'gVoce' }),
      texto('voceAcaoRotulo', 'Rótulo do botão', 'Leva ao passo a passo.', { limite: 80, grupo: 'gVoce' }),
      texto('voceAcaoRota', 'Caminho do botão', 'Caminho interno. O Editor não altera.', { limite: 80, grupo: 'gVoce' }),
      texto('voceApoio', 'Texto de apoio', 'Parágrafo abaixo dos passos.', { limite: 500, grupo: 'gVoce' }),
      grupo('gTarifasHome', 'Tarifas na home'),
      texto('tarifasTitulo', 'Título', 'Título da faixa.', { limite: 80, grupo: 'gTarifasHome' }),
      texto('tarifasIntroducao', 'Introdução', 'Frase acima dos valores.', { limite: 180, grupo: 'gTarifasHome' }),
      texto('tarifasAcaoRotulo', 'Rótulo do botão', 'Leva à página de tarifas.', { limite: 80, grupo: 'gTarifasHome' }),
      texto('tarifasAcaoRota', 'Caminho do botão', 'Caminho interno. O Editor não altera.', { limite: 80, grupo: 'gTarifasHome' }),
      grupo('gFiscal', 'Fiscalização'),
      texto('fiscalTitulo', 'Título', 'Título da seção.', { limite: 80, grupo: 'gFiscal' }),
      texto('fiscalTexto', 'Texto', 'Parágrafo da seção.', { limite: 500, grupo: 'gFiscal' }),
      grupo('gInstHome', 'Institucional na home'),
      texto('instTitulo', 'Título', 'Título da seção.', { limite: 180, grupo: 'gInstHome' }),
      texto('instTexto', 'Texto', 'Parágrafo da seção.', { limite: 500, grupo: 'gInstHome' }),
      grupo('gOperacao', 'Operação'),
      texto('operacaoRotulo', 'Rótulo', 'Linha pequena acima do título.', { limite: 80, grupo: 'gOperacao' }),
      texto('operacaoTitulo', 'Título', 'Título da faixa de fotos.', { limite: 180, grupo: 'gOperacao' }),
      texto('operacaoDestaque', 'Destaque', 'Frase em destaque.', { limite: 180, grupo: 'gOperacao' }),
      {
        field: 'operacaoPontos',
        type: 'json',
        meta: {
          interface: 'list',
          special: ['cast-json'],
          required: true,
          width: 'full',
          group: 'gOperacao',
          note: 'Um ponto por linha, na ordem da home.',
          translations: rotulos('Pontos'),
          options: {
            template: '{{titulo}}',
            fields: [
              {
                field: 'titulo',
                name: 'Título',
                type: 'string',
                meta: { interface: 'input', required: true, width: 'full', options: { trim: true } },
              },
              {
                field: 'texto',
                name: 'Texto',
                type: 'string',
                meta: { interface: 'input-multiline', required: true, width: 'full', options: { trim: true } },
              },
            ],
          },
        },
        schema: { is_nullable: false },
      },
    ],
  },
  {
    collection: 'tabela_tarifas',
    meta: ficha(
      'Tarifas',
      'Uma ficha só. As linhas publicam juntas. A home e a página de tarifas leem daqui. A home mostra as três primeiras, nesta ordem.',
      5,
      { singleton: true },
    ),
    campos: [
      texto('colunaRegra', 'Título da coluna Regra', 'Cabeçalho da primeira coluna.', { limite: 40 }),
      texto('colunaDuracao', 'Título da coluna Duração', 'Cabeçalho da segunda coluna.', { limite: 40 }),
      texto('colunaValor', 'Título da coluna Valor', 'Cabeçalho da terceira coluna.', { limite: 40 }),
      {
        field: 'linhas',
        type: 'json',
        meta: {
          interface: 'list',
          special: ['cast-json'],
          required: true,
          width: 'full',
          note: 'Arraste para reordenar. Publicam todas juntas, ou nenhuma publica.',
          translations: rotulos('Linhas'),
          options: {
            template: '{{regra}} · {{duracao}} · {{valor}}',
            fields: [
              {
                field: 'regra',
                name: 'Regra',
                type: 'string',
                meta: { interface: 'input', required: true, width: 'full', options: { trim: true } },
              },
              {
                field: 'duracao',
                name: 'Duração',
                type: 'string',
                meta: { interface: 'input', required: true, width: 'half', options: { trim: true } },
              },
              {
                field: 'valor',
                name: 'Valor',
                type: 'string',
                meta: {
                  interface: 'input',
                  required: true,
                  width: 'half',
                  note: 'Como o motorista lê, por exemplo R$ 3,00.',
                  options: { trim: true },
                },
              },
            ],
          },
        },
        schema: { is_nullable: false },
      },
    ],
  },
  {
    collection: 'como_funciona',
    meta: ficha('Como funciona', 'Cabeça da página. As seções ficam na lista ligada.', 6, { singleton: true }),
    campos: [
      texto('titulo', 'Título', 'Título da página.', { limite: 180 }),
      lista('introducao', 'Introdução', 'Parágrafos antes do destaque.'),
      texto('destaqueTitulo', 'Título do destaque', 'Quadro do crédito e da ativação.', { limite: 180 }),
      lista('destaqueParagrafos', 'Parágrafos do destaque', 'Um bloco por parágrafo.'),
    ],
  },
  {
    collection: 'secao',
    meta: ficha('Seções', 'Blocos de Como funciona e o bloco Sem internet. O Editor não cria nem apaga.', 7, {
      modelo: '{{titulo}}',
    }),
    id: idTexto('Vira âncora do endereço. O Editor não altera. Seção nova pede desenho novo do desenvolvimento.'),
    campos: [texto('titulo', 'Título', 'Título visível da seção.', { limite: 180 }), ordem(), fk('pagina', 'integer')],
  },
  {
    collection: 'estacione_agora',
    meta: ficha('Estacione agora', 'Cabeça da página. Os passos ficam na lista ligada.', 8, { singleton: true }),
    campos: [
      texto('titulo', 'Título', 'Título da página.', { limite: 180 }),
      texto('antesTitulo', 'Título de antes de começar', 'Título do quadro amarelo.', { limite: 120 }),
      lista('antesItens', 'Itens de antes de começar', 'Um item por linha.'),
      fk('semInternet', 'string'),
    ],
  },
  {
    collection: 'passo_ativacao',
    meta: ficha('Passos da ativação', 'O desenho do celular segue a posição. O Editor não cria nem apaga.', 9, {
      modelo: '{{rotulo}} {{titulo}}',
    }),
    id: idTexto('Uso interno. O Editor não altera. Passo novo pede desenho novo do desenvolvimento.'),
    campos: [
      texto('rotulo', 'Rótulo', 'Linha pequena, por exemplo Passo 1.', { limite: 40 }),
      texto('titulo', 'Título', 'Título do passo.', { limite: 120 }),
      {
        field: 'lojas',
        type: 'boolean',
        meta: {
          interface: 'boolean',
          note: 'Ligado só no passo que mostra Google Play e App Store.',
          translations: rotulos('Mostrar lojas'),
          width: 'full',
        },
        schema: { is_nullable: true, default_value: false },
      },
      ordem(),
      fk('pagina', 'integer'),
    ],
  },
  {
    collection: 'tarifas_e_regras',
    meta: ficha('Página de tarifas', 'Textos da página. A tabela é a ficha Tarifas.', 10, { singleton: true }),
    campos: [
      texto('titulo', 'Título', 'Título da página.', { limite: 180 }),
      texto('introducao', 'Introdução', 'Frase abaixo do título.', { limite: 300 }),
      texto('atencao', 'Atenção', 'Parágrafo de limites. **trecho** fica em negrito.', { limite: 800 }),
    ],
  },
  {
    collection: 'duvidas',
    meta: ficha('Dúvidas', 'Cabeça da página. Os assuntos ficam na lista ligada.', 11, { singleton: true }),
    campos: [
      texto('titulo', 'Título', 'Título da página.', { limite: 180 }),
      texto('cta', 'Botão', 'Texto do botão da FAQ na home.', { limite: 80 }),
    ],
  },
  {
    collection: 'bloco_duvidas',
    meta: ficha('Assuntos das dúvidas', 'Cada assunto vira uma âncora.', 12, { modelo: '{{titulo}}' }),
    id: idTexto('Vira âncora do endereço. Dá para preencher ao criar. O Editor não muda depois.'),
    campos: [texto('titulo', 'Título', 'Nome do assunto no índice.', { limite: 120 }), ordem(), fk('pagina', 'integer')],
  },
  {
    collection: 'pergunta',
    meta: ficha('Perguntas', 'Cada pergunta vira uma âncora.', 13, { modelo: '{{pergunta}}' }),
    id: idTexto('Vira âncora do endereço. Dá para preencher ao criar. O Editor não muda depois.'),
    campos: [
      texto('pergunta', 'Pergunta', 'A pergunta, como o motorista procura.', { limite: 200 }),
      ordem(),
      fk('bloco', 'string'),
    ],
  },
  {
    collection: 'trecho',
    meta: ficha('Trechos', 'Parágrafo ou lista. Escolha o tipo.', 14, { modelo: '{{tipo}}' }),
    campos: [
      {
        field: 'chave',
        type: 'string',
        meta: { interface: 'input', hidden: true, translations: rotulos('Chave') },
        schema: { is_nullable: true, is_unique: true, max_length: 120 },
      },
      {
        field: 'tipo',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          required: true,
          width: 'full',
          note: 'Parágrafo é texto corrido. Lista é uma série de itens.',
          translations: rotulos('Tipo'),
          options: {
            choices: [
              { value: 'paragrafo', text: 'Parágrafo' },
              { value: 'lista', text: 'Lista' },
            ],
          },
        },
        schema: { is_nullable: false, max_length: 20 },
      },
      paragrafo,
      itens,
      ordem(),
      fk('secao', 'string'),
      fk('passo', 'string'),
      fk('pergunta', 'string'),
    ],
  },
  {
    collection: 'suporte',
    meta: ficha('Suporte', 'Contato da página.', 15, { singleton: true }),
    campos: [
      texto('titulo', 'Título', 'Título da seção.', { limite: 80 }),
      texto('email', 'E-mail', 'Endereço que aparece no site.', { limite: 120 }),
    ],
  },
  {
    collection: 'institucional',
    meta: ficha('Institucional', 'Página institucional.', 16, { singleton: true }),
    campos: [
      texto('titulo', 'Título', 'Título da página.', { limite: 120 }),
      lista('paragrafos', 'Parágrafos', 'Um bloco por parágrafo.'),
    ],
  },
  {
    collection: 'nao_encontrada',
    meta: ficha('Página não encontrada', 'Texto da página 404.', 17, { singleton: true }),
    campos: [texto('titulo', 'Título', 'Frase da página.', { limite: 80 })],
  },
  {
    collection: 'seo',
    meta: ficha('Busca', 'Sete fichas fixas, uma por página. Ninguém cria nem apaga.', 18, {
      modelo: '{{titulo}}',
    }),
    id: idTexto('Página do site. Não mude este valor.'),
    campos: [
      texto('titulo', 'Título', 'Título na aba e no Google.', { limite: 180 }),
      texto('descricao', 'Descrição', 'Resumo no Google.', { limite: 400 }),
    ],
  },
  {
    collection: 'navegacao',
    meta: ficha('Menu', 'O menu do site. Os itens ficam na lista ligada.', 19, { singleton: true }),
    campos: [],
  },
  {
    collection: 'item_navegacao',
    meta: ficha('Itens do menu', 'O Editor muda o rótulo e a ordem. Seção e caminho ficam com o Administrador.', 20, {
      modelo: '{{rotulo}}',
    }),
    id: idTexto('Igual à seção da home. O Editor não altera.'),
    campos: [
      texto('rotulo', 'Rótulo', 'Texto do menu.', { limite: 80 }),
      texto('secao', 'Seção', 'Âncora da home. O Editor não altera.', { limite: 80 }),
      texto('rota', 'Caminho', 'Página interna. Vazio se o item só rola a home. O Editor não altera.', {
        limite: 80,
        obrigatorio: false,
      }),
      ordem(),
      fk('menu', 'integer'),
    ],
  },
  {
    collection: 'fotos',
    meta: ficha(
      'Fotos',
      'A foto grande da home e a faixa da operação. Em cada lugar, imagem ou um vídeo do YouTube.',
      21,
      { singleton: true },
    ),
    campos: [
      grupo('gHero', 'Foto grande da home'),
      modoMidia('heroModo', 'Como mostrar', 'Imagem usa as fotos grandes. Vídeo troca todas por um YouTube.', 'gHero'),
      campoYoutube('heroYoutube', 'Link do YouTube', 'heroModo', 'gHero'),
      tituloVideo('heroVideoTitulo', 'heroModo', 'gHero'),
      grupo('gOperacao', 'Faixa da operação'),
      modoMidia(
        'operacaoModo',
        'Como mostrar',
        'Imagem usa a faixa que desliza. Vídeo troca a faixa por um YouTube.',
        'gOperacao',
      ),
      campoYoutube('operacaoYoutube', 'Link do YouTube', 'operacaoModo', 'gOperacao'),
      tituloVideo('operacaoVideoTitulo', 'operacaoModo', 'gOperacao'),
    ],
  },
  {
    collection: 'foto',
    meta: ficha('Foto', 'Imagem da home. Largura, altura e versões entram sozinhas.', 22, { modelo: '{{alt}}' }),
    campos: [
      {
        field: 'chave',
        type: 'string',
        meta: { interface: 'input', hidden: true, translations: rotulos('Chave') },
        schema: { is_nullable: true, is_unique: true, max_length: 120 },
      },
      fk('galeria', 'integer'),
      {
        field: 'arquivo',
        type: 'uuid',
        meta: {
          interface: 'file-image',
          special: ['file'],
          required: true,
          width: 'full',
          note: 'Envie a foto. O texto alternativo é obrigatório.',
          translations: rotulos('Imagem'),
        },
      },
      texto('alt', 'Texto alternativo', 'Descreva a foto para quem não a vê. Obrigatório.', { limite: 300 }),
      texto('legenda', 'Legenda', 'Aparece sobre a foto. Pode ficar vazio.', { limite: 200, obrigatorio: false }),
      texto('posicao', 'Posição', 'Ponto que fica visível no corte. Exemplo: 55% 40%.', {
        limite: 20,
        obrigatorio: false,
      }),
      texto('posicaoCelular', 'Posição no celular', 'O mesmo ponto em tela estreita. Exemplo: 58% 30%.', {
        limite: 20,
        obrigatorio: false,
      }),
      {
        field: 'grupo',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          required: true,
          width: 'full',
          note: 'Foto grande é o topo da home. Operação é a faixa que desliza. Só aparece quando o lugar está em Imagem.',
          translations: rotulos('Onde aparece'),
          options: {
            choices: [
              { value: 'hero', text: 'Foto grande da home' },
              { value: 'operacao', text: 'Faixa da operação' },
            ],
          },
        },
        schema: { is_nullable: false, max_length: 20 },
      },
      ordem(),
      numeroSomenteLeitura('largura', 'Largura', 'Preenchida no envio.'),
      numeroSomenteLeitura('altura', 'Altura', 'Preenchida no envio.'),
      {
        field: 'versoes',
        type: 'json',
        meta: {
          interface: 'input-code',
          special: ['cast-json'],
          readonly: true,
          hidden: true,
          note: 'Versões 1024, 1536 e 2048. O editor não digita.',
          translations: rotulos('Versões'),
          options: { language: 'json' },
        },
        schema: { is_nullable: true },
      },
      {
        field: 'src',
        type: 'string',
        meta: {
          interface: 'input',
          readonly: true,
          hidden: true,
          note: 'Calculado a partir do arquivo.',
          translations: rotulos('Endereço publicado'),
        },
        schema: { is_nullable: true, max_length: 300 },
      },
    ],
  },
];

const relacoes = [
  relacao('secao', 'pagina', 'como_funciona', 'secoes', 'Seções', false, '{{titulo}}'),
  relacao('passo_ativacao', 'pagina', 'estacione_agora', 'passos', 'Passos', false, '{{rotulo}} {{titulo}}'),
  relacao('estacione_agora', 'semInternet', 'secao', null, null, false, null),
  relacao('bloco_duvidas', 'pagina', 'duvidas', 'blocos', 'Assuntos', true, '{{titulo}}'),
  relacao('pergunta', 'bloco', 'bloco_duvidas', 'perguntas', 'Perguntas', true, '{{pergunta}}'),
  relacao('trecho', 'secao', 'secao', 'trechos', 'Trechos', true, '{{tipo}}'),
  relacao('trecho', 'passo', 'passo_ativacao', 'trechos', 'Trechos', true, '{{tipo}}'),
  relacao('trecho', 'pergunta', 'pergunta', 'resposta', 'Resposta', true, '{{tipo}}'),
  relacao('item_navegacao', 'menu', 'navegacao', 'principal', 'Itens', false, '{{rotulo}}'),
  relacao('foto', 'galeria', 'fotos', 'itens', 'Fotos', true, '{{alt}}'),
  relacao('foto', 'arquivo', 'directus_files', null, 'Imagem', false, null),
];

function relacao(collection, field, related, oneField, oneNome, criarNoO2m, template) {
  return { collection, field, related, oneField, oneNome, criarNoO2m, template };
}

const { api } = await entrar();

await garantirPasta();
const existentes = new Set((await api.get('/collections')).data.map((item) => item.collection));

for (const def of colecoes) {
  if (!existentes.has(def.collection)) {
    const corpo = { collection: def.collection, meta: def.meta, schema: {} };
    if (def.id) corpo.fields = [def.id];
    await api.post('/collections', corpo);
    console.log(`coleção ${def.collection}`);
  } else {
    await api.patch(`/collections/${def.collection}`, { meta: def.meta });
    if (def.id) await garantirCampo(def.collection, def.id);
    console.log(`coleção ${def.collection} já existia`);
  }
  for (const campo of def.campos) await garantirCampo(def.collection, campo);
}

const relacoesAtuais = new Set(
  (await api.get('/relations')).data.map((item) => `${item.collection}.${item.field}`),
);

for (const item of relacoes) {
  const chave = `${item.collection}.${item.field}`;
  if (!relacoesAtuais.has(chave)) {
    try {
      await api.post('/relations', {
        collection: item.collection,
        field: item.field,
        related_collection: item.related,
        meta: {
          sort_field: item.oneField ? 'ordem' : null,
          one_field: item.oneField,
          one_deselect_action: 'nullify',
        },
        schema: { on_delete: 'SET NULL' },
      });
      console.log(`relação ${chave}`);
    } catch (erro) {
      if (!String(erro.message).toLowerCase().includes('already exists')) throw erro;
      console.log(`relação ${chave} já tinha o campo`);
    }
  }
  if (item.oneField) {
    await api.patch(`/fields/${item.related}/${item.oneField}`, {
      meta: {
        translations: rotulos(item.oneNome),
        interface: 'list-o2m',
        note:
          item.related === 'fotos'
            ? 'Usadas quando o lugar está em Imagem. Em cada foto, escolha Foto grande da home ou Faixa da operação.'
            : null,
        options: {
          template: item.template,
          enableCreate: item.criarNoO2m,
          enableSelect: false,
          sort: 'ordem',
        },
      },
    });
  }
  if (item.field === 'arquivo') {
    await api.patch('/fields/foto/arquivo', {
      meta: {
        interface: 'file-image',
        special: ['file'],
        required: true,
        hidden: false,
        width: 'full',
        note: 'Envie a foto. O texto alternativo é obrigatório.',
        translations: rotulos('Imagem'),
      },
    });
  } else {
    await api.patch(`/fields/${item.collection}/${item.field}`, {
      meta: { hidden: true, translations: rotulos(item.oneNome ?? item.field) },
    });
  }
}

await garantirFluxoFoto();
console.log('Collections prontas.');

async function garantirFluxoFoto() {
  const fluxos = (await api.get('/flows')).data;
  if (fluxos.some((item) => item.name === 'Preencher medidas da foto')) return;

  const fluxo = (
    await api.post('/flows', {
      name: 'Preencher medidas da foto',
      icon: 'image',
      status: 'active',
      accountability: 'all',
      trigger: 'event',
      options: {
        type: 'action',
        scope: ['items.create', 'items.update'],
        collections: ['foto'],
      },
    })
  ).data;

  const preparar = await operacao(fluxo.id, 'preparar', 'exec', {
    code: `module.exports = function (data) {
  var gatilho = data.$trigger || {};
  var payload = gatilho.payload || {};
  if (!payload.arquivo || payload.versoes) return { pular: true, arquivo: null };
  return { pular: false, arquivo: payload.arquivo };
};`,
  });
  const seguir = await operacao(fluxo.id, 'seguir', 'condition', {
    filter: { preparar: { pular: { _eq: false } } },
  });
  const parar = await operacao(fluxo.id, 'parar', 'exec', {
    code: 'module.exports = function () { return null; };',
  });
  const ler = await operacao(fluxo.id, 'ler_arquivo', 'item-read', {
    collection: 'directus_files',
    key: '{{preparar.arquivo}}',
    query: { fields: ['id', 'width', 'height'] },
    emitEvents: false,
    permissions: '$full',
  });
  const calcular = await operacao(fluxo.id, 'calcular', 'exec', {
    code: `module.exports = function (data) {
  var gatilho = data.$trigger || {};
  var chave = gatilho.key || (gatilho.keys && gatilho.keys[0]);
  var arquivo = data.ler_arquivo;
  if (!arquivo || !arquivo.width || !chave) return { chave: null, dados: null };
  var largura = arquivo.width;
  var altura = arquivo.height;
  var cortes = [1024, 1536, 2048].filter(function (n) { return n <= largura; });
  if (cortes.length === 0) cortes.push(largura);
  var versoes = {};
  var maior = cortes[0];
  for (var i = 0; i < cortes.length; i++) {
    if (cortes[i] > maior) maior = cortes[i];
    versoes[String(cortes[i])] = '/assets/' + arquivo.id + '?width=' + cortes[i] + '&format=webp&quality=80';
  }
  return {
    chave: chave,
    dados: { largura: largura, altura: altura, versoes: versoes, src: versoes[String(maior)] },
  };
};`,
  });
  const gravar = await operacao(fluxo.id, 'gravar', 'item-update', {
    collection: 'foto',
    key: '{{calcular.chave}}',
    payload: '{{calcular.dados}}',
    emitEvents: false,
    permissions: '$full',
  });
  const temMedidas = await operacao(fluxo.id, 'tem_medidas', 'condition', {
    filter: { calcular: { dados: { _nnull: true } } },
  });

  await api.patch(`/operations/${preparar.id}`, { resolve: seguir.id });
  await api.patch(`/operations/${seguir.id}`, { resolve: ler.id, reject: parar.id });
  await api.patch(`/operations/${ler.id}`, { resolve: calcular.id });
  await api.patch(`/operations/${calcular.id}`, { resolve: temMedidas.id });
  await api.patch(`/operations/${temMedidas.id}`, { resolve: gravar.id, reject: parar.id });
  await api.patch(`/flows/${fluxo.id}`, { operation: preparar.id });
}

async function operacao(flow, key, type, options) {
  const criada = await api.post('/operations', {
    flow,
    key,
    type,
    position_x: 19,
    position_y: 1,
    options,
  });
  return criada.data;
}

async function garantirPasta() {
  const nomes = new Set((await api.get('/collections')).data.map((item) => item.collection));
  const meta = {
    icon: 'folder',
    translations: rotulos('Conteúdo do site'),
    accountability: 'all',
    sort: 1,
  };
  if (!nomes.has(PASTA)) {
    await api.post('/collections', { collection: PASTA, meta, schema: null });
  }
}

async function garantirCampo(collection, campo) {
  const atuais = new Set((await api.get(`/fields/${collection}`)).data.map((item) => item.field));
  if (!atuais.has(campo.field)) {
    await api.post(`/fields/${collection}`, campo);
    return;
  }
  await api.patch(`/fields/${collection}/${campo.field}`, { meta: campo.meta });
}
