import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function lerEnv() {
  let texto;
  try {
    texto = readFileSync(resolve(raiz, '.env'), 'utf8');
  } catch {
    throw new Error('Não achei .env. Rode ./scripts/subir.sh antes.');
  }
  const env = {};
  for (const linha of texto.split('\n')) {
    const t = linha.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    env[t.slice(0, i)] = t.slice(i + 1);
  }
  return env;
}

function detalhe(json, status) {
  const msg = json?.errors?.[0]?.message;
  return msg ? `${status} ${msg}` : String(status);
}

export async function entrar() {
  const env = lerEnv();
  const base = (env.PUBLIC_URL || 'http://localhost').replace(/\/$/, '');
  const token = await login(base, env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
  return { base, env, api: criarApi(base, token) };
}

async function login(base, email, password) {
  let ultimo = 'sem resposta';
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.data?.access_token) return json.data.access_token;
      ultimo = detalhe(json, res.status);
    } catch (erro) {
      ultimo = erro instanceof Error ? erro.message : 'falha de rede';
    }
    await new Promise((resolver) => setTimeout(resolver, 2000));
  }
  throw new Error(`Não entrei no painel em ${base}. ${ultimo}`);
}

function criarApi(base, token) {
  async function pedir(caminho, { method, body, form } = {}) {
    const headers = { Authorization: `Bearer ${token}` };
    let payload;
    if (form) {
      payload = form;
    } else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    const res = await fetch(`${base}${caminho}`, { method, headers, body: payload });
    const texto = await res.text();
    const json = texto ? JSON.parse(texto) : null;
    if (!res.ok) {
      const erro = new Error(`${method} ${caminho} → ${detalhe(json, res.status)}`);
      erro.status = res.status;
      throw erro;
    }
    return json;
  }

  return {
    get: (caminho) => pedir(caminho, { method: 'GET' }),
    post: (caminho, body) => pedir(caminho, { method: 'POST', body }),
    patch: (caminho, body) => pedir(caminho, { method: 'PATCH', body }),
    del: (caminho) => pedir(caminho, { method: 'DELETE' }),
    form: (caminho, form) => pedir(caminho, { method: 'POST', form }),
  };
}
