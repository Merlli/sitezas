#!/bin/sh
# Gera .env na primeira vez e sobe o painel. Não mexe num .env que já existe.
set -eu

raiz=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$raiz"

senha_nova=""
email_admin="admin@localhost"

if [ ! -f .env ]; then
  segredo() { openssl rand -hex 32; }
  senha_nova=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | cut -c1-24)
  if [ "${#senha_nova}" -ne 24 ]; then
    echo "Não consegui gerar a senha do administrador." >&2
    exit 1
  fi
  cat > .env <<EOF
DIRECTUS_SECRET=$(segredo)
DIRECTUS_KEY=$(segredo)
ADMIN_EMAIL=${email_admin}
ADMIN_PASSWORD=${senha_nova}
PUBLIC_URL=http://localhost
PORTA_PUBLICA=80
REVALIDAR_SEGREDO=$(segredo)
DIRECTUS_INTERNO=http://directus:8055
EOF
fi

docker compose up -d

if [ -n "$senha_nova" ]; then
  printf '\nSenha do administrador (%s):\n%s\n\nEsta senha não será mostrada de novo. Guarde agora.\n' \
    "$email_admin" "$senha_nova"
fi
