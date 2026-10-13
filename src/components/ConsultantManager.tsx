import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, MessageCircle, X } from 'lucide-react';
import type { Consultant } from '@/data/catalog';
export function ConsultantManager({ consultants, busy, error, onMutate }: {
  consultants: Consultant[];
  busy: boolean;
  error: string;
  onMutate: (path: string, method: string, data?: unknown) => Promise<boolean>;
}) {
  const [mode, setMode] = useState<'edit' | 'delete' | null>(null);
  const [id, setId] = useState<string>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (mode) dialog.current?.showModal(); else dialog.current?.close(); }, [mode]);
  function open(consultant?: Consultant, action: 'edit' | 'delete' = 'edit') {
    setId(consultant?.id); setName(consultant?.name || ''); setPhone(consultant?.phone || ''); setSubmitted(false); setMode(action);
  }
  async function save() {
    setSubmitted(true);
    const ok = await onMutate(`/api/admin/consultants${id ? `/${id}` : ''}`, mode === 'delete' ? 'DELETE' : id ? 'PUT' : 'POST', mode === 'delete' ? undefined : { name, phone });
    if (ok) setMode(null);
  }
  return <>
    <div className="section-heading"><h2>Consultores <span className="consultant-count">({consultants.length})</span></h2><button className="add-button" disabled={busy} onClick={() => open()}><Plus size={16}/> Adicionar</button></div>
    <p className="consultant-help">Os contatos cadastrados aparecem no botão de consultor do catálogo.</p>
    <div className="admin-list">{consultants.map(c => <article key={c.id} className="admin-item"><div className="category-item"><div><span className="eyebrow">CONSULTOR</span><h3>{c.name}</h3><p className="consultant-phone"><MessageCircle size={14}/> +{c.phone}</p></div><div className="item-actions"><button disabled={busy} aria-label={`Editar ${c.name}`} onClick={() => open(c)}><Pencil size={17}/></button><button disabled={busy} className="delete-button" aria-label={`Excluir ${c.name}`} onClick={() => open(c, 'delete')}><Trash2 size={17}/></button></div></div></article>)}</div>
    {!consultants.length && <div className="status-box">Nenhum consultor cadastrado. Adicione um contato para habilitar o atendimento no catálogo.</div>}
    {error && !mode && <p role="alert" className="error-message">{error}</p>}
    <dialog ref={dialog} className="admin-modal" aria-label={mode === 'delete' ? 'Excluir consultor' : id ? 'Editar consultor' : 'Adicionar consultor'} onCancel={e => { e.preventDefault(); if (!busy) setMode(null); }}>
      <div className="modal-handle"/><div className="section-heading"><h2>{mode === 'delete' ? 'Excluir consultor?' : id ? 'Editar consultor' : 'Adicionar consultor'}</h2><button className="icon-button" disabled={busy} aria-label="Fechar" onClick={() => setMode(null)}><X size={20}/></button></div>
      {mode === 'delete' ? <><p className="delete-copy">“{name}” será removido do atendimento do catálogo. Esta ação não pode ser desfeita.{consultants.length === 1 && ' Sem consultores cadastrados, o botão de atendimento ficará indisponível.'}</p>{submitted && error && <p role="alert" className="error-message">{error}</p>}<div className="modal-actions"><button className="secondary-button" disabled={busy} onClick={() => setMode(null)}>Cancelar</button><button className="danger-button" disabled={busy} onClick={() => void save()}>{busy ? 'Excluindo…' : 'Confirmar exclusão'}</button></div></> : <form className="editor-form" onSubmit={e => { e.preventDefault(); void save(); }}><label>Nome do consultor<input autoComplete="name" required maxLength={120} placeholder="Ex.: Consultor C4" value={name} onChange={e => setName(e.target.value)}/></label><label>WhatsApp com DDI e DDD<input type="tel" inputMode="tel" autoComplete="tel" required maxLength={32} placeholder="Ex.: +55 (11) 94077-2894" value={phone} onChange={e => setPhone(e.target.value)}/><small>Inclua o código do país. Para o Brasil, comece com 55.</small></label>{submitted && error && <p role="alert" className="error-message">{error}</p>}<button className="primary-button" disabled={busy}>{busy ? 'Salvando…' : 'Salvar consultor'}</button></form>}
    </dialog>
  </>;
}
