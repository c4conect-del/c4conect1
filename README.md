# C4 IMPORTS

Crie um sistema web interativo estilo aplicativo premium para a marca C4 IMPORTS, uma linha multimarca da C4 LABS.

O projeto deve ter estética DARK, futurista, premium e agressiva, com iluminação neon amarela (#ffe700) e detalhes em dourado.

A experiência deve ser fluida, com animações suaves no estilo Apple, com transições elegantes, motion blur leve e carregamento rápido.

--------------------------------------

🎯 ESTRUTURA PRINCIPAL

HOME (HUB DE MARCAS)

- Fundo preto profundo com partículas sutis (efeito energia/laboratório)

- Título central:

  "C4 IMPORTS"

  Subtítulo:

  "Selecione a marca"

- Grid responsivo com botões (cards clicáveis)

Cada botão representa uma marca com sua logo centralizada

Marcas:

1. ZPHC

2. Landerlan

3. Cooper Pharma

4. Pharmacom Labs

5. Alpha Pharma

6. Gold Premium Series

7. Canada Labs

8. C4 IMPORTS (marca principal)

--------------------------------------

🧩 BOTÕES DAS MARCAS

Cada marca deve ser um CARD INTERATIVO com:

- Fundo glassmorphism escuro

- Glow ao passar o mouse

- Leve escala (zoom 1.05)

- Sombra suave

- Logo centralizada

- Nome da marca abaixo

AÇÃO:

Ao clicar → transição suave → abre página da marca

--------------------------------------

📄 PÁGINA INTERNA DE CADA MARCA

Cada marca terá sua própria página com:

- Fundo escuro com identidade visual da marca (cor predominante da logo)

- Nome grande da marca no topo

- Animação de entrada suave

SEÇÃO PRINCIPAL:

Tabela de produtos organizada em:

- Injetáveis

- Orais

Cada item com:

- Nome

- Dosagem

- Preço

--------------------------------------

📊 DADOS DAS TABELAS

Utilizar os dados do catálogo fornecido.

Exemplo:

Marca: LANDERLAN

Injetáveis:

- Enantato 250mg — 125,00

- Durateston 250mg — 50,00

- Cipionato 6ml — 80,00

...

Orais:

- Oxandrolona 5mg — 325,00

- Diana 10mg — 135,00

...

(Repetir estrutura para todas as marcas)

--------------------------------------

🔘 BOTÕES INTERNOS

Cada página deve conter:

1. Botão fixo no topo:

"← Voltar para marcas"

2. Botão de ação:

"Falar com consultor"

Link:

https://wa.me/5511940772894

--------------------------------------

🎨 DESIGN SYSTEM

- Tipografia moderna (sem serifa)

- Destaques em amarelo neon (#ffe700)

- Branco para textos principais

- Cinza para secundários

- Efeitos:

Glow leve

Glassmorphism

Blur de fundo

Reflexos sutis

--------------------------------------

⚡ ANIMAÇÕES

- Entrada de elementos com fade + slide

- Hover com glow

- Transição entre páginas suave (tipo app)

- Scroll fluido

--------------------------------------

📱 RESPONSIVIDADE

- Mobile first

- Botões grandes

- Navegação simples estilo app

--------------------------------------

🚀 DIFERENCIAL

O sistema deve parecer um catálogo interativo premium, como um app de vendas moderno, não um site comum.

Experiência rápida, fluida e visualmente impactante.

--------------------------------------

IMPORTANTE:

- Manter performance alta

- Evitar exagero de efeitos pesados

- Foco em conversão e navegação rápida

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://c4conect1.c4conect1.workers.dev

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c6d15691-3b69-4d88-a902-e9fddd849fbc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Administração e versão mobile

A versão atual inclui catálogo persistente e painel privado. Consulte [ADMIN-README.md](./ADMIN-README.md) para configuração, acesso, backup e execução em produção. A publicação usa Cloudflare Workers e D1; veja [CLOUDFLARE.md](./CLOUDFLARE.md). O desenvolvimento local mantém SQLite.
