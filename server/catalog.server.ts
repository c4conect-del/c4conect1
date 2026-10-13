import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, createHash, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import seed from './seed.json' with { type: 'json' };

const dataDir = resolve(process.env.C4_DATA_DIR || 'data');
mkdirSync(dataDir, { recursive: true, mode: 0o700 });
const db = new DatabaseSync(resolve(dataDir, 'catalog.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, brandSlug TEXT NOT NULL, categoryId TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT, name TEXT NOT NULL, dosage TEXT NOT NULL, price REAL NOT NULL CHECK(price >= 0), onRequest INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS consultants (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY, csrf TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY);`);
if (!db.prepare('SELECT key FROM metadata WHERE key=?').get('seeded')) {
  db.exec('BEGIN');
  try {
    db.prepare('INSERT INTO categories VALUES (?,?)').run('injetaveis', 'Injetáveis');
    db.prepare('INSERT INTO categories VALUES (?,?)').run('orais', 'Orais');
    const insert = db.prepare('INSERT INTO products VALUES (?,?,?,?,?,?,?)');
    for (const brand of seed) for (const category of ['injetaveis', 'orais'] as const) {
      for (const p of brand[category]) insert.run(randomUUID(), brand.slug, category, p.name, p.dosage, p.price, /masteron|primobolan/i.test(p.name) ? 1 : 0);
    }
    db.prepare('INSERT INTO metadata VALUES (?)').run('seeded');
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}

// Import the existing contact once; deleted consultants must stay deleted on restart.
if (!db.prepare('SELECT key FROM metadata WHERE key=?').get('consultants-seeded')) {
  db.exec('BEGIN');
  try {
    db.prepare('INSERT INTO consultants VALUES (?,?,?)').run(randomUUID(), 'Consultor C4', '5511940772894');
    db.prepare('INSERT INTO metadata VALUES (?)').run('consultants-seeded');
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}

type Credentials = { token: string; passwordHash: string; salt: string };
function credentials(): Credentials {
  const file = JSON.parse(readFileSync(resolve(dataDir, 'admin.json'), 'utf8')) as Credentials;
  return { token: process.env.C4_ADMIN_TOKEN || file.token, passwordHash: process.env.C4_ADMIN_PASSWORD_HASH || file.passwordHash, salt: process.env.C4_ADMIN_SALT || file.salt };
}
const hash = (s: string) => createHash('sha256').update(s).digest('hex');
function same(a: string, b: string) { return timingSafeEqual(Buffer.from(hash(a)), Buffer.from(hash(b))); }
function fail(message: string, status = 400): never { throw Object.assign(new Error(message), { status }); }
function catalog() {
  return { consultants: db.prepare('SELECT * FROM consultants ORDER BY rowid').all(), categories: db.prepare('SELECT * FROM categories ORDER BY rowid').all(), products: db.prepare('SELECT * FROM products ORDER BY rowid').all().map(p => ({ ...p, onRequest: Boolean(p.onRequest) })) };
}
function session(request: Request) {
  const cookie = request.headers.get('cookie')?.match(/(?:^|;\s*)c4_admin=([a-f0-9]{64})(?:;|$)/)?.[1];
  const row = cookie && db.prepare('SELECT * FROM sessions WHERE hash=? AND expires>?').get(hash(cookie), Date.now());
  if (!row) fail('Sua sessão expirou. Acesse novamente pelo link privado.', 401);
  return row as { hash: string; csrf: string; expires: number };
}
function checkOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const allowed = process.env.C4_PUBLIC_ORIGIN || new URL(request.url).origin;
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
  return `c4_admin=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${new URL(process.env.C4_PUBLIC_ORIGIN || request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
export async function handleCatalogRequest(request: Request) {
  const headers: Record<string,string> = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
  const json = (data: unknown, status = 200) => Response.json(data, { status, headers });
  try {
    const path = new URL(request.url).pathname.replace(/\/$/, '');
    if (path === '/api/catalog' && request.method === 'GET') return json(catalog());
    if (path === '/api/admin/login' && request.method === 'POST') {
      checkOrigin(request);
      const input = await body(request);
      const key = hash('shared'); // Ignore untrusted forwarded headers. Global cap also protects against distributed attempts.
      db.prepare('DELETE FROM attempts WHERE expires<?').run(Date.now());
      const tries = db.prepare('SELECT count FROM attempts WHERE key=?').get(key);
      const global = db.prepare('SELECT count FROM attempts WHERE key=?').get('global');
      if (Number(tries?.count || 0) >= 5 || Number(global?.count || 0) >= 25) fail('Muitas tentativas. Tente novamente em 15 minutos.', 429);
      const record = db.prepare('INSERT INTO attempts VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1');
      record.run(key, Date.now() + 900000); record.run('global', Date.now() + 900000);
      const c = credentials();
      const token = typeof input.token === 'string' ? input.token : '';
      const password = typeof input.password === 'string' ? input.password : '';
      if (!same(token, c.token) || password.length > 256 || !same(scryptSync(password, c.salt, 64).toString('hex'), c.passwordHash)) fail('Link ou senha inválidos.', 401);
      db.prepare('DELETE FROM attempts WHERE key=?').run(key);
      db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
      const secret = randomBytes(32).toString('hex'); const csrf = randomBytes(32).toString('hex');
      db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(hash(secret), csrf, Date.now() + 28800000);
      headers['Set-Cookie'] = cookie(secret, request);
      return json({ csrf, ...catalog() });
    }
    if (!path.startsWith('/api/admin/')) return json({ error: 'Não encontrado.' }, 404);
    const auth = session(request);
    if (request.method === 'GET' && path === '/api/admin/session') return json({ csrf: auth.csrf, ...catalog() });
    if (request.method === 'GET') return json({ error: 'Não encontrado.' }, 404);
    checkOrigin(request);
    if (!same(request.headers.get('x-csrf-token') || '', auth.csrf)) fail('Solicitação não autorizada.', 403);
    if (path === '/api/admin/logout' && request.method === 'POST') {
      db.prepare('DELETE FROM sessions WHERE hash=?').run(auth.hash);
      headers['Set-Cookie'] = cookie('', request, 0); return json({ ok: true });
    }
    const match = path.match(/^\/api\/admin\/(products|categories|consultants)(?:\/([\w-]+))?$/);
    if (!match) return json({ error: 'Não encontrado.' }, 404);
    const [, kind, id] = match;
    if (!['POST','PUT','DELETE'].includes(request.method) || (request.method === 'POST' ? Boolean(id) : !id)) fail('Operação inválida.', 405);
    if (id && !db.prepare(`SELECT id FROM ${kind} WHERE id=?`).get(id)) fail('Registro não encontrado.', 404);
    if (request.method === 'DELETE') {
      if (kind === 'categories' && db.prepare('SELECT id FROM products WHERE categoryId=? LIMIT 1').get(id!)) fail('Mova ou exclua os produtos desta categoria antes de excluí-la.', 409);
      db.prepare(`DELETE FROM ${kind} WHERE id=?`).run(id!); return json(catalog());
    }
    const input = await body(request); const name = text(input.name, 'Nome');
    if (kind === 'consultants') {
      const rawPhone = text(input.phone, 'WhatsApp', 32);
      if (!/^\+?[\d\s().-]+$/.test(rawPhone)) fail('WhatsApp inválido. Use DDI, DDD e número.');
      const phone = rawPhone.replace(/\D/g, '');
      if (!/^[1-9]\d{9,14}$/.test(phone)) fail('WhatsApp inválido. Use DDI, DDD e número (10 a 15 dígitos).');
      if (db.prepare('SELECT id FROM consultants WHERE phone=? AND id<>?').get(phone, id || '')) fail('Já existe um consultor com este WhatsApp.', 409);
      if (id) db.prepare('UPDATE consultants SET name=?, phone=? WHERE id=?').run(name, phone, id);
      else db.prepare('INSERT INTO consultants VALUES (?,?,?)').run(randomUUID(), name, phone);
    } else if (kind === 'categories') {
      if (db.prepare('SELECT id FROM categories WHERE lower(name)=lower(?) AND id<>?').get(name, id || '')) fail('Já existe uma categoria com este nome.', 409);
      if (id) db.prepare('UPDATE categories SET name=? WHERE id=?').run(name, id);
      else db.prepare('INSERT INTO categories VALUES (?,?)').run(randomUUID(), name);
    } else {
      const brandSlug = text(input.brandSlug, 'Marca'); const categoryId = text(input.categoryId, 'Categoria');
      if (!seed.some(b => b.slug === brandSlug) || !db.prepare('SELECT id FROM categories WHERE id=?').get(categoryId)) fail('Marca ou categoria inexistente.');
      if (typeof input.dosage !== 'string' || input.dosage.length > 160) fail('Dosagem inválida.');
      if (typeof input.price !== 'number' || !Number.isFinite(input.price) || input.price < 0 || input.price > 999999.99) fail('Preço inválido.');
      if (typeof input.onRequest !== 'boolean') fail('Tipo de preço inválido.');
      const values = [brandSlug, categoryId, name, input.dosage.trim(), Math.round(input.price * 100) / 100, input.onRequest ? 1 : 0];
      if (id) db.prepare('UPDATE products SET brandSlug=?, categoryId=?, name=?, dosage=?, price=?, onRequest=? WHERE id=?').run(...values, id);
      else db.prepare('INSERT INTO products VALUES (?,?,?,?,?,?,?)').run(randomUUID(), ...values);
    }
    return json(catalog());
  } catch (error) {
    const e = error as Error & { status?: number };
    if (!e.status) console.error('Catalog API:', e.message);
    return json({ error: e.status ? e.message : 'Não foi possível concluir. Tente novamente.' }, e.status || 500);
  }
}
