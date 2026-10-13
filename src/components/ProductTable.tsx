import { Check, Plus } from 'lucide-react';
import { type CatalogProduct, money } from '@/data/catalog';
export function ProductTable({ title, products, selectedProducts, onToggleProduct }: { title: string; products: CatalogProduct[]; selectedProducts: Set<string>; onToggleProduct: (id: string) => void }) {
  if (!products.length) return null;
  return <section className="product-section"><div className="section-heading"><h2>{title}</h2><span>{products.length} produtos</span></div><div className="product-list">{products.map(p => {
    const selected = selectedProducts.has(p.id);
    return <button key={p.id} className={`product-card ${selected ? 'selected' : ''}`} onClick={() => onToggleProduct(p.id)} aria-pressed={selected}>
      <div className="product-info"><strong>{p.name}</strong><span>{p.dosage || 'Consulte a apresentação'}</span><b>{p.onRequest ? 'A consultar' : money(p.price)}</b></div><span className="select-product">{selected ? <Check size={18}/> : <Plus size={18}/>}</span>
    </button>;
  })}</div></section>;
}
