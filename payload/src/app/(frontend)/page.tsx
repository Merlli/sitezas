import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

type ConteudoHome = {
  titulo?: string | null
  subtitulo?: string | null
  ctaPrincipal?: string | null
  ctaSecundario?: string | null
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>
}) {
  const { locale } = await searchParams
  const idioma = locale === 'pt' ? 'pt' : 'en'
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const conteudo = (await payload.findGlobal({
    slug: 'conteudo',
    locale: idioma,
  })) as ConteudoHome

  return (
    <div className="home">
      <div className="content">
        <p>{idioma === 'pt' ? 'PT' : 'EN'}</p>
        <h1>{conteudo.titulo}</h1>
        <p>{conteudo.subtitulo}</p>
        <div className="links">
          <a className="admin" href={idioma === 'pt' ? '/' : '/?locale=pt'}>
            {idioma === 'pt' ? 'EN' : 'PT'}
          </a>
          <a className="admin" href={payloadConfig.routes.admin}>
            {idioma === 'pt' ? 'Abrir o painel' : 'Open the panel'}
          </a>
          {conteudo.ctaPrincipal ? <span>{conteudo.ctaPrincipal}</span> : null}
          {conteudo.ctaSecundario ? <span>{conteudo.ctaSecundario}</span> : null}
        </div>
      </div>
    </div>
  )
}
