import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useCatalog } from "@/data/catalog";

interface SearchResult {
  productName: string;
  dosage: string;
  brandName: string;
  brandSlug: string;
  type: string;
}

export function ProductSearch() {
  const { catalog, brands } = useCatalog();
  const allProducts: SearchResult[] = catalog.products.map(p => ({ productName: p.name, dosage: p.dosage, brandName: brands.find(b => b.slug === p.brandSlug)?.name || p.brandSlug, brandSlug: p.brandSlug, type: catalog.categories.find(c => c.id === p.categoryId)?.name || "" }));
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = query.length >= 2
    ? allProducts.filter((p) =>
        p.productName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 15)
    : [];

  // Group by brand
  const grouped = filtered.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.brandSlug]) acc[r.brandSlug] = [];
    acc[r.brandSlug].push(r);
    return acc;
  }, {});

  return (
    <div ref={ref} className="relative w-full max-w-md mx-auto mb-5 animate-fade-in">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="search"
          aria-label="Buscar produto no catálogo"
          placeholder="Buscar produto..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-xl glass neon-border-glow pl-10 pr-4 py-3 text-base text-foreground placeholder:text-muted-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl glass neon-border-glow overflow-hidden shadow-2xl max-h-80 overflow-y-auto">
          {Object.entries(grouped).map(([slug, items]) => (
            <div key={slug}>
              <div className="px-4 py-2 text-xs font-bold text-primary uppercase tracking-wider border-b border-border/30">
                {items[0].brandName}
              </div>
              {items.map((item, i) => (
                <Link
                  key={`${slug}-${item.productName}-${item.dosage}-${i}`}
                  to="/marca/$slug"
                  params={{ slug }}
                  className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors"
                  onClick={() => { setOpen(false); setQuery(""); }}
                >
                  <span className="font-medium text-foreground">{item.productName} <span className="text-muted-foreground">{item.dosage}</span></span>
                  <span className="text-xs text-muted-foreground">{item.type}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
      {open && query.length >= 2 && filtered.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl glass neon-border-glow p-4 text-center text-sm text-muted-foreground">
          Nenhum produto encontrado
        </div>
      )}
    </div>
  );
}
