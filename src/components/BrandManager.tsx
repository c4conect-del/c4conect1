import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Power, X, Upload } from 'lucide-react';
import { brandView, type CatalogBrand, type CatalogProduct } from '@/data/catalog';
import { BrandLogo } from './BrandLogo';
export function BrandManager({ brands, products, busy, error, onMutate }: {
  brands: CatalogBrand[]; products: CatalogProduct[]; busy: boolean; error: string;
  onMutate: (path: string, method: string, data?: unknown) => Promise<boolean>;
}) {
  const [action, setAction] = useState<'edit' | 'delete' | 'status' | null>(null);
  const [brand, setBrand] = useState<CatalogBrand | null>(null);
  const [name, setName] = useState(''); const [logo, setLogo] = useState<File | null>(null); const [preview, setPreview] = useState(''); const [uploadError, setUploadError] = useState(''); const [active, setActive] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { if (!logo) { setPreview(''); return; } const url = URL.createObjectURL(logo); setPreview(url); return () => URL.revokeObjectURL(url); }, [logo]);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (action) dialog.current?.showModal(); else dialog.current?.close(); }, [action]);
  function open(value?: CatalogBrand, mode: 'edit' | 'delete' | 'status' = 'edit') {
    setBrand(value || null); setName(value?.name || ''); setLogo(null); setUploadError(''); setActive(value?.active ?? true); setSubmitted(false); setAction(mode);
  }
  async function save() {
    setSubmitted(true);
    if (uploadError) return;
    let value: unknown;
    if (action === 'edit') {
      const form = new FormData(); form.set('name', name); form.set('active', String(active)); if (logo) form.set('logo', logo); value = form;
    } else if (brand) value = { ...brand, active: !brand.active };
    if (await onMutate(`/api/admin/brands${brand ? `/${brand.id}` : ''}`, action === 'delete' ? 'DELETE' : brand ? 'PUT' : 'POST', action === 'delete' ? undefined : value)) setAction(null);
  }
  return <>
    <div className="section-heading"><h2>Marcas ({brands.length})</h2><button className="add-button" disabled={busy} onClick={() => open()}><Plus size={16}/> Adicionar</button></div>
    <p className="consultant-help">Marcas ativas aparecem no catálogo. Desativar mantém os produtos e permite reativar a marca depois.</p>
    <div className="admin-list">{brands.map(b => { const count = products.filter(p => p.brandSlug === b.slug).length; return <article key={b.id} className="admin-item"><div className="brand-admin-heading"><BrandLogo brand={brandView(b)} size={54}/><div><h3>{b.name}</h3><p>{count} produtos • <span className={b.active ? 'brand-active' : ''}>{b.active ? 'Ativa' : 'Desativada'}</span></p></div></div><div className="brand-admin-actions"><button disabled={busy} onClick={() => open(b)} aria-label={`Editar ${b.name}`}><Pencil size={16}/> Editar</button><button disabled={busy} onClick={() => open(b, 'status')} aria-label={`${b.active ? 'Desativar' : 'Ativar'} ${b.name}`}><Power size={16}/>{b.active ? 'Desativar' : 'Ativar'}</button><button className="delete-button" disabled={busy || count > 0} title={count ? 'Mova os produtos antes de excluir' : 'Excluir marca'} onClick={() => open(b, 'delete')} aria-label={`Excluir ${b.name}`}><Trash2 size={16}/></button></div>{count > 0 && <small>Para excluir, mova ou exclua os produtos vinculados.</small>}</article>; })}</div>
    {!brands.length && <div className="status-box">Cadastre sua primeira marca.</div>}
    {error && !action && <p className="error-message" role="alert">{error}</p>}
    <dialog ref={dialog} className="admin-modal" aria-label="Gerenciar marca" onCancel={e => { e.preventDefault(); if (!busy) setAction(null); }}>
      <div className="modal-handle"/><div className="section-heading"><h2>{action === 'delete' ? 'Excluir marca?' : action === 'status' ? `${brand?.active ? 'Desativar' : 'Ativar'} marca?` : brand ? 'Editar marca' : 'Cadastrar marca'}</h2><button className="icon-button" aria-label="Fechar" disabled={busy} onClick={() => setAction(null)}><X size={20}/></button></div>
      {action === 'edit' ? <form className="editor-form" onSubmit={e => { e.preventDefault(); void save(); }}><label>Nome da marca<input required maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder="Nome da marca"/></label><div className="logo-upload"><span>Logo da marca (opcional)</span><div className="logo-upload-preview">{preview ? <img src={preview} alt="Prévia da nova logo"/> : brand ? <BrandLogo brand={brandView(brand)} size={96}/> : <Upload size={32}/>}</div><label className="logo-upload-button"><Upload size={18}/>{logo || brand ? 'Trocar logo' : 'Enviar logo'}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e => { const file = e.target.files?.[0]; if (!file) return; if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 1024 * 1024 || !file.size) { setUploadError('Selecione uma imagem PNG, JPG ou WebP de até 1 MB.'); e.target.value = ''; return; } setUploadError(''); setLogo(file); e.target.value = ''; }}/></label>{logo && <><small className="logo-filename">{logo.name}</small><button type="button" className="secondary-button" disabled={busy} onClick={() => { setLogo(null); setUploadError(''); }}>Cancelar troca</button></>}<small>PNG, JPG ou WebP • até 1 MB. A logo atual é mantida até você enviar outra imagem.</small>{uploadError && <p className="error-message" role="alert">{uploadError}</p>}</div><label className="checkbox-label"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)}/> Marca ativa no catálogo</label>{submitted && error && <p className="error-message" role="alert">{error}</p>}<button className="primary-button" disabled={busy || Boolean(uploadError)}>{busy ? 'Salvando…' : 'Salvar marca'}</button></form> : <><p className="delete-copy">{action === 'delete' ? `“${name}” será excluída. Esta ação não pode ser desfeita.` : brand?.active ? `“${name}” e seus produtos ficarão ocultos no catálogo e na busca. Os dados serão preservados para reativação.` : `“${name}” e seus produtos voltarão a aparecer no catálogo.`}</p>{submitted && error && <p className="error-message" role="alert">{error}</p>}<div className="modal-actions"><button className="secondary-button" disabled={busy} onClick={() => setAction(null)}>Cancelar</button><button className={action === 'delete' ? 'danger-button' : 'primary-button'} disabled={busy} onClick={() => void save()}>{busy ? 'Salvando…' : action === 'delete' ? 'Confirmar exclusão' : 'Confirmar'}</button></div></>}
    </dialog>
  </>;
}
