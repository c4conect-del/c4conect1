# C4 IMPORTS — Catálogo e administração

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

- Preços: marque “A consultar” na edição individual. Para aplicar em lote, filtre uma marca e use “Selecionar todos da marca” → “Aplicar A consultar”. A ação inclui todos os produtos da marca, independentemente dos filtros de categoria e busca; os preços numéricos são preservados para reativação individual.
- Marcas: cadastrar, editar nome e logo por upload (PNG, JPG ou WebP de até 5 MB), com prévia antes de salvar; ampliar de 50% a 300%, ajustar posição horizontal/vertical, centralizar e restaurar o ajuste; ativar/desativar e excluir quando não houver produtos vinculados. Marcas desativadas e seus produtos ficam ocultos no catálogo, na busca e no carrossel. Os produtos continuam disponíveis no admin para edição ou transferência. Os links da marca são mantidos ao renomear.
- Produtos: criar, editar, excluir, filtrar por marca e categoria, pesquisar, ajustar nome, apresentação, preço ou valor sob consulta.
- Consultores: adicionar, editar e excluir nome e WhatsApp com DDI e DDD. O contato original é importado uma vez. Com vários consultores, o catálogo permite escolher quem atenderá; sem contatos, o atendimento fica indisponível. O WhatsApp aceita formatação e é validado e normalizado no servidor; números duplicados são bloqueados.
- Categorias: criar, renomear e excluir. A exclusão é bloqueada enquanto houver produtos vinculados; mova esses produtos primeiro.
- As mudanças são gravadas em `data/catalog.sqlite` e passam a aparecer no catálogo e na busca. Os dados existentes são importados uma única vez, sem reintroduzir produtos excluídos ao reiniciar.
- Acesso exige token e senha; as APIs verificam sessão em todas as operações. Cookie HttpOnly/SameSite Strict, validade de 8 horas, proteção de origem e CSRF. Cinco falhas bloqueiam tentativas por 15 minutos; há também limite global de 25 tentativas por janela.
- As marcas iniciais mantêm suas logos; novas marcas podem enviar uma imagem pelo celular/computador ou usar as iniciais do nome. Categorias são os grupos de produtos dentro dessas marcas.

## Produção

A publicação padrão usa **Cloudflare Workers + D1**. Consulte [CLOUDFLARE.md](./CLOUDFLARE.md) para deploy, migração e secrets. O banco SQLite em disco é usado no desenvolvimento local.

Para uma instalação alternativa em **Node.js com disco persistente**, use o build específico abaixo.

```sh
npm run build:node
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

O teste usa um banco temporário e cobre acesso sem sessão, token/senha incorretos, CSRF/origem, CRUD, persistência, integridade de categorias, logout, expiração e bloqueio de tentativas. Também verifica upload autenticado, formatos e limite de tamanho, entrega da imagem, persistência e limpeza ao trocar/excluir logos.
