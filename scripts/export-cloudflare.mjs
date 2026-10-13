import { DatabaseSync } from 'node:sqlite';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pbkdf2Sync } from 'node:crypto';
const dir = resolve(process.env.C4_DATA_DIR || 'data');
const db = new DatabaseSync(resolve(dir, 'catalog.sqlite'), { readOnly: true });
const quote = v => v === null ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replaceAll("'", "''")}'`;
const lines = ['DELETE FROM brands;'];
for (const table of ['brands', 'brand_logos', 'categories', 'products', 'consultants', 'metadata']) {
  for (const row of db.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()) {
    lines.push(`INSERT ${table === 'metadata' ? 'OR IGNORE ' : ''}INTO ${table} (${Object.keys(row).join(',')}) VALUES (${Object.values(row).map(quote).join(',')});`);
  }
}
writeFileSync(resolve(dir, 'cloudflare-import.sql'), lines.join('\n')+'\n', { mode: 0o600 });
const c = JSON.parse(readFileSync(resolve(dir, 'admin.json'), 'utf8'));
const password = readFileSync('ADMIN-ACCESS.local.md','utf8').match(/^Senha: (.+)$/m)?.[1];
if (!password) throw new Error('Senha local ausente. Configure o administrador antes de exportar.');
writeFileSync(resolve(dir, 'cloudflare-secrets.json'), JSON.stringify({ C4_ADMIN_TOKEN: c.token, C4_ADMIN_SALT: c.salt, C4_ADMIN_PASSWORD_HASH: pbkdf2Sync(password, c.salt, 100000, 32, 'sha256').toString('hex') }), { mode: 0o600 });
db.close();
console.log('Dados do catálogo e secrets preparados em data/ (arquivos privados). Sessões locais não são exportadas.');
