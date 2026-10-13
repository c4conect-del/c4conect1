import { randomBytes, randomUUID, createHash, scryptSync, timingSafeEqual } from 'node:crypto';
export type SQLRow = Record<string, string | number | null>;
export type CatalogDatabase = { prepare(sql: string): {
  get(...values: (string | number | null)[]): Promise<SQLRow | undefined>;
  all(...values: (string | number | null)[]): Promise<SQLRow[]>;
  run(...values: (string | number | null)[]): Promise<void>;
} };
export type Credentials = { token: string; passwordHash: string; salt: string; algorithm?: 'pbkdf2' };
async function verifyPassword(password: string, credentials: Credentials) {
  const derived = credentials.algorithm === 'pbkdf2'
    ? Buffer.from(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(credentials.salt), iterations: 100000 }, await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']), 256)).toString('hex')
    : scryptSync(password, credentials.salt, 64).toString('hex');
  return same(derived, credentials.passwordHash);
}
const hash = (s: string) => createHash('sha256').update(s).digest('hex');
function same(a: string, b: string) { return timingSafeEqual(Buffer.from(hash(a)), Buffer.from(hash(b))); }
export function createCatalogHandler(db: CatalogDatabase, credentials: () => Credentials, publicOrigin?: string) {
function fail(message: string, status = 400): never { throw Object.assign(new Error(message), { status }); }
async function catalog(admin = true) {
  const brands = (await db.prepare(admin ? 'SELECT * FROM brands ORDER BY rowid' : 'SELECT * FROM brands WHERE active=1 ORDER BY rowid').all()).map(b => ({ ...b, active: Boolean(b.active) }));
  const products = await db.prepare(admin ? 'SELECT * FROM products ORDER BY rowid' : 'SELECT products.* FROM products JOIN brands ON brands.slug=products.brandSlug WHERE brands.active=1 ORDER BY products.rowid').all();
  return { brands, consultants: await db.prepare('SELECT * FROM consultants ORDER BY rowid').all(), categories: await db.prepare('SELECT * FROM categories ORDER BY rowid').all(), products: products.map(p => ({ ...p, onRequest: Boolean(p.onRequest) })) };
}
async function session(request: Request) {
  const cookie = request.headers.get('cookie')?.match(/(?:^|;\s*)c4_admin=([a-f0-9]{64})(?:;|$)/)?.[1];
  const row = cookie && (await db.prepare('SELECT * FROM sessions WHERE hash=? AND expires>?').get(hash(cookie), Date.now()));
  if (!row) fail('Sua sessão expirou. Acesse novamente pelo link privado.', 401);
  return row as { hash: string; csrf: string; expires: number };
}
function checkOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const allowed = publicOrigin || new URL(request.url).origin;
  if (!origin || origin !== allowed) fail('Origem não autorizada.', 403);
}
function text(value: unknown, label: string, max = 120) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) fail(`${label} inválido.`);
  return value.trim();
}
async function body(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) fail('Formato inválido.', 415);
  const reader = request.body?.getReader();
  if (!reader) fail('Dados ausentes.');
  let size = 0; const chunks: Uint8Array[] = [];
  while (true) { const part = await reader.read(); if (part.done) break; size += part.value.length; if (size > 16384) { await reader.cancel(); fail('Dados muito grandes.', 413); } chunks.push(part.value); }
  try { const parsed = JSON.parse(Buffer.concat(chunks).toString()); if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) fail('Dados inválidos.'); return parsed; } catch { fail('JSON inválido.'); }
}
function cookie(value: string, request: Request, age = 28800) {
  return `c4_admin=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${new URL(publicOrigin || request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
return async function handleCatalogRequest(request: Request) {
  const headers: Record<string,string> = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
  const json = (data: unknown, status = 200) => Response.json(data, { status, headers });
  try {
    const path = new URL(request.url).pathname.replace(/\/$/, '');
    if (path === '/api/catalog' && request.method === 'GET') return json(await catalog(false));
    if (path === '/api/admin/login' && request.method === 'POST') {
      checkOrigin(request);
      const input = await body(request);
      const key = hash('shared'); // Ignore untrusted forwarded headers. Global cap also protects against distributed attempts.
      (await db.prepare('DELETE FROM attempts WHERE expires<?').run(Date.now()));
      const tries = (await db.prepare('SELECT count FROM attempts WHERE key=?').get(key));
      const global = (await db.prepare('SELECT count FROM attempts WHERE key=?').get('global'));
      if (Number(tries?.count || 0) >= 5 || Number(global?.count || 0) >= 25) fail('Muitas tentativas. Tente novamente em 15 minutos.', 429);
      const record = db.prepare('INSERT INTO attempts VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1');
      await record.run(key, Date.now() + 900000); await record.run('global', Date.now() + 900000);
      const c = credentials();
      const token = typeof input.token === 'string' ? input.token : '';
      const password = typeof input.password === 'string' ? input.password : '';
      if (!same(token, c.token) || password.length > 256 || !await verifyPassword(password, c)) fail('Link ou senha inválidos.', 401);
      (await db.prepare('DELETE FROM attempts WHERE key=?').run(key));
      (await db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now()));
      const secret = randomBytes(32).toString('hex'); const csrf = randomBytes(32).toString('hex');
      (await db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(hash(secret), csrf, Date.now() + 28800000));
      headers['Set-Cookie'] = cookie(secret, request);
      return json({ csrf, ...await catalog() });
    }
    if (!path.startsWith('/api/admin/')) return json({ error: 'Não encontrado.' }, 404);
    const auth = await session(request);
    if (request.method === 'GET' && path === '/api/admin/session') return json({ csrf: auth.csrf, ...await catalog() });
    if (request.method === 'GET') return json({ error: 'Não encontrado.' }, 404);
    checkOrigin(request);
    if (!same(request.headers.get('x-csrf-token') || '', auth.csrf)) fail('Solicitação não autorizada.', 403);
    if (path === '/api/admin/logout' && request.method === 'POST') {
      (await db.prepare('DELETE FROM sessions WHERE hash=?').run(auth.hash));
      headers['Set-Cookie'] = cookie('', request, 0); return json({ ok: true });
    }
    if (path === '/api/admin/products/consultation' && request.method === 'POST') {
      const input = await body(request);
      const brandSlug = text(input.brandSlug, 'Marca');
      if (!(await db.prepare('SELECT id FROM brands WHERE slug=?').get(brandSlug))) fail('Selecione uma marca válida.');
      if (!(await db.prepare('SELECT id FROM products WHERE brandSlug=? LIMIT 1').get(brandSlug))) fail('Esta marca não possui produtos.', 409);
      await db.prepare('UPDATE products SET onRequest=1 WHERE brandSlug=?').run(brandSlug);
      return json(await catalog());
    }
    const match = path.match(/^\/api\/admin\/(products|categories|consultants|brands)(?:\/([\w-]+))?$/);
    if (!match) return json({ error: 'Não encontrado.' }, 404);
    const [, kind, id] = match;
    if (!['POST','PUT','DELETE'].includes(request.method) || (request.method === 'POST' ? Boolean(id) : !id)) fail('Operação inválida.', 405);
    if (id && !(await db.prepare(`SELECT id FROM ${kind} WHERE id=?`).get(id))) fail('Registro não encontrado.', 404);
    if (request.method === 'DELETE') {
      if (kind === 'brands') {
        const brand = await db.prepare('SELECT slug FROM brands WHERE id=?').get(id!);
        if (await db.prepare('SELECT id FROM products WHERE brandSlug=? LIMIT 1').get(String(brand!.slug))) fail('Mova ou exclua os produtos desta marca antes de excluí-la.', 409);
      }
      if (kind === 'categories' && (await db.prepare('SELECT id FROM products WHERE categoryId=? LIMIT 1').get(id!))) fail('Mova ou exclua os produtos desta categoria antes de excluí-la.', 409);
      (await db.prepare(`DELETE FROM ${kind} WHERE id=?`).run(id!)); return json(await catalog());
    }
    const input = await body(request); const name = text(input.name, 'Nome');
    if (kind === 'brands') {
      if (typeof input.active !== 'boolean') fail('Status da marca inválido.');
      if (typeof input.logoUrl !== 'string' || input.logoUrl.length > 2048) fail('URL da logo inválida.');
      const logoUrl = input.logoUrl.trim();
      if (logoUrl) { try { const url = new URL(logoUrl); if (url.protocol !== 'https:' || url.username || url.password) fail('Use uma URL HTTPS para a logo.'); } catch { fail('Use uma URL HTTPS válida para a logo.'); } }
      if (await db.prepare('SELECT id FROM brands WHERE lower(name)=lower(?) AND id<>?').get(name, id || '')) fail('Já existe uma marca com este nome.', 409);
      if (id) await db.prepare('UPDATE brands SET name=?, logoUrl=?, active=? WHERE id=?').run(name, logoUrl, input.active ? 1 : 0, id);
      else {
        let slug = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 96).replace(/-$/g, '') || 'marca';
        if (await db.prepare('SELECT id FROM brands WHERE slug=?').get(slug)) slug += '-' + randomUUID().slice(0, 8);
        await db.prepare('INSERT INTO brands VALUES (?,?,?,?,?,?)').run(randomUUID(), slug, name, logoUrl, '', input.active ? 1 : 0);
      }
    } else if (kind === 'consultants') {
      const rawPhone = text(input.phone, 'WhatsApp', 32);
      if (!/^\+?[\d\s().-]+$/.test(rawPhone)) fail('WhatsApp inválido. Use DDI, DDD e número.');
      const phone = rawPhone.replace(/\D/g, '');
      if (!/^[1-9]\d{9,14}$/.test(phone)) fail('WhatsApp inválido. Use DDI, DDD e número (10 a 15 dígitos).');
      if ((await db.prepare('SELECT id FROM consultants WHERE phone=? AND id<>?').get(phone, id || ''))) fail('Já existe um consultor com este WhatsApp.', 409);
      if (id) (await db.prepare('UPDATE consultants SET name=?, phone=? WHERE id=?').run(name, phone, id));
      else (await db.prepare('INSERT INTO consultants VALUES (?,?,?)').run(randomUUID(), name, phone));
    } else if (kind === 'categories') {
      if ((await db.prepare('SELECT id FROM categories WHERE lower(name)=lower(?) AND id<>?').get(name, id || ''))) fail('Já existe uma categoria com este nome.', 409);
      if (id) (await db.prepare('UPDATE categories SET name=? WHERE id=?').run(name, id));
      else (await db.prepare('INSERT INTO categories VALUES (?,?)').run(randomUUID(), name));
    } else {
      const brandSlug = text(input.brandSlug, 'Marca'); const categoryId = text(input.categoryId, 'Categoria');
      if (!(await db.prepare('SELECT id FROM brands WHERE slug=?').get(brandSlug)) || !(await db.prepare('SELECT id FROM categories WHERE id=?').get(categoryId))) fail('Marca ou categoria inexistente.');
      if (typeof input.dosage !== 'string' || input.dosage.length > 160) fail('Dosagem inválida.');
      if (typeof input.price !== 'number' || !Number.isFinite(input.price) || input.price < 0 || input.price > 999999.99) fail('Preço inválido.');
      if (typeof input.onRequest !== 'boolean') fail('Tipo de preço inválido.');
      const values = [brandSlug, categoryId, name, input.dosage.trim(), Math.round(input.price * 100) / 100, input.onRequest ? 1 : 0];
      if (id) (await db.prepare('UPDATE products SET brandSlug=?, categoryId=?, name=?, dosage=?, price=?, onRequest=? WHERE id=?').run(...values, id));
      else (await db.prepare('INSERT INTO products VALUES (?,?,?,?,?,?,?)').run(randomUUID(), ...values));
    }
    return json(await catalog());
  } catch (error) {
    const e = error as Error & { status?: number };
    if (!e.status) console.error('Catalog API:', e.message);
    return json({ error: e.status ? e.message : 'Não foi possível concluir. Tente novamente.' }, e.status || 500);
  }
}

}
