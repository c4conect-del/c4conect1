import { randomBytes, scryptSync } from 'node:crypto';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const dir = resolve(process.env.C4_DATA_DIR || 'data');
mkdirSync(dir, { recursive: true, mode: 0o700 });
const path = resolve(dir, 'admin.json');
if (existsSync(path) && !process.argv.includes('--rotate')) {
  console.log('Administrador já configurado. Use --rotate para renovar o acesso.');
  process.exit(0);
}
const token = randomBytes(32).toString('hex');
const password = randomBytes(18).toString('base64url');
const salt = randomBytes(32).toString('hex');
writeFileSync(path, JSON.stringify({ token, salt, passwordHash: scryptSync(password, salt, 64).toString('hex') }), { mode: 0o600 });
// Rotation revokes existing sessions on the next startup and immediately when the DB exists.
if (existsSync(resolve(dir, 'catalog.sqlite'))) {
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(resolve(dir, 'catalog.sqlite'));
  db.exec('DELETE FROM sessions'); db.close();
}
const origin = process.env.C4_PUBLIC_ORIGIN || 'http://localhost:8081';
writeFileSync('ADMIN-ACCESS.local.md', `# Acesso privado C4\n\nLink: ${origin}/gestao-c4#token=${token}\n\nSenha: ${password}\n\nGuarde este arquivo em local privado. O token fica no fragmento do link, fora das requisições HTTP.\nPara renovar token e senha: npm run admin:rotate\n`, { mode: 0o600 });
console.log('Acesso salvo em ADMIN-ACCESS.local.md (arquivo privado, ignorado pelo Git).');
