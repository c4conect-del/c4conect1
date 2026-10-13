import { useState, useMemo } from "react";
import { Truck, ChevronDown, MapPin } from "lucide-react";

const freightRates = [
  { region: "SP", price: 48 },
  { region: "RJ, ES, MG, PR, SC", price: 70 },
  { region: "DF", price: 72 },
  { region: "MT", price: 75 },
  { region: "GO", price: 76 },
  { region: "BA, CE, MS", price: 80 },
  { region: "MA", price: 90 },
  { region: "PB, RN, RS", price: 100 },
  { region: "PA, PI, TO", price: 110 },
  { region: "AL, PE, SE", price: 120 },
  { region: "AP, AM, RR", price: 120 },
  { region: "RO", price: 170 },
];

const ufList: { uf: string; name: string }[] = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
];

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function findPriceForUf(uf: string): number | null {
  if (!uf) return null;
  const match = freightRates.find((r) =>
    r.region.split(",").map((s) => s.trim()).includes(uf)
  );
  return match ? match.price : null;
}

export function FreightChecker() {
  const [open, setOpen] = useState(false);
  const [selectedUf, setSelectedUf] = useState("");

  const calculatedPrice = useMemo(() => findPriceForUf(selectedUf), [selectedUf]);
  const selectedName = ufList.find((u) => u.uf === selectedUf)?.name;

  return (
    <div className="w-full mb-8 animate-fade-in">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 rounded-xl glass neon-border-glow px-4 py-3 transition-all hover:bg-primary/5"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-primary neon-glow">Verificar Frete</p>
            <p className="text-xs text-muted-foreground">Envio por transportadora</p>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-primary transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="mt-3 overflow-hidden rounded-xl glass neon-border-glow animate-fade-in-up">
          {/* UF Selector */}
          <div className="border-b border-border/30 p-4">
            <label htmlFor="uf-select" className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Selecione seu estado
            </label>
            <div className="relative">
              <select
                id="uf-select"
                value={selectedUf}
                onChange={(e) => setSelectedUf(e.target.value)}
                className="w-full appearance-none rounded-lg border border-border/50 bg-background/50 px-3 py-2.5 pr-10 text-sm font-medium text-foreground transition-colors hover:border-primary/50 focus:border-primary focus:outline-none"
              >
                <option value="">— Escolha a UF —</option>
                {ufList.map((u) => (
                  <option key={u.uf} value={u.uf}>
                    {u.uf} — {u.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            {selectedUf && (
              <div className="mt-3 rounded-lg bg-primary/10 border border-primary/30 p-3 animate-fade-in">
                {calculatedPrice !== null ? (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">{selectedName}</p>
                      <p className="text-sm font-semibold text-foreground">Valor do frete</p>
                    </div>
                    <p className="text-2xl font-black text-primary neon-glow">
                      {formatPrice(calculatedPrice)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    Frete sob consulta para este estado.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-border/30 px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">
              Prazo de entrega: 3 a 7 dias úteis após postagem
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
