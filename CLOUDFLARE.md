# Cloudflare Workers + D1

Site: https://c4conect1.c4conect1.workers.dev

O acesso privado do admin está em `ADMIN-ACCESS.local.md`.

A publicação usa o Worker `c4conect1` e o banco D1 `c4conect1-catalog`, vinculados à conta configurada em `wrangler.jsonc`. O catálogo, produtos, categorias, consultores, sessões e limites de login são persistidos no D1. Em desenvolvimento, `npm run dev` mantém o banco SQLite local.

## Atualizar a publicação

```sh
npm ci
npm run deploy
```

Os secrets existentes são preservados nos próximos deploys. Não publique `data/`, arquivos de acesso privado nem arquivos `.dev.vars`.

## Configurar um banco pela primeira vez

Use uma conta Cloudflare autenticada com `npx wrangler login`. Configure o ID do banco e da conta em `wrangler.jsonc`. As tabelas são criadas e atualizadas com:

```sh
npm run cf:migrate
```

Para importar o catálogo local existente uma única vez:

```sh
npm run cf:export
npx wrangler d1 execute DB --remote --config wrangler.jsonc --file data/cloudflare-import.sql
```

A exportação preserva IDs e alterações locais de produtos, categorias e consultores. As sessões locais não são exportadas. Não repita a importação em um banco já preenchido: ela não é uma sincronização nem substituição de dados existentes.

## Configurar o acesso privado

`npm run cf:export` também prepara `data/cloudflare-secrets.json`, usando o token e a senha do administrador local. O arquivo contém o token, salt e hash PBKDF2-SHA256 (100.000 iterações) para o runtime Cloudflare; a senha não é enviada nem incluída no build.

Primeira publicação com credenciais, ou atualização após renovar o administrador:

```sh
npm run build
npx wrangler deploy --config dist/server/wrangler.json --secrets-file data/cloudflare-secrets.json
```

O link privado e a senha são entregues em `ADMIN-ACCESS.local.md`, ignorado pelo Git. O token é enviado ao servidor no corpo do login, após ser lido do fragmento do link. A sessão usa cookie HttpOnly, SameSite Strict e Secure no site HTTPS. APIs administrativas validam sessão, origem e CSRF.

Para revogar sessões na Cloudflare durante uma renovação, após exportar e publicar os novos secrets:

```sh
npx wrangler d1 execute DB --remote --config wrangler.jsonc --command 'DELETE FROM sessions'
```

## Testar o Worker localmente

Use a mesma pasta `.wrangler/state` para as migrações e a prévia do Worker. Configure os secrets em `dist/server/.dev.vars` para a prévia (arquivo privado, fora do Git). Execute as migrações com `--local` e importe o snapshot uma única vez antes de iniciar `npm run cf:preview`.

`npm run test:admin` verifica a lógica compartilhada com um banco temporário. `npx tsc --noEmit` verifica os tipos. A autenticação e o CRUD também devem ser testados na prévia do Worker, que usa o runtime real do Cloudflare e D1 local.

Para um servidor Node com disco persistente, continua disponível `npm run build:node` seguido de `npm start`. A publicação padrão de `npm run build` usa Cloudflare.
