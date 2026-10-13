import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { LockKeyhole, LogOut, Plus, Pencil, Trash2, Search, X, Package, Layers, ArrowUpRight, Eye, EyeOff } from 'lucide-react';
import { BrandConsultation } from '@/components/BrandConsultation';
import { ConsultantManager } from '@/components/ConsultantManager';
import { ApiError, api, brands, money, useCatalog, type Catalog, type CatalogProduct, type Category } from '@/data/catalog';
export const Route = createFileRoute('/gestao-c4')({
  head: () => ({ meta: [{ title: 'Gestão privada • C4' }, { name: 'robots', content: 'noindex, nofollow, noarchive' }, { name: 'referrer', content: 'no-referrer' }] }),
  component: AdminPage,
});
type Session = Catalog & { csrf: string };
const emptyProduct = (): Omit<CatalogProduct, 'id'> => ({ name: '', dosage: '', price: 0, brandSlug: brands[0].slug, categoryId: '', onRequest: false });
function AdminPage() {
  const { refresh } = useCatalog();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true); const [busy, setBusy] = useState(false);
  const token = useRef(''); const [hasToken, setHasToken] = useState(false);
  const [password, setPassword] = useState(''); const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [tab, setTab] = useState<'products' | 'categories' | 'consultants'>('products');
  const [query, setQuery] = useState(''); const [brandFilter, setBrandFilter] = useState(''); const [categoryFilter, setCategoryFilter] = useState('');
  const [editor, setEditor] = useState<{ kind: 'products' | 'categories'; id?: string } | null>(null);
  const [product, setProduct] = useState(emptyProduct); const [categoryName, setCategoryName] = useState('');
  const [deletion, setDeletion] = useState<{ kind: 'products' | 'categories'; id: string; name: string } | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const readToken = () => {
      const incomingToken = new URLSearchParams(window.location.hash.slice(1)).get('token');
      if (incomingToken) token.current = incomingToken;
      setHasToken(Boolean(token.current));
      if (window.location.hash) window.history.replaceState(window.history.state, '', window.location.pathname);
    };
    readToken();
    window.addEventListener('hashchange', readToken);
    api<Session>('/api/admin/session').then(setSession).catch(() => {}).finally(() => setChecking(false));
    return () => window.removeEventListener('hashchange', readToken);
  }, []);
  useEffect(() => { if (editor || deletion) modalRef.current?.showModal(); else modalRef.current?.close(); }, [editor, deletion]);
  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try { const data = await api<Session>('/api/admin/login', { method: 'POST', body: JSON.stringify({ token: token.current, password }) }); setSession(data); setPassword(''); token.current = ''; }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function mutate(path: string, method: string, data?: unknown) {
    if (!session) return false;
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await api<Catalog>(path, { method, headers: { 'X-CSRF-Token': session.csrf }, body: data ? JSON.stringify(data) : undefined });
      setSession(prev => prev ? { ...prev, ...result } : null); setEditor(null); setDeletion(null); setNotice('Alteração salva no catálogo.'); await refresh(); return true;
    } catch (e) { if (e instanceof ApiError && e.status === 401) { setSession(null); setHasToken(false); setEditor(null); setDeletion(null); } setError((e as Error).message); return false; }
    finally { setBusy(false); }
  }
  async function logout() {
    if (!session) return; setBusy(true); setError('');
    try { await api('/api/admin/logout', { method: 'POST', headers: { 'X-CSRF-Token': session.csrf } }); setSession(null); setHasToken(false); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  function editProduct(p?: CatalogProduct) { setError(''); setProduct(p || { ...emptyProduct(), categoryId: session?.categories[0]?.id || '' }); setEditor({ kind: 'products', id: p?.id }); }
  function editCategory(c?: Category) { setError(''); setCategoryName(c?.name || ''); setEditor({ kind: 'categories', id: c?.id }); }
  function closeModal() { if (!busy) { setEditor(null); setDeletion(null); setError(''); } }
  if (checking) return <div className="admin-login"><LockKeyhole className="text-primary"/><p role="status">Verificando acesso…</p></div>;
  if (!session) return <main className="admin-login"><div className="admin-lock"><LockKeyhole size={28}/></div><span className="eyebrow">ÁREA PRIVADA</span><h1>Gestão C4</h1><p>Acesso reservado ao administrador.</p>
    {hasToken ? <form onSubmit={login} className="login-form"><label>Senha de acesso<div className="password-field"><input type={showPassword ? 'text' : 'password'} required maxLength={256} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite sua senha"/><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div></label>{error && <p role="alert" className="error-message">{error}</p>}<button className="primary-button" disabled={busy}>{busy ? 'Verificando…' : 'Entrar no painel'}</button><small>Sessão protegida • expira em 8 horas</small></form> : <div className="status-box"><p>Abra seu link privado com token para entrar.</p>{error && <p role="alert">{error}</p>}</div>}
    <Link to="/catalogo" className="text-link">Voltar ao catálogo</Link></main>;
  const filtered = session.products.filter(p => (!brandFilter || p.brandSlug === brandFilter) && (!categoryFilter || p.categoryId === categoryFilter) && `${p.name} ${p.dosage}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  return <div className="admin-page">
    <header className="app-header"><span><b>C4</b> / GESTÃO</span><button className="icon-button" onClick={() => void logout()} disabled={busy} aria-label="Sair do painel"><LogOut size={19}/></button></header>
    <main className="page-content">
      <div className="admin-title"><span className="eyebrow">CONTROLE DO CATÁLOGO</span><h1>Seu painel.</h1><p>Organize. Atualize. Publique.</p><Link to="/catalogo">Ver catálogo <ArrowUpRight size={16}/></Link></div>
      <div className="admin-stats"><div><Package size={19}/><b>{session.products.length}</b><span>Produtos</span></div><div><Layers size={19}/><b>{session.categories.length}</b><span>Categorias</span></div></div>
      <div className="admin-tabs"><button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Produtos</button><button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>Categorias</button><button className={tab === 'consultants' ? 'active' : ''} onClick={() => setTab('consultants')}>Consultores</button></div>
      {notice && <p className="success-message" role="status">{notice}</p>}{error && tab !== 'consultants' && !editor && !deletion && <p className="error-message" role="alert">{error}</p>}
      {tab === 'consultants' ? <ConsultantManager consultants={session.consultants} busy={busy} error={error} onMutate={mutate}/> : <>
      <div className="section-heading"><h2>{tab === 'products' ? 'Produtos' : 'Categorias'}</h2><button className="add-button" disabled={busy || (tab === 'products' && !session.categories.length)} onClick={() => tab === 'products' ? editProduct() : editCategory()}><Plus size={16}/> Adicionar</button></div>
      {tab === 'products' ? <>
        <label className="search-field"><Search size={18}/><input type="search" placeholder="Buscar produto" aria-label="Buscar produto" value={query} onChange={e => setQuery(e.target.value)}/></label>
        <div className="admin-filters"><select aria-label="Filtrar marca" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}><option value="">Todas as marcas</option>{brands.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}</select><select aria-label="Filtrar categoria" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}><option value="">Categorias</option>{session.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <BrandConsultation key={brandFilter} brandSlug={brandFilter} products={session.products} busy={busy} error={error} onMutate={mutate}/>
        <p className="result-count">{filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
        {!filtered.length && <div className="status-box">Nenhum produto encontrado. {!session.categories.length && 'Adicione uma categoria primeiro.'}</div>}
        <div className="admin-list">{filtered.map(p => <article className="admin-item" key={p.id}><span className="eyebrow">{brands.find(b => b.slug === p.brandSlug)?.name}</span><h3>{p.name}</h3><p>{p.dosage || 'Sem dosagem'} • {session.categories.find(c => c.id === p.categoryId)?.name}</p><div className="admin-item-footer"><strong>{p.onRequest ? 'A consultar' : money(p.price)}</strong><div><button aria-label={`Editar ${p.name}`} onClick={() => editProduct(p)} disabled={busy}><Pencil size={17}/></button><button className="delete-button" aria-label={`Excluir ${p.name}`} onClick={() => { setError(''); setDeletion({ kind: 'products', id: p.id, name: p.name }); }} disabled={busy}><Trash2 size={17}/></button></div></div></article>)}</div>
      </> : <div className="admin-list">{!session.categories.length && <div className="status-box">Crie sua primeira categoria.</div>}{session.categories.map(c => { const count = session.products.filter(p => p.categoryId === c.id).length; return <article className="admin-item" key={c.id}><div className="category-item"><div><h3>{c.name}</h3><p>{count} produtos vinculados</p></div><div className="item-actions"><button aria-label={`Editar ${c.name}`} onClick={() => editCategory(c)} disabled={busy}><Pencil size={17}/></button><button className="delete-button" disabled={busy || count > 0} title={count ? 'Mova os produtos antes de excluir' : 'Excluir categoria'} aria-label={`Excluir ${c.name}`} onClick={() => { setError(''); setDeletion({ kind: 'categories', id: c.id, name: c.name }); }}><Trash2 size={17}/></button></div></div>{count > 0 && <small>Mova os produtos para outra categoria antes de excluir.</small>}</article>; })}</div>}
      </>}
    </main>
    <dialog ref={modalRef} className="admin-modal" onCancel={e => { e.preventDefault(); closeModal(); }}>
      <div className="modal-handle"/><div className="section-heading"><h2>{deletion ? 'Excluir registro?' : `${editor?.id ? 'Editar' : 'Adicionar'} ${editor?.kind === 'products' ? 'produto' : 'categoria'}`}</h2><button className="icon-button" onClick={closeModal} disabled={busy} aria-label="Fechar"><X size={20}/></button></div>
      {deletion ? <><p className="delete-copy">“{deletion.name}” será removido do catálogo. Esta ação não pode ser desfeita.</p>{error && <p className="error-message" role="alert">{error}</p>}<div className="modal-actions"><button className="secondary-button" disabled={busy} onClick={closeModal}>Cancelar</button><button className="danger-button" disabled={busy} onClick={() => void mutate(`/api/admin/${deletion.kind}/${deletion.id}`, 'DELETE')}>{busy ? 'Excluindo…' : 'Confirmar exclusão'}</button></div></> : editor && <form onSubmit={e => { e.preventDefault(); void mutate(`/api/admin/${editor.kind}${editor.id ? `/${editor.id}` : ''}`, editor.id ? 'PUT' : 'POST', editor.kind === 'products' ? product : { name: categoryName }); }} className="editor-form">
        {editor.kind === 'products' ? <><label>Nome do produto<input required maxLength={120} value={product.name} onChange={e => setProduct({ ...product, name: e.target.value })} placeholder="Ex.: Nome do produto"/></label><label>Marca<select value={product.brandSlug} onChange={e => setProduct({ ...product, brandSlug: e.target.value })}>{brands.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}</select></label><label>Categoria<select required value={product.categoryId} onChange={e => setProduct({ ...product, categoryId: e.target.value })}><option value="" disabled>Selecione</option>{session.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Dosagem / apresentação<input maxLength={160} value={product.dosage} onChange={e => setProduct({ ...product, dosage: e.target.value })} placeholder="Ex.: 250mg • 10ml"/></label><label className="checkbox-label"><input type="checkbox" checked={product.onRequest} onChange={e => setProduct({ ...product, onRequest: e.target.checked })}/> A consultar</label><label>Preço (R$)<input type="number" inputMode="decimal" required min="0" max="999999.99" step="0.01" disabled={product.onRequest} value={product.price} onChange={e => setProduct({ ...product, price: Number(e.target.value) })}/></label></> : <label>Nome da categoria<input required maxLength={120} value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="Ex.: Suplementos"/><small>As alterações aparecem automaticamente no catálogo.</small></label>}
        {error && <p className="error-message" role="alert">{error}</p>}<button className="primary-button" disabled={busy}>{busy ? 'Salvando…' : 'Salvar alterações'}</button>
      </form>}
    </dialog>
  </div>;
}
