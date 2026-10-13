# C4 — Catálogo e administração

Interface mobile de 320 a 480px. Em telas maiores, o aplicativo continua centralizado no formato mobile. A administração não tem links no catálogo público.

## Desenvolvimento

Requer Node.js 22.16 ou superior (inclui SQLite nativo).

```sh
npm ci
npm run admin:setup
npm run dev -- --host 0.0.0.0
```

O setup cria `data/admin.json` com token aleatório e hash scrypt da senha e salva o link e a senha no arquivo privado `ADMIN-ACCESS.local.md`. Abra esse arquivo para acessar. O link tem o formato `/gestao-c4#token=...`; o fragmento não é enviado em URLs HTTP e é removido da barra de endereço ao abrir a tela. Reabra o link se precisar recarregar a tela de login.

`npm run admin:rotate` renova token e senha e revoga todas as sessões. Não publique nem compartilhe os arquivos privados ou a pasta `data/`.

## Painel

- Produtos: criar, editar, excluir, filtrar por marca e categoria, pesquisar, ajustar nome, apresentação, preço ou valor sob consulta.
- Consultores: adicionar, editar e excluir nome e WhatsApp com DDI e DDD. O contato original é importado uma vez. Com vários consultores, o catálogo permite escolher quem atenderá; sem contatos, o atendimento fica indisponível. O WhatsApp aceita formatação e é validado e normalizado no servidor; números duplicados são bloqueados.
- Categorias: criar, renomear e excluir. A exclusão é bloqueada enquanto houver produtos vinculados; mova esses produtos primeiro.
- As mudanças são gravadas em `data/catalog.sqlite` e passam a aparecer no catálogo e na busca. Os dados existentes são importados uma única vez, sem reintroduzir produtos excluídos ao reiniciar.
- Acesso exige token e senha; as APIs verificam sessão em todas as operações. Cookie HttpOnly/SameSite Strict, validade de 8 horas, proteção de origem e CSRF. Cinco falhas bloqueiam tentativas por 15 minutos; há também limite global de 25 tentativas por janela.
- Marcas mantêm as identidades e logos existentes. Categorias são os grupos de produtos dentro dessas marcas.

## Produção

Este backend usa **Node.js com disco persistente**, não hospedagem estática nem o runtime Cloudflare Workers. O build do projeto foi configurado para o servidor Node do Nitro.

```sh
npm run build
npm run admin:setup
C4_PUBLIC_ORIGIN=https://seu-dominio.com PORT=3000 npm start
```

Configure seu domínio real em `C4_PUBLIC_ORIGIN`, HTTPS no proxy e um volume persistente para `C4_DATA_DIR` (padrão: `data/`). Execute o setup e o servidor com o mesmo diretório de dados. Mantenha essa pasta fora de qualquer diretório público. Faça backup do banco com uma ferramenta de backup SQLite ou com o servidor parado (incluindo os arquivos WAL/SHM se existirem). Não coloque a senha em variáveis `VITE_*`.

## Verificações

```sh
npx tsc --noEmit
npm run test:admin
npm run build
```

O teste usa um banco temporário e cobre acesso sem sessão, token/senha incorretos, CSRF/origem, CRUD, persistência, integridade de categorias, logout, expiração e bloqueio de tentativas.
