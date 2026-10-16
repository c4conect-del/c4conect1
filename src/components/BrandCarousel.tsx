import { Link } from '@tanstack/react-router';
import { useCatalog } from '@/data/catalog';
import { BrandLogo } from './BrandLogo';
export function BrandCarousel() {
  const { brands, loading } = useCatalog();
  if (!loading && !brands.length) return null;
  return <section className="brand-partners" aria-label="Marcas parceiras" aria-busy={loading}><p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-4">Marcas parceiras</p><div className="brand-strip">{brands.map(brand => <Link key={brand.slug} to="/marca/$slug" params={{ slug: brand.slug }} aria-label={`Ver produtos ${brand.name}`}><BrandLogo brand={brand} size={80}/></Link>)}</div></section>;
}
