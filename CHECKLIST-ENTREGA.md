# Checklist de entrega

## Antes de atualizar o Directus

A imagem está fixada em **directus/directus:11.17.4**. Não troque por `latest` nem pela linha 12 sem rever o licenciamento.

O Directus 12, no plano Core gratuito, limita o painel a **3 assentos**, **25 coleções** e **5 fluxos**, e deixa de aplicar regra fina de permissão sem uma licença. Este projeto ficou no 11.17.4 para o papel Editor continuar valendo: sem criar seção, sem mudar âncora, sem ver os rótulos de interface. O rascunho e o botão Publicar já existem nessa versão, sem licença.

Subir de versão exige rever o licenciamento antes.

## Teste que eu faço antes de passar para a Mobparking

Este compose ainda não foi executado: a máquina de desenvolvimento não tem Docker. Nada abaixo substitui o teste numa máquina limpa.

- [ ] Máquina limpa, sem volume antigo do Directus
- [ ] `./scripts/subir.sh` sobe o painel e imprime a senha uma vez
- [ ] `node scripts/directus/criar-collections.mjs`
- [ ] `node scripts/directus/criar-papeis.mjs`
- [ ] `node scripts/directus/importar-conteudo.mjs`
- [ ] Rodar o import de novo aborta, lista o que encontrou e não muda nada
- [ ] `node scripts/directus/importar-conteudo.mjs --forcar-sobrescrita` pede `SOBRESCREVER`; outra resposta não grava
- [ ] Criar um usuário com o papel Editor
- [ ] Com esse usuário, editar um texto, publicar, e ver a alteração no site
- [ ] `https://domínio/api/revalidar` responde 404

O item do site depende do servidor Angular, que ainda entra no passo seguinte. Até lá, o teste de publicar para no painel.

## Confirmar com a Mobparking

- [ ] Texto da duração dos eventos. O seed usa **Variável**, da página de tarifas. A home hoje diz **Conforme evento**. As duas páginas passam a ler a mesma tabela. O texto final entra no seed quando eles responderem.
- [ ] A faixa de fotos da home agora é `fotos.operacao` (cinco fotos no template). Os logos de parceiros continuam no código (`site-footer.ts`). Confirmar com a Mobparking se esses logos também entram no painel.
