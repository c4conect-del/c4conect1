# Cloudflare Workers + D1

Site: https://c4imports.com

Também disponível em https://www.c4imports.com e https://c4conect1.c4conect1.workers.dev

O acesso privado do admin está em `ADMIN-ACCESS.local.md`.

A publicação usa o Worker `c4conect1` e o banco D1 `c4conect1-catalog`, vinculados à conta configurada em `wrangler.jsonc`. O catálogo, marcas, logos enviadas, produtos, categorias, consultores, sessões e limites de login são persistidos no D1. Em desenvolvimento, `npm run dev` mantém o banco SQLite local.

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

A exportação preserva IDs e alterações locais de marcas, logos, produtos, categorias e consultores. As sessões locais não são exportadas. Não repita a importação em um banco já preenchido: ela não é uma sincronização nem substituição de dados existentes.

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

## Logos por upload

Em Marcas → Adicionar/Editar, envie um arquivo PNG, JPG ou WebP de até 5 MB. O formulário mostra uma prévia; salvar sem enviar outra imagem mantém a logo atual. Novos links externos não são aceitos.

Os arquivos são armazenados em `brand_logos` e `brand_logo_chunks` no D1 (base64 em partes, fora do JSON do catálogo) e entregues por `/api/logos/<id>` com MIME validado, `nosniff` e cache por versão. A API verifica sessão, origem, CSRF, tamanho e assinatura do arquivo. Trocar a logo ou excluir a marca remove a imagem antiga do banco. As logos iniciais continuam como assets do projeto. Faça backup do banco inteiro para preservar as imagens junto com o catálogo.

Os ajustes de escala e posição são salvos na marca, sem alterar a imagem enviada. A mesma prévia e enquadramento são usados no catálogo, página da marca, carrossel e lista do admin.

## Domínio próprio

A configuração de `wrangler.jsonc` inclui rotas para `c4imports.com/*` e `www.c4imports.com/*`, mantendo o endereço `workers.dev` disponível. O domínio está na conta `c4conect@gmail.com`, zona `3edbef57b32496d6dfc5ccb9414fd400`, no plano Free. Na Hostinger, os nameservers são `art.ns.cloudflare.com` e `tricia.ns.cloudflare.com`. Os registros DNS de `c4imports.com` e `www.c4imports.com` precisam continuar com o proxy da Cloudflare ativado (nuvem laranja). As rotas enviam todas as páginas e APIs desses hosts ao Worker; os registros importados não precisam ser excluídos. HTTPS depende da ativação da zona e do certificado Universal SSL na Cloudflare.

O perfil local de autenticação deste projeto é `c4-imports`. Para vincular novamente a pasta ao perfil já autenticado, use `npx wrangler auth activate c4-imports`. O login do admin funciona no novo domínio com o mesmo token e senha pelo caminho `/gestao-c4`; cookies de sessão são específicos de cada endereço.
