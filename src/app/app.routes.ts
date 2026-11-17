import { inject } from '@angular/core';
import { Router, type Routes } from '@angular/router';
import type { PaginaId } from '@app/content/content.types';
import { idiomaDaUrl } from '@app/core/idioma';

function dadosDaPagina(pagina: PaginaId): { pagina: PaginaId } {
  return { pagina };
}

function paginas(): Routes {
  return [
    {
      path: '',
      loadComponent: () => import('@app/pages/home/home-page').then((m) => m.HomePage),
      data: dadosDaPagina('home'),
    },
    {
      path: 'estacione-agora',
      loadComponent: () =>
        import('@app/pages/estacione-agora/estacione-agora-page').then((m) => m.EstacioneAgoraPage),
      data: dadosDaPagina('estacioneAgora'),
    },
    {
      path: 'como-funciona',
      loadComponent: () =>
        import('@app/pages/como-funciona/como-funciona-page').then((m) => m.ComoFuncionaPage),
      data: dadosDaPagina('comoFunciona'),
    },
    {
      path: 'tarifas-e-regras',
      loadComponent: () =>
        import('@app/pages/tarifas-e-regras/tarifas-e-regras-page').then((m) => m.TarifasERegrasPage),
      data: dadosDaPagina('tarifasERegras'),
    },
    {
      path: 'duvidas',
      loadComponent: () => import('@app/pages/duvidas/duvidas-page').then((m) => m.DuvidasPage),
      data: dadosDaPagina('duvidas'),
    },
    {
      path: 'suporte',
      redirectTo: () => {
        const router = inject(Router);
        const base = idiomaDaUrl(router.url) === 'pt' ? '/pt' : '/';
        return router.createUrlTree([base], { fragment: 'suporte' });
      },
    },
    {
      path: '404',
      loadComponent: () =>
        import('@app/pages/nao-encontrada/nao-encontrada-page').then((m) => m.NaoEncontradaPage),
      data: dadosDaPagina('naoEncontrada'),
    },
  ];
}

const naoEncontrada: Routes[number] = {
  path: '**',
  loadComponent: () =>
    import('@app/pages/nao-encontrada/nao-encontrada-page').then((m) => m.NaoEncontradaPage),
  data: dadosDaPagina('naoEncontrada'),
};

export const routes: Routes = [
  { path: 'pt', children: [...paginas(), naoEncontrada] },
  ...paginas(),
  naoEncontrada,
];
