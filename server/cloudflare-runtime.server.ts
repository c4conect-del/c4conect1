import { env } from 'cloudflare:workers';
import { createCatalogHandler, type CatalogDatabase } from './catalog.server';
type Statement = { bind(...values: (string | number | null)[]): Statement; first(): Promise<import('./catalog.server').SQLRow | null>; all(): Promise<{ results: import('./catalog.server').SQLRow[] }>; run(): Promise<unknown> };
type Bindings = { DB: { prepare(sql: string): Statement }; C4_ADMIN_TOKEN: string; C4_ADMIN_PASSWORD_HASH: string; C4_ADMIN_SALT: string; C4_PUBLIC_ORIGIN?: string };
export function handleCatalogRequest(request: Request) {
  const bindings = env as unknown as Bindings;
  const storage: CatalogDatabase = {
    prepare(sql) {
      const statement = bindings.DB.prepare(sql);
      return {
        get: async (...values) => (await statement.bind(...values).first()) || undefined,
        all: async (...values) => (await statement.bind(...values).all()).results,
        run: async (...values) => { await statement.bind(...values).run(); },
      };
    },
  };
  return createCatalogHandler(storage, () => {
    if (!bindings.C4_ADMIN_TOKEN || !bindings.C4_ADMIN_PASSWORD_HASH || !bindings.C4_ADMIN_SALT) throw new Error('Credenciais do administrador não configuradas.');
    return { token: bindings.C4_ADMIN_TOKEN, passwordHash: bindings.C4_ADMIN_PASSWORD_HASH, salt: bindings.C4_ADMIN_SALT, algorithm: 'pbkdf2' };
  }, bindings.C4_PUBLIC_ORIGIN)(request);
}
