import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const browser = resolve('dist/zas-site/browser');
copyFileSync(resolve(browser, '404/index.html'), resolve(browser, '404.html'));
copyFileSync(resolve(browser, 'pt/404/index.html'), resolve(browser, 'pt/404.html'));
console.log('404.html copiado para a raiz e para /pt.');
