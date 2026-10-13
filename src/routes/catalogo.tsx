import { createFileRoute, Link } from '@tanstack/react-router';
import { ConsultantContact } from '@/components/ConsultantContact';
import { BrandCard } from '@/components/BrandCard';
import { ProductSearch } from '@/components/ProductSearch';
import { FreightChecker } from '@/components/FreightChecker';
import { useCatalog, CatalogStatus } from '@/data/catalog';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import logo from '@/assets/c4-pharma.png';
export const Route = createFileRoute('/catalogo')({
  head: () => ({ meta: [{ title: 'Catálogo • C4 PHARMA' }] }),
  component: CatalogoPage,
});
function CatalogoPage() {
  const { catalog, brands, loading, error } = useCatalog();
  return <div className="catalog-page">
    <header className="app-header"><Link to="/" className="icon-button" aria-label="Voltar ao início"><ArrowLeft size={20} /></Link><span>C4 <b>PHARMA</b></span><span className="live-dot">CATÁLOGO</span></header>
    <main className="page-content">
      <div className="catalog-hero"><div><span className="eyebrow">SEU CATÁLOGO, NA PALMA DA MÃO</span><h1>Qualidade.<br /><em>Sem limites.</em></h1><p>Encontre sua marca. Explore os produtos.</p></div><img src={logo} alt="C4 Pharma" width="94" height="94" /></div>
      <ProductSearch />
      <CatalogStatus />
      <div className="section-heading"><div><span className="eyebrow">MULTIMARCA</span><h2>Escolha sua marca</h2></div><span>{brands.length} marcas <ArrowUpRight size={14}/></span></div>
      {!loading && !error && !brands.length && <p className="status-box">Nenhuma marca disponível no momento.</p>}
      <div className="brand-grid">{brands.map((brand, i) => <BrandCard key={brand.slug} brand={brand} index={i} count={catalog.products.filter(p => p.brandSlug === brand.slug).length} />)}</div>
      <div className="freight-section"><FreightChecker /></div>
      <div className="catalog-footer"><span className="eyebrow">C4 PHARMA</span><p>Uma experiência feita para você.</p></div>
    </main>
    <nav className="bottom-nav"><Link to="/" className="nav-item">Início</Link><Link to="/catalogo" className="nav-item active">Catálogo</Link><ConsultantContact className="nav-item"/></nav>
  </div>;
}
