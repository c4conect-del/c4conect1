import { useCatalog } from '@/data/catalog';
import { BrandLogo } from './BrandLogo';
export function BrandCarousel() {
  const { brands } = useCatalog();
  if (!brands.length) return null;
  return <div className="w-full overflow-hidden mask-fade"><p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-4">Marcas parceiras</p><div className="relative"><div className="flex gap-8 animate-marquee whitespace-nowrap">{[...brands, ...brands].map((brand, i) => <div key={`${brand.slug}-${i}`} className="flex h-20 w-32 shrink-0 items-center justify-center"><BrandLogo brand={brand} size={100}/></div>)}</div></div></div>;
}
