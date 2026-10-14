import { logoChunksMigration } from './logo-chunks-migration.ts';
import { logoMigration } from './logo-migration.ts';
import { brandMigration } from './brand-migration.ts';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import seed from './seed.json' with { type: 'json' };
import { createCatalogHandler, type CatalogDatabase, type SQLRow } from './catalog.server.ts';
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

db.exec('BEGIN');
try { db.exec(brandMigration); db.exec(logoMigration); db.exec(logoChunksMigration); db.exec('COMMIT'); } catch (error) { db.exec('ROLLBACK'); throw error; }

const storage: CatalogDatabase = {
  prepare(sql) {
    const statement = db.prepare(sql);
    return {
      get: async (...values) => statement.get(...values) as SQLRow | undefined,
      all: async (...values) => statement.all(...values) as SQLRow[],
      run: async (...values) => { statement.run(...values); },
    };
  },
};
export const handleCatalogRequest = createCatalogHandler(storage, credentials, process.env.C4_PUBLIC_ORIGIN);
