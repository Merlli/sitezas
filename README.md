# ZAS — Zona Azul Salvador

Site institucional do ZAS em Angular, gerado como **site estático pré-renderizado**: cada página já sai em HTML pronto, sem servidor de aplicação.

## Requisitos

- Node.js na versão indicada em `.nvmrc` (24)
- npm (vem com o Node)

## Comandos

```bash
npm ci                 # instala as dependências exatamente como no package-lock.json
npm run dev            # servidor local em http://localhost:4200
npm run lint           # verificação de código
npm test               # testes
npm run build:prod     # gera o site final (falha se houver [PENDENTE] nos textos)
```

## Publicação

O resultado de `npm run build:prod` fica em `dist/zas-site/browser/`. Publique **o conteúdo dessa pasta** na raiz do domínio.

- Cada rota tem uma pasta com `index.html` (ex.: `/estacione-agora` → `estacione-agora/index.html`). O servidor deve responder `/rota` com `/rota/index.html`.
- Endereços inexistentes devem responder com `index.csr.html` e status 404; o próprio site mostra a página "Página não encontrada".
- Cache longo (1 ano, `immutable`) para `*.js`, `*.css` e `*.woff2`, que têm hash no nome; cache curto ou `no-cache` para os `index.html`, `robots.txt`, `sitemap.xml` e `chat/widget-channel.js`.
- Use HTTPS. O domínio configurado é `https://www.zaszonaazul.com.br`; recomenda-se redirecionar `http://` e o domínio sem `www` para ele.

Exemplo para **Nginx**:

```nginx
root /caminho/para/dist/zas-site/browser;

location / {
  try_files $uri $uri/index.html =404;
}

error_page 404 /index.csr.html;

location ~* \.(js|css|woff2)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```

Exemplo para **Apache** (`.htaccess` na pasta publicada):

```apache
DirectoryIndex index.html
ErrorDocument 404 /index.csr.html

<FilesMatch "\.(js|css|woff2)$">
  Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
```

## Onde editar

| O quê | Onde |
|---|---|
| Textos das páginas | `src/app/content/*.json` |
| Links (ativação, cadastro, lojas, versão web) | `src/app/content/links.json` |
| Títulos e descrições para buscadores | `src/app/content/seo.json` |
| Domínio do site | `src/app/content/site.json`, `public/robots.txt` e `public/sitemap.xml` |
| Foto grande da Home, ou um vídeo do YouTube no lugar | `public/fotos/` e `src/app/content/fotos.json` (`hero`) |
| Faixa "Quem faz o ZAS acontecer", ou um vídeo do YouTube no lugar | `public/fotos/` e `src/app/content/fotos.json` (`operacao`); sem fotos e sem vídeo, a faixa some |
| Texto da regulamentação no cartão Institucional | `src/app/content/institucional.json` |
| Cores e animações | `src/styles.css` |
| Ilustrações e logos | `public/ilustracoes/` e `public/marca/` |

Os textos ficam separados do código. O inglês é o idioma padrão, na raiz do site. O português fica em `/pt`. Os textos em inglês estão em `src/app/content/en/`. Os textos em português continuam em `src/app/content/*.json`. O controle EN | PT no topo abre a mesma página no outro idioma.

Na foto grande e na faixa da operação, `modo` escolhe o que aparece. `imagem` usa a lista `fotos`. `video` troca essas fotos por um YouTube: preencha `youtube` com o link e `videoTitulo` com o nome do vídeo. As fotos ficam no arquivo e voltam quando `modo` volta para `imagem`. Um link que não é do YouTube faz o site mostrar as fotos.

Os itens do menu ficam em `src/app/content/navegacao.json`. Itens sem `rota` levam a uma seção da Home (por exemplo, "Institucional" leva a `/#operacao`).

## Chat de atendimento

O chat é do fornecedor **Sylva MSG** e já está configurado com o canal do ZAS.

- Código do widget: `public/chat/widget-channel.js`. Para atualizar, substitua o arquivo pelo código novo enviado pelo fornecedor.
- O widget é carregado assim que o HTML da página é lido, sem esperar fotos e fontes e sem bloquear a exibição (script em `src/index.html`).
- O visual do botão (mascote, cores), o topo da janela (logo do ZAS, "ZAS - Zona Azul Salvador" e "Online") e o balão "Fale com o ZAS" ficam no site, não no código do fornecedor: `src/styles.css` (seção do chat), `public/ilustracoes/mascote-chat.svg`, `src/app/layout/chamada-chat.ts` e os textos `chat*` em `src/app/content/ui.json`. Uma atualização do widget mantém esse visual.

## Barra de acessibilidade

A barra de alto contraste e tamanho do texto está pronta, porém oculta. Para exibi-la:

1. Em `src/app/layout/site-header.ts`, mude `BARRA_ACESSIBILIDADE_VISIVEL` para `true`.
2. Em `src/index.html`, descomente o `<script>` que reaplica as preferências salvas.

## Estrutura

```
src/
  app/
    content/    textos, links e configurações em JSON
    core/       serviços (SEO, dados estruturados, acessibilidade, seção atual)
    layout/     cabeçalho, rodapé, link "pular para o conteúdo" e balão/topo do chat
    pages/      uma pasta por página
    shared/     componentes reutilizáveis e componentes de interface
  styles.css    cores, tipografia e animações
public/         imagens, ícones, chat, robots.txt e sitemap.xml
```
