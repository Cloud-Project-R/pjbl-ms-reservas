import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

/**
 * TESTE DE ARQUITETURA
 * Lê os "imports" de cada arquivo e falha se alguma camada usar o que não pode.
 * Assim a Clean Architecture é verificada automaticamente, não só desenhada.
 */

/** Lista todos os arquivos de uma pasta (e das subpastas). */
const listarArquivos = (pasta: string): string[] =>
  readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    return statSync(caminho).isDirectory() ? listarArquivos(caminho) : [caminho];
  });

/** Devolve os imports proibidos encontrados na pasta (lista vazia = tudo certo). */
const importsProibidos = (pasta: string, termos: string[]): string[] =>
  listarArquivos(pasta)
    .filter((arquivo) => arquivo.endsWith('.ts') && !arquivo.endsWith('.spec.ts'))
    .flatMap((arquivo) => {
      const texto = readFileSync(arquivo, 'utf-8');
      const imports = [...texto.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      return imports
        .filter((i) => termos.some((termo) => i.includes(termo)))
        .map((i) => `${arquivo} -> ${i}`);
    });

/** Bibliotecas de framework, banco e nuvem que o "miolo" não pode conhecer. */
const frameworks = ['@nestjs', 'typeorm', 'mssql', '@azure'];

describe('Regras de arquitetura', () => {
  it('domain não depende de application, infrastructure, api nem frameworks', () => {
    expect(importsProibidos('src/domain', ['/application', '/infrastructure', '/api', ...frameworks])).toEqual([]);
  });

  it('application não depende de infrastructure, api nem frameworks', () => {
    expect(importsProibidos('src/application', ['/infrastructure', '/api', ...frameworks])).toEqual([]);
  });

  it('infrastructure não depende da api', () => {
    expect(importsProibidos('src/infrastructure', ['/api'])).toEqual([]);
  });

  it('api não fala direto com o banco nem com a fila', () => {
    expect(importsProibidos('src/api', ['/infrastructure', 'typeorm', 'mssql', '@azure'])).toEqual([]);
  });
});
