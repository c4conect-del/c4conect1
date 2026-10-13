import { useEffect, useRef, useState } from 'react';
import { CheckCheck, X } from 'lucide-react';
import { type CatalogProduct, type CatalogBrand } from '@/data/catalog';

export function BrandConsultation({ brands, brandSlug, products, busy, error, onMutate }: {
  brands: CatalogBrand[];
  brandSlug: string;
  products: CatalogProduct[];
  busy: boolean;
  error: string;
  onMutate: (path: string, method: string, data?: unknown) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const brand = brands.find(b => b.slug === brandSlug);
  const brandProducts = products.filter(p => p.brandSlug === brandSlug);
  const pendingCount = brandProducts.filter(p => !p.onRequest).length;
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  if (!brand) return <p className="bulk-hint">Selecione uma marca acima para colocar todos os seus produtos como “A consultar”.</p>;
  async function apply() {
    setSubmitted(true);
    if (await onMutate('/api/admin/products/consultation', 'POST', { brandSlug })) setOpen(false);
  }
  return <div className="brand-pricing">
    <div><strong>Preço por consulta</strong><p>{brandProducts.length} produtos de {brand.name}</p></div>
    <button className="secondary-button bulk-price-button" disabled={busy || !pendingCount} onClick={() => { setSubmitted(false); setOpen(true); }}><CheckCheck size={18}/>{pendingCount ? 'Selecionar todos da marca' : brandProducts.length ? 'Todos já estão A consultar' : 'Nenhum produto nesta marca'}</button>
    <dialog ref={dialog} className="admin-modal" aria-label="Aplicar A consultar à marca" onCancel={e => { e.preventDefault(); if (!busy) setOpen(false); }}>
      <div className="modal-handle"/><div className="section-heading"><h2>A consultar em toda a marca?</h2><button className="icon-button" aria-label="Fechar" disabled={busy} onClick={() => setOpen(false)}><X size={20}/></button></div>
      <p className="delete-copy">Os <strong>{brandProducts.length} produtos de {brand.name}</strong> serão exibidos como <strong>“A consultar”</strong>, incluindo os que estão fora dos filtros de busca e categoria.</p>
      <p className="consultant-help">Os preços cadastrados são preservados. Para voltar a exibir um preço, edite o produto e desmarque “A consultar”.</p>
      {submitted && error && <p className="error-message" role="alert">{error}</p>}
      <div className="modal-actions"><button className="secondary-button" disabled={busy} onClick={() => setOpen(false)}>Cancelar</button><button className="primary-button" disabled={busy} onClick={() => void apply()}>{busy ? 'Aplicando…' : 'Aplicar A consultar'}</button></div>
    </dialog>
  </div>;
}
