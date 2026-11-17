import { fotosDoBloco, idYoutube, videoDoBloco } from './midia';
import type { BlocoMidia, Foto } from './content.types';

const foto: Foto = { src: '/fotos/a.webp', alt: 'Equipe', largura: 100, altura: 100 };

function bloco(parcial: Partial<BlocoMidia>): BlocoMidia {
  return { modo: 'imagem', fotos: [foto], ...parcial };
}

describe('idYoutube', () => {
  it('aceita os links que o YouTube copia', () => {
    const id = 'dQw4w9WgXcQ';
    expect(idYoutube(`https://www.youtube.com/watch?v=${id}`)).toBe(id);
    expect(idYoutube(`https://youtu.be/${id}`)).toBe(id);
    expect(idYoutube(`https://www.youtube.com/embed/${id}`)).toBe(id);
    expect(idYoutube(`https://www.youtube.com/shorts/${id}`)).toBe(id);
    expect(idYoutube(`https://www.youtube.com/watch?t=30&v=${id}`)).toBe(id);
    expect(idYoutube(`https://youtu.be/${id}?t=12`)).toBe(id);
    expect(idYoutube(`https://www.youtube-nocookie.com/embed/${id}`)).toBe(id);
    expect(idYoutube(id)).toBe(id);
  });

  it('rejeita texto que não é vídeo', () => {
    expect(idYoutube('')).toBeNull();
    expect(idYoutube('https://youtube.com')).toBeNull();
    expect(idYoutube('não é um link')).toBeNull();
    expect(idYoutube('curto')).toBeNull();
  });
});

describe('videoDoBloco', () => {
  it('em imagem, devolve as fotos e nenhum vídeo', () => {
    const atual = bloco({ modo: 'imagem', youtube: 'https://youtu.be/dQw4w9WgXcQ' });
    expect(videoDoBloco(atual)).toBeNull();
    expect(fotosDoBloco(atual)).toEqual([foto]);
  });

  it('em vídeo válido, esconde as fotos', () => {
    const atual = bloco({
      modo: 'video',
      youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoTitulo: 'Como ativar',
    });
    expect(videoDoBloco(atual)).toEqual({ id: 'dQw4w9WgXcQ', titulo: 'Como ativar' });
    expect(fotosDoBloco(atual)).toEqual([]);
  });

  it('em vídeo com link inválido, volta para as fotos', () => {
    const atual = bloco({ modo: 'video', youtube: 'https://exemplo.com/video' });
    expect(videoDoBloco(atual)).toBeNull();
    expect(fotosDoBloco(atual)).toEqual([foto]);
  });
});
