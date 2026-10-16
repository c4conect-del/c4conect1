import sharp from 'sharp';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const apply = process.argv.includes('--apply');
const base = process.env.C4_SITE_ORIGIN || 'https://c4imports.com';
const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
let token;
async function query(sql, params = []) {
  if (!token) token = readFileSync(resolve(process.env.HOME, '.wrangler/config/c4-imports.toml'), 'utf8').match(/^oauth_token\s*=\s*"([^\"]+)"/m)?.[1];
  if (!token) throw new Error('Autorize o perfil c4-imports antes de aplicar.');
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${config.account_id}/d1/database/${config.d1_databases[0].database_id}/query`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ sql, params }) });
  const result = await response.json();
  if (!response.ok || !result.success || result.result.some(item => !item.success)) throw new Error('Não foi possível atualizar a prévia no D1.');
  return result.result[0].results;
}
const brands = apply ? await query('SELECT name, logoUrl FROM brands') : (await (await fetch(`${base}/api/catalog`)).json()).brands;
mkdirSync('data/optimized-logos', { recursive: true });
let before = 0; let after = 0;
for (const brand of brands) {
  const id = brand.logoUrl.match(/^\/api\/logos\/([a-f0-9-]{36})$/)?.[1];
  if (!id) continue;
  const response = await fetch(`${base}${brand.logoUrl}`);
  if (!response.ok) throw new Error(`Falha ao carregar a logo de ${brand.name}.`);
  const original = Buffer.from(await response.arrayBuffer());
  let preview = await sharp(original).rotate().resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true }).webp({ quality: 86 }).toBuffer();
  if (preview.length > 512 * 1024) preview = await sharp(original).rotate().resize({ width: 768, height: 768, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  if (preview.length > 512 * 1024) throw new Error(`Prévia muito grande: ${brand.name}.`);
  writeFileSync(`data/optimized-logos/${id}.webp`, preview);
  if (apply) await query("INSERT INTO brand_logos (id,mime,data) SELECT ?,?,? WHERE EXISTS (SELECT 1 FROM brand_logos WHERE id=?) AND EXISTS (SELECT 1 FROM brands WHERE logoUrl=?) ON CONFLICT(id) DO UPDATE SET mime=excluded.mime,data=excluded.data", [`${id}-preview`, 'image/webp', preview.toString('base64'), id, brand.logoUrl]);
  before += original.length; after += preview.length;
  console.log(`${brand.name}: ${Math.round(original.length / 1024)} KB → ${Math.round(preview.length / 1024)} KB`);
}
console.log(`${apply ? 'Prévia aplicada' : 'Simulação'}: ${(before / 1048576).toFixed(2)} MB → ${(after / 1048576).toFixed(2)} MB. Originais preservados.`);
