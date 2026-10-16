import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandCarousel } from "@/components/BrandCarousel";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ArrowRight, ShieldCheck, Truck, CreditCard, PackageCheck, AlertTriangle, Lock } from "lucide-react";
const logoC4 = "/c4-imports.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "C4 IMPORTS — Distribuidora de Produtos Importados" },
      { name: "description", content: "C4 IMPORTS — Distribuidora oficial de produtos 100% originais. Confiabilidade, credibilidade e qualidade comprovadas." },
      { property: "og:title", content: "C4 IMPORTS — Distribuidora de Produtos Importados" },
      { property: "og:description", content: "Produtos 100% originais. Confiabilidade, credibilidade e qualidade." },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center px-4 py-10 ">
        {/* HERO */}
        <div className="mb-8 flex flex-col items-center animate-fade-in">
          <img
            src={logoC4}
            alt="C4 IMPORTS"
            width={986}
            height={889}
            decoding="async"
            fetchPriority="high"
            className="h-32 w-36 object-contain  "
          />
          <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-foreground  ">
            C4 IMPORTS
          </h1>
          <p className="mt-2 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground ">
            Distribuidora Oficial
          </p>
        </div>

        {/* Partner brand logos — infinite carousel */}
        <div className="w-full mb-8 animate-fade-in-up">
          <BrandCarousel />
        </div>

        {/* CTA — Acessar tabela */}
        <Link
          to="/catalogo"
          preload="intent"
          className="group relative mb-10 inline-flex w-full max-w-md items-center justify-between gap-4 rounded-2xl bg-primary px-6 py-5 font-semibold text-primary-foreground  transition-colors active:scale-[0.99] animate-fade-in-up"
        >
          <div className="flex flex-col items-start">
            <span className="text-lg ">Ver catálogo</span>
            <span className="text-xs font-medium normal-case tracking-normal opacity-80">Produtos organizados por marca</span>
          </div>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Sobre */}
        <section className="glass mb-6 w-full rounded-2xl p-6  animate-fade-in-up">
          <h2 className="mb-4 text-lg font-semibold text-foreground  ">
            Sobre a C4 Imports
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground ">
            <p className="font-semibold text-foreground">
              AGORA A C4 É UMA DISTRIBUIDORA DE PRODUTOS IMPORTADOS.
            </p>
            <p>
              Somos mais que um distribuidor: temos <span className="font-semibold text-foreground">confiabilidade, credibilidade e confiança</span>, que se conquista com anos de mercado.
            </p>
            <p>
              Trabalhamos exclusivamente com produtos <span className="font-semibold text-primary">100% originais</span> e livres de falsificações.
            </p>
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-foreground">
              <AlertTriangle className="mr-2 inline h-4 w-4 text-destructive" />
              Desconfie de preços baixos. Não seja enganado — o barato sai caro.
            </p>
            <p className="text-center text-sm font-medium text-muted-foreground  ">
              C4 é qualidade e confiança!
            </p>
          </div>
        </section>

        {/* Informações de compra */}
        <section className="glass mb-6 w-full rounded-2xl p-6  animate-fade-in-up">
          <h2 className="mb-5 text-lg font-semibold text-foreground  ">
            Informações de Compra
          </h2>

          <div className="space-y-5">
            {/* Pagamento */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Formas de Pagamento</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-bold text-primary">Somente PIX.</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  ⚠️ Não insira o nome de produtos na descrição do comprovante de pagamento. Sempre solicite a conta antes de realizar uma nova compra; pagamentos sem nossa autorização não são de nossa responsabilidade.
                </p>
              </div>
            </div>

            {/* Envio */}
            <div className="flex gap-4 border-t border-border/40 pt-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Prazo de Envio</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">3 a 7 dias úteis</span> após a confirmação do pagamento.
                </p>
              </div>
            </div>

            {/* Rastreio */}
            <div className="flex gap-4 border-t border-border/40 pt-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PackageCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Código de Rastreio</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fornecido em até <span className="font-semibold text-foreground">24 horas úteis</span> após o envio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Seguro */}
        <section className="glass mb-6 w-full rounded-2xl p-6  animate-fade-in-up">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground  ">Seguro</h2>
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground ">
            <p className="font-semibold text-foreground">
              O seguro é opcional e garante o reenvio em caso de extravio, furto ou apreensão.
            </p>
            <p>
              O seguro é <span className="font-bold text-primary">30% do valor total da compra</span>. Caso o pedido chegue tudo certo e não seja necessário acionar o seguro, esse valor é revertido como <span className="font-semibold text-foreground">cashback de desconto</span> na próxima compra.
            </p>
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-foreground">
              <AlertTriangle className="mr-2 inline h-4 w-4 text-destructive" />
              Se o cliente fornecer endereço ou CEP incorretos e a encomenda for extraviada, não nos responsabilizamos — mesmo com o seguro pago.
            </p>
          </div>
        </section>

        {/* Recebimento */}
        <section className="glass mb-10 w-full rounded-2xl p-6  animate-fade-in-up">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground  ">Recebimento da Mercadoria</h2>
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground ">
            <p>
              <span className="font-semibold text-foreground">Filme a abertura da caixa.</span> O vídeo deve ser 100% nítido, mostrando a caixa por toda a filmagem e o conteúdo ao ser retirado. Nosso controle é rigoroso — fotografamos todos os pedidos antes do envio.
            </p>
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-foreground">
              <AlertTriangle className="mr-2 inline h-4 w-4 text-destructive" />
              Não nos responsabilizamos por formulários preenchidos incorretamente ou incompletos. O pedido será perdido e não haverá reenvio.
            </p>
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-foreground">
              <AlertTriangle className="mr-2 inline h-4 w-4 text-destructive" />
              Se a caixa chegar danificada, aberta ou violada, <span className="font-bold">recuse a entrega</span>. Caso contrário, não nos responsabilizamos — mesmo com o seguro pago.
            </p>
            <p className="pt-2 text-center text-base font-semibold text-primary">
              Obrigado pela preferência.
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <Link
          to="/catalogo"
          preload="intent"
          className="group inline-flex w-full max-w-md items-center justify-center gap-3 rounded-2xl border-2 border-primary bg-transparent px-6 py-4 font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <span>Ver catálogo</span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
