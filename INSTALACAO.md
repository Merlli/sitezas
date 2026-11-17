# Instalação do ZAS

Este arquivo cresce até a entrega. O que está abaixo já vale. Backup, HTTPS, seed e o container do site entram nas próximas seções.

## Subir o painel

No servidor, na pasta do projeto:

```bash
./scripts/subir.sh
```

Na primeira vez o script cria o `.env` com as chaves e a senha. A senha fica em `ADMIN_PASSWORD` dentro do `.env`. O script não substitui um `.env` que já existe.

O painel abre no endereço de `PUBLIC_URL`. O Directus escuta só na rede Docker `interna`. Quem entra de fora passa pelo proxy, na `PORTA_PUBLICA` (80 se ninguém mudou).

Na primeira vez o script imprime a senha do administrador no fim e avisa que não mostra de novo.

## Conteúdo e papel Editor

Com o painel no ar:

```bash
node scripts/directus/criar-collections.mjs
node scripts/directus/criar-papeis.mjs
node scripts/directus/importar-conteudo.mjs
```

## Trava do import

`importar-conteudo.mjs` só grava numa instalação vazia. Se já existe item publicado numa collection de conteúdo, ou revisão dessas collections, o script para, lista o que encontrou e não altera nada.

A criação do painel e das collections não conta. A trava olha o conteúdo.

Para repor o JSON por cima do que está publicado:

```bash
node scripts/directus/importar-conteudo.mjs --forcar-sobrescrita
```

O script pede a palavra `SOBRESCREVER`. Outra resposta, ou Enter, não grava nada. Sem a opção, nem chega a pedir.

Para criar um usuário Editor sem servidor de e-mail: no painel, Usuários, criar usuário, e-mail, senha, papel Editor. O convite por e-mail só funciona com SMTP configurado. O Editor não vê a ficha de rótulos da interface.

Na ficha Fotos, a foto grande da home e a faixa da operação têm a escolha Imagem ou Vídeo do YouTube. Em Imagem, valem as fotos da lista. Em Vídeo, o editor cola o link e o título. As fotos ficam guardadas e voltam se a escolha voltar para Imagem.

## Obrigatório: `/api/revalidar` não sai da rede interna

A rota que troca o cache do site existe no container do site, na porta 4000, rede `interna`. O Directus chama `http://site:4000/api/revalidar` por essa rede.

Essa rota não tem porta no host. O proxy é a única entrada publicada, e ele recusa qualquer caminho `/api/` com 404. A regra está em `deploy/nginx/bloquear-api.conf`.

Isto é obrigatório em qualquer proxy que ficar na frente, inclusive um nginx ou Caddy que o time trocar pelo deste compose:

1. Não publique a porta 4000 do site.
2. Não publique a porta 8055 do Directus.
3. Em cada `server` que atende a internet, inclua o bloqueio de `/api/` antes do `location` que encaminha o site. No arquivo deste repositório o include é `bloquear-api.conf`.
4. O fluxo do Directus continua apontando para `http://site:4000`, nunca para o domínio público.

Sem o item 3, o domínio público entrega a rota mesmo com o compose intacto. Conferir depois de apontar o domínio: `https://www.seudominio/api/revalidar` responde 404 e não dispara troca de cache.
