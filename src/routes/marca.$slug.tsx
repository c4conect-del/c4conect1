import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useCatalog, CatalogStatus } from '@/data/catalog';
import { BrandLogo } from '@/components/BrandLogo';
import { ConsultantContact } from '@/components/ConsultantContact';
import { ProductTable } from '@/components/ProductTable';
import { ArrowLeft, Search, Check } from 'lucide-react';
export const Route = createFileRoute('/marca/$slug')({ component: BrandPage, head: () => ({ meta: [{ title: 'Marca • C4 PHARMA' }] }) });
function BrandPage() {
  const { slug } = Route.useParams();
  const { catalog, brands, loading, error } = useCatalog();
  const brand = brands.find(b => b.slug === slug);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState('all'); const [query, setQuery] = useState('');
  if (loading) return <main className="page-content"><CatalogStatus /></main>;
  if (error) return <main className="page-content"><CatalogStatus /><Link to="/catalogo">Voltar para marcas</Link></main>;
  if (!brand) return <main className="page-content"><h1>Marca não encontrada</h1><Link to="/catalogo">Voltar para marcas</Link></main>;
  const products = catalog.products.filter(p => p.brandSlug === slug);
  const chosen = products.filter(p => selected.has(p.id));
  const categories = catalog.categories.filter(c => products.some(p => p.categoryId === c.id));
  const filtered = products.filter(p => (category === 'all' || p.categoryId === category) && `${p.name} ${p.dosage}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  const message = chosen.length ? `Olá! Gostaria de verificar a disponibilidade:\n${chosen.map(p => `• ${p.name} ${p.dosage}`).join('\n')}\nMarca: ${brand.name}` : `Olá! Gostaria de falar sobre os produtos ${brand.name}.`;
  const toggle = (id: string) => setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return <div>
    <header className="app-header"><Link to="/catalogo" className="back-link"><ArrowLeft size={19}/> Marcas</Link><span className="eyebrow">C4 PHARMA</span></header>
    <main className="page-content brand-page">
      <div className="brand-hero"><BrandLogo brand={brand} size={110}/><span className="eyebrow">CATÁLOGO DA MARCA</span><h1>{brand.name}</h1><p>{products.length} produtos • Selecione para consultar</p></div>
      <label className="search-field"><Search size={19}/><input aria-label="Buscar nesta marca" type="search" placeholder="Buscar nesta marca" value={query} onChange={e => setQuery(e.target.value)}/></label>
      <div className="category-tabs"><button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>Todos</button>{categories.map(c => <button key={c.id} className={category === c.id ? 'active' : ''} onClick={() => setCategory(c.id)}>{c.name}</button>)}</div>
      <CatalogStatus />
      {!loading && !error && !filtered.length && <div className="status-box">{products.length ? 'Nenhum produto encontrado para este filtro.' : 'Novidades em breve. Fale com nosso consultor.'}</div>}
      {categories.map(c => <ProductTable key={c.id} title={c.name} products={filtered.filter(p => p.categoryId === c.id)} selectedProducts={selected} onToggleProduct={toggle}/>)}
    </main>
    <div className="consult-bar">{chosen.length > 0 && <div className="selection-summary"><span><Check size={14}/> {chosen.length} selecionado{chosen.length > 1 ? 's' : ''}</span><button onClick={() => setSelected(new Set())}>Limpar</button></div>}<ConsultantContact className="primary-button" message={message} label={chosen.length ? 'Consultar disponibilidade' : 'Falar com consultor'}/></div>
  </div>;
}
