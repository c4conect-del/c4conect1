import { useRef } from 'react';
import { MessageCircle, ArrowUpRight, X } from 'lucide-react';
import { useCatalog } from '@/data/catalog';
export function ConsultantContact({ className, label = 'Consultor', message = 'Olá! Gostaria de falar com um consultor C4 IMPORTS.' }: { className: string; label?: string; message?: string }) {
  const { catalog, loading, error } = useCatalog();
  const dialog = useRef<HTMLDialogElement>(null);
  const contacts = catalog.consultants;
  const href = (phone: string) => `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  if (loading || error || !contacts.length) return <button className={className} disabled><MessageCircle size={18}/>{loading ? 'Carregando…' : 'Atendimento indisponível'}</button>;
  if (contacts.length === 1) return <a className={className} href={href(contacts[0].phone)} target="_blank" rel="noreferrer"><MessageCircle size={18}/>{label}</a>;
  return <><button className={className} onClick={() => dialog.current?.showModal()}><MessageCircle size={18}/>{label}</button><dialog className="admin-modal" ref={dialog} aria-label="Escolher consultor"><div className="modal-handle"/><div className="section-heading"><h2>Escolha seu consultor</h2><button className="icon-button" aria-label="Fechar" onClick={() => dialog.current?.close()}><X size={20}/></button></div><div className="admin-list">{contacts.map(c => <a className="consultant-option" key={c.id} href={href(c.phone)} target="_blank" rel="noreferrer" onClick={() => dialog.current?.close()}><MessageCircle size={20}/><span><strong>{c.name}</strong><small>Atendimento pelo WhatsApp</small></span><ArrowUpRight size={18}/></a>)}</div></dialog></>;
}
