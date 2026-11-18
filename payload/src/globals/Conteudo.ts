import type { GlobalConfig } from 'payload'

/** Textos que o cliente edita. Inglês é o idioma padrão. */
export const Conteudo: GlobalConfig = {
  slug: 'conteudo',
  label: 'Conteúdo do site',
  fields: [
    {
      name: 'titulo',
      label: 'Título da home',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'subtitulo',
      label: 'Subtítulo da home',
      type: 'textarea',
      localized: true,
      required: true,
    },
    {
      name: 'ctaPrincipal',
      label: 'Botão principal',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'ctaSecundario',
      label: 'Botão secundário',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'tituloApp',
      label: 'Título do aplicativo',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'textoApp',
      label: 'Texto do aplicativo',
      type: 'textarea',
      localized: true,
      required: true,
    },
    {
      name: 'heroModo',
      label: 'Topo da home',
      type: 'select',
      defaultValue: 'imagem',
      options: [
        { label: 'Imagem', value: 'imagem' },
        { label: 'Vídeo do YouTube', value: 'video' },
      ],
      required: true,
    },
    {
      name: 'heroYoutube',
      label: 'Link do YouTube',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.heroModo === 'video',
        description: 'Cole o link. As fotos continuam guardadas se a escolha voltar para Imagem.',
      },
    },
    {
      name: 'heroVideoTitulo',
      label: 'Título do vídeo',
      type: 'text',
      localized: true,
      admin: {
        condition: (_, siblingData) => siblingData?.heroModo === 'video',
      },
    },
  ],
}
