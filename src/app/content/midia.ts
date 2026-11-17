import type { BlocoMidia, Foto } from './content.types';

const LINK =
  /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|live\/|watch\?(?:.*&)?v=))([A-Za-z0-9_-]{11})/i;

/** Código do YouTube a partir de um link ou do próprio código. Outro texto devolve null. */
export function idYoutube(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const texto = valor.trim();
  const solto = texto.match(/^([A-Za-z0-9_-]{11})$/);
  if (solto) return solto[1];
  return texto.match(LINK)?.[1] ?? null;
}

/** Vídeo que o site deve mostrar. Modo imagem, ou link inválido, devolve null. */
export function videoDoBloco(bloco: BlocoMidia): { id: string; titulo: string } | null {
  if (bloco.modo !== 'video') return null;
  const id = idYoutube(bloco.youtube);
  if (!id) return null;
  const titulo = bloco.videoTitulo?.trim();
  return { id, titulo: titulo || 'Vídeo do YouTube' };
}

/** Fotos do lugar. Some quando há um vídeo válido no lugar delas. */
export function fotosDoBloco(bloco: BlocoMidia): Foto[] {
  return videoDoBloco(bloco) ? [] : bloco.fotos;
}
