import type { Payload } from 'payload'

const email = process.env.ADMIN_EMAIL || 'admin@merlli.com'
const senha = process.env.ADMIN_PASSWORD

const ingles = {
  titulo: 'Parked in Salvador? Activate your Zona Azul with ZAS.',
  subtitulo:
    'Check the street sign, choose the matching time, and confirm parking for your vehicle’s license plate.',
  ctaPrincipal: 'Start parking',
  ctaSecundario: 'Create an account',
  tituloApp: 'ZAS: the official Zona Azul app for Salvador',
  textoApp:
    'Since October 2018, Salvador’s Zona Azul has been digital: Transalvador replaced paper booklets with the Cartela Azul Digital. With ZAS, you use that balance straight from your phone.',
}

const portugues = {
  titulo: 'Estacionou em Salvador? Ative sua Zona Azul pelo ZAS.',
  subtitulo:
    'Confira a sinalização, escolha o tempo correspondente e confirme a ativação para a placa do seu veículo.',
  ctaPrincipal: 'Ativar Estacionamento',
  ctaSecundario: 'Crie sua conta',
  tituloApp: 'ZAS: o aplicativo oficial da Zona Azul de Salvador',
  textoApp:
    'Desde outubro de 2018, a Zona Azul de Salvador é digital: a Transalvador trocou os talões de papel pela Cartela Azul Digital. Com o ZAS, você usa a sua cartela direto no celular.',
}

export async function prepararPainel(payload: Payload): Promise<void> {
  const usuarios = await payload.find({ collection: 'users', limit: 1 })
  if (usuarios.totalDocs === 0 && senha) {
    await payload.create({
      collection: 'users',
      data: { email, password: senha },
    })
  }

  const atual = await payload.findGlobal({ slug: 'conteudo', locale: 'en' })
  if (atual.titulo) return

  await payload.updateGlobal({
    slug: 'conteudo',
    locale: 'en',
    data: { ...ingles, heroModo: 'imagem' },
  })
  await payload.updateGlobal({
    slug: 'conteudo',
    locale: 'pt',
    data: portugues,
  })
}
