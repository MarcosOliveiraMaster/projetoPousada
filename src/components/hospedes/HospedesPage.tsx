import { useEffect, useState } from 'react'
import { ref, onValue, push, update, remove } from 'firebase/database'
import { db } from '../../services/firebase'
import { Hospede, StatusHospede, Quarto } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import {
  Plus, Users, Search, Edit2, Trash2, X, Check,
  Phone, Mail, MapPin, CalendarCheck, CalendarX
} from 'lucide-react'

const HOSPEDE_VAZIO: Omit<Hospede, 'id' | 'createdAt'> = {
  nome: '', cpf: '', email: '', uid: '', contato: '',
  detalhes: '', checkin: '', checkout: '', status: 'ativo', alocacao: ''
}

interface FormHospedeProps {
  inicial?: Hospede
  quartos: Quarto[]
  onSalvar: (dados: Omit<Hospede, 'id' | 'createdAt'>) => void
  onCancelar: () => void
}

function FormHospede({ inicial, quartos, onSalvar, onCancelar }: FormHospedeProps) {
  const [form, setForm] = useState<Omit<Hospede, 'id' | 'createdAt'>>(
    inicial ? { nome: inicial.nome, cpf: inicial.cpf, email: inicial.email, uid: inicial.uid,
      contato: inicial.contato, detalhes: inicial.detalhes, checkin: inicial.checkin,
      checkout: inicial.checkout, status: inicial.status, alocacao: inicial.alocacao || '' }
    : HOSPEDE_VAZIO
  )

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const inputClass = "w-full px-3 py-2 rounded-xl border border-sand-200 font-body text-sm text-brand-900 bg-sand-50 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-sand-400"
  const labelClass = "block font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-1"

  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-sand-100 p-6">
      <h2 className="font-body font-semibold text-brand-900 text-base mb-5">
        {inicial ? 'Editar hóspede' : 'Novo hóspede'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Nome completo</label>
          <input className={inputClass} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome do hóspede" />
        </div>
        <div>
          <label className={labelClass}>CPF</label>
          <input className={inputClass} value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" />
        </div>
        <div>
          <label className={labelClass}>Contato</label>
          <input className={inputClass} value={form.contato} onChange={e => set('contato', e.target.value)} placeholder="(82) 99999-9999" />
        </div>
        <div>
          <label className={labelClass}>E-mail</label>
          <input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@exemplo.com" />
        </div>
        <div>
          <label className={labelClass}>UID</label>
          <input className={inputClass} value={form.uid} onChange={e => set('uid', e.target.value)} placeholder="Código de identificação" />
        </div>
        <div>
          <label className={labelClass}>Check-in</label>
          <input type="date" className={inputClass} value={form.checkin} onChange={e => set('checkin', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Check-out</label>
          <input type="date" className={inputClass} value={form.checkout} onChange={e => set('checkout', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Quarto</label>
          <select className={inputClass} value={form.alocacao} onChange={e => set('alocacao', e.target.value)}>
            <option value="">Sem quarto</option>
            {quartos.map(q => <option key={q.id} value={q.id}>{q.nome}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={form.status} onChange={e => set('status', e.target.value as StatusHospede)}>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Detalhes / Preferências</label>
          <textarea className={`${inputClass} resize-none h-20`} value={form.detalhes} onChange={e => set('detalhes', e.target.value)} placeholder="Preferências, alergias, observações..." />
        </div>
      </div>
      <div className="flex gap-3 mt-5 justify-end">
        <button onClick={onCancelar} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-body text-sm text-sand-600 hover:bg-sand-100 transition-colors">
          <X className="w-4 h-4" /> Cancelar
        </button>
        <button onClick={() => onSalvar(form)} disabled={!form.nome.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-body text-sm font-medium shadow-card-md transition-all disabled:opacity-50">
          <Check className="w-4 h-4" /> Salvar
        </button>
      </div>
    </div>
  )
}

export default function HospedesPage() {
  const [hospedes, setHospedes] = useState<Hospede[]>([])
  const [quartos, setQuartos] = useState<Quarto[]>([])
  const [busca, setBusca] = useState('')
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<Hospede | null>(null)
  const [carregando, setCarregando] = useState(true)
  const { isAuthorized } = useAuth()
  const podeEditar = isAuthorized('adm')

  useEffect(() => {
    const unsubH = onValue(ref(db, 'hospedes'), snap => {
      const data: Hospede[] = []
      snap.forEach(child => data.push({ id: child.key!, ...child.val() }))
      setHospedes(data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)))
      setCarregando(false)
    })
    const unsubQ = onValue(ref(db, 'quartos'), snap => {
      const data: Quarto[] = []
      snap.forEach(child => data.push({ id: child.key!, ...child.val() }))
      setQuartos(data)
    })
    return () => { unsubH(); unsubQ() }
  }, [])

  const salvar = async (dados: Omit<Hospede, 'id' | 'createdAt'>) => {
    if (editando) {
      await update(ref(db, `hospedes/${editando.id}`), dados)
      setEditando(null)
    } else {
      await push(ref(db, 'hospedes'), { ...dados, createdAt: Date.now() })
      setFormAberto(false)
    }
  }

  const excluir = async (id: string) => {
    if (confirm('Excluir este hóspede?')) await remove(ref(db, `hospedes/${id}`))
  }

  const nomeQuarto = (id?: string) => quartos.find(q => q.id === id)?.nome || '—'

  const filtrados = hospedes.filter(h =>
    h.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    h.cpf?.includes(busca) ||
    h.email?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-brand-900">Hóspedes</h1>
          <p className="font-body text-sand-500 text-sm mt-0.5">{hospedes.length} hóspede{hospedes.length !== 1 ? 's' : ''}</p>
        </div>
        {podeEditar && (
          <button onClick={() => { setFormAberto(true); setEditando(null) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-600 text-white font-body font-medium text-sm rounded-xl shadow-card-md transition-all">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo hóspede</span>
          </button>
        )}
      </div>

      {(formAberto && !editando) && (
        <FormHospede quartos={quartos} onSalvar={salvar} onCancelar={() => setFormAberto(false)} />
      )}
      {editando && (
        <FormHospede inicial={editando} quartos={quartos} onSalvar={salvar} onCancelar={() => setEditando(null)} />
      )}

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
        <input
          value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, CPF ou e-mail..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-200 bg-white font-body text-sm text-brand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-sand-100" />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-12 h-12 text-sand-300 mb-3" strokeWidth={1} />
          <p className="font-body font-semibold text-brand-900">Nenhum hóspede encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map(h => (
            <div key={h.id} className="bg-white rounded-2xl shadow-card border border-sand-100 p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                <span className="font-body font-semibold text-brand-700">{h.nome?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-body font-semibold text-brand-900 text-sm">{h.nome}</h3>
                    <span className={`inline-block font-body text-xs font-medium px-2 py-0.5 rounded-lg ${h.status === 'ativo' ? 'bg-brand-100 text-brand-700' : 'bg-sand-100 text-sand-600'}`}>
                      {h.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  {podeEditar && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setEditando(h)} className="p-1.5 text-sand-400 hover:text-brand-600 hover:bg-sand-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => excluir(h.id)} className="p-1.5 text-sand-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {h.contato && <span className="flex items-center gap-1 font-body text-xs text-sand-500"><Phone className="w-3 h-3" />{h.contato}</span>}
                  {h.email && <span className="flex items-center gap-1 font-body text-xs text-sand-500"><Mail className="w-3 h-3" />{h.email}</span>}
                  {h.alocacao && <span className="flex items-center gap-1 font-body text-xs text-sand-500"><MapPin className="w-3 h-3" />{nomeQuarto(h.alocacao)}</span>}
                  {h.checkin && <span className="flex items-center gap-1 font-body text-xs text-sand-500"><CalendarCheck className="w-3 h-3" />{new Date(h.checkin).toLocaleDateString('pt-BR')}</span>}
                  {h.checkout && <span className="flex items-center gap-1 font-body text-xs text-sand-500"><CalendarX className="w-3 h-3" />{new Date(h.checkout).toLocaleDateString('pt-BR')}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
