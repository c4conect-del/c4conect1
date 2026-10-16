import { useLocation } from '@tanstack/react-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { brandView, type CatalogBrand } from './brands';
export type Category = { id: string; name: string };
export type CatalogProduct = { id: string; brandSlug: string; categoryId: string; name: string; dosage: string; price: number; onRequest: boolean };
export type Consultant = { id: string; name: string; phone: string };
export type Catalog = { brands: CatalogBrand[]; consultants: Consultant[]; categories: Category[]; products: CatalogProduct[] };
export const money = (price: number) => price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...options, headers: { ...(options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...options?.headers } });
  const data = await response.json();
  if (!response.ok) throw new ApiError(data.error || 'Não foi possível carregar os dados.', response.status);
  return data;
}
const Context = createContext<{ catalog: Catalog; brands: ReturnType<typeof brandView>[]; loading: boolean; error: string; refresh: () => Promise<void> } | null>(null);
export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const pathname = useLocation({ select: location => location.pathname });
  const [catalog, setCatalog] = useState<Catalog>({ brands: [], consultants: [], categories: [], products: [] });
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const pending = useRef<Promise<void> | null>(null);
  const updatedAt = useRef(0);
  const load = useCallback(() => {
    const request = (async () => {
      try { setCatalog(await api<Catalog>('/api/catalog')); updatedAt.current = Date.now(); setError(''); }
      catch (e) { setError((e as Error).message); }
      finally { setLoading(false); }
    })();
    pending.current = request;
    void request.finally(() => { if (pending.current === request) pending.current = null; });
    return request;
  }, []);
  // Explicit refresh after an admin save must run after any older request.
  const refresh = useCallback(async () => { if (pending.current) await pending.current; await load(); }, [load]);
  const refreshIfStale = useCallback(() => {
    if (pending.current || (updatedAt.current && Date.now() - updatedAt.current < 30000)) return;
    void load();
  }, [load]);
  useEffect(() => { refreshIfStale(); }, [refreshIfStale, pathname]);
  useEffect(() => {
    const onFocus = () => { if (document.visibilityState === 'visible') refreshIfStale(); };
    window.addEventListener('focus', onFocus); document.addEventListener('visibilitychange', onFocus);
    return () => { window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onFocus); };
  }, [refreshIfStale]);
  const brands = useMemo(() => catalog.brands.map(brandView), [catalog.brands]);
  const value = useMemo(() => ({ catalog, brands, loading, error, refresh }), [catalog, brands, loading, error, refresh]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCatalog() { const value = useContext(Context); if (!value) throw new Error('Catálogo indisponível'); return value; }
export function CatalogStatus() {
  const { loading, error, refresh } = useCatalog();
  return loading ? <p className="status-box" role="status">Carregando catálogo…</p> : error ? <div className="status-box" role="alert"><p>{error}</p><button onClick={() => void refresh()}>Tentar novamente</button></div> : null;
}
export { brandView };
export type { CatalogBrand };
