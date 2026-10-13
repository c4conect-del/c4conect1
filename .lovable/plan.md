

# Substituir logos padrão das marcas

## O que será feito

Trocar as logos atuais usadas nos cards de marca (página `/catalogo`) e nas páginas individuais de cada marca pelas 7 novas logos enviadas. A logo da C4 PHARMA também será atualizada com a nova versão.

## Mapeamento das novas logos

| Arquivo enviado | Marca |
|---|---|
| LOGOS-01-3.png | Canada Labs |
| LOGOS-02-3.png | Pharmacom Labs |
| LOGOS-03-3.png | Alpha Pharma |
| LOGOS-04-3.png | Gold Premium Series |
| LOGOS-05-3.png | ZPHC |
| LOGOS-06-4.png | Landerlan |
| LOGOS-07-3.png | Cooper Pharma |
| C4_PHARMA-2.png | C4 Pharma |

## Mudanças técnicas

1. **Copiar as 8 imagens** para `src/assets/` substituindo os arquivos atuais:
   - `logo-01.png` ... `logo-07.png` (usados em `src/data/brands.ts`)
   - `c4-pharma.png` (logo principal C4)

2. **Sem alterações de código** — `src/data/brands.ts` já importa esses caminhos, então a substituição dos arquivos atualiza automaticamente:
   - Os cards na grade do catálogo (`BrandCard`)
   - O cabeçalho de cada página de marca (`/marca/$slug`)
   - A logo da C4 onde for referenciada

3. **Carrossel de marcas parceiras** (`BrandCarousel.tsx`) — usa arquivos separados (`carousel-01.png` ... `carousel-07.png`) e **não será afetado**. Ele continua com as logos atuais que você já aprovou no carrossel.

## Observação

Se você quiser que o carrossel de marcas parceiras na home também passe a usar essas mesmas novas logos, me avise — é só copiar os mesmos arquivos para os 7 slots `carousel-XX.png`.

