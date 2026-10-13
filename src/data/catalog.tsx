import { useLocation } from '@tanstack/react-router';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
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
const Context = createContext<{ catalog: Catalog; loading: boolean; error: string; refresh: () => Promise<void> } | null>(null);
export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const pathname = useLocation({ select: location => location.pathname });
  const [catalog, setCatalog] = useState<Catalog>({ brands: [], consultants: [], categories: [], products: [] });
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    try { setCatalog(await api<Catalog>('/api/catalog')); setError(''); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh, pathname]);
  useEffect(() => { const onFocus = () => void refresh(); const onVisible = () => { if (document.visibilityState === 'visible') void refresh(); }; window.addEventListener('focus', onFocus); document.addEventListener('visibilitychange', onVisible); return () => { window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onVisible); }; }, [refresh]);
  return <Context.Provider value={{ catalog, loading, error, refresh }}>{children}</Context.Provider>;
}
export function useCatalog() { const value = useContext(Context); if (!value) throw new Error('Catálogo indisponível'); return { ...value, brands: value.catalog.brands.map(brandView) }; }
export function CatalogStatus() {
  const { loading, error, refresh } = useCatalog();
  return loading ? <p className="status-box" role="status">Carregando catálogo…</p> : error ? <div className="status-box" role="alert"><p>{error}</p><button onClick={() => void refresh()}>Tentar novamente</button></div> : null;
}
export { brandView };
export type { CatalogBrand };
