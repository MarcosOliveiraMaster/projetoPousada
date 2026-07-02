import { useState, KeyboardEvent } from 'react'
import { useData } from '../../contexts/DataContext'
import { Hospede } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import {
  Plus, Users, Search, Edit2, Trash2, X, Check,
  Phone, Mail, MapPin, Globe2, CalendarCheck, CalendarX, Tag
} from 'lucide-react'

const SUGESTOES_PREFERENCIAS = [
  'Vista para o mar', 'Andar térreo', 'Silencioso', 'Pet friendly',
  'Vegetariano', 'Não fumante', 'Cama extra', 'Acessibilidade'
]

const HOSPEDE_VAZIO: Omit<Hospede, 'id' | 'createdAt'> = {
  nome: '', cpf: '', email: '', contato: '',
  nacionalidade: '', cidade: '', estado: '', pais: '',
  preferencias: [], observacoes: ''
}

interface FormHospedeProps {
  inicial?: Hospede
  onSalvar: (dados: Omit<Hospede, 'id' | 'createdAt'>) => void
  onCancelar: () => void
}

function FormHospede({ inicial, onSalvar, onCancelar }: FormHospedeProps) {
  const [form, setForm] = useState<Omit<Hospede, 'id' | 'createdAt'>>(
    inicial ? {
      nome: inicial.nome, cpf: inicial.cpf, email: inicial.email, contato: inicial.contato,
      nacionalidade: inicial.nacionalidade, cidade: inicial.cidade, estado: inicial.estado, pais: inicial.pais,
      preferencias: inicial.preferencias || [], observacoes: inicial.observacoes || ''
    } : HOSPEDE_VAZIO
  )
  const [tagInput, setTagInput] = useState('')

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const adicionarTag = (tag: string) => {
    const limpa = tag.trim()
    if (!limpa || form.preferencias.includes(limpa)) return
    setForm(prev => ({ ...prev, preferencias: [...prev.preferencias, limpa] }))
    setTagInput('')
  }

  const removerTag = (tag: string) => {
    setForm(prev => ({ ...prev, preferencias: prev.preferencias.filter(t => t !== tag) }))
  }

  const onTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      adicionarTag(tagInput)
    }
  }

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
          <label className={labelClass}>CPF / Documento</label>
          <input className={inputClass} value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00 ou passaporte" />
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
          <label className={labelClass}>Nacionalidade</label>
          <input className={inputClass} value={form.nacionalidade} onChange={e => set('nacionalidade', e.target.value)} placeholder="Brasileira" />
        </div>
        <div>
          <label className={labelClass}>Cidade</label>
          <input className={inputClass} value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="Cidade de origem" />
        </div>
        <div>
          <label className={labelClass}>Estado</label>
          <input className={inputClass} value={form.estado} onChange={e => set('estado', e.target.value)} placeholder="UF" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>País</label>
          <input className={inputClass} value={form.pais} onChange={e => set('pais', e.target.value)} placeholder="Brasil" />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Preferências</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {form.preferencias.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 font-body text-xs font-medium px-2.5 py-1 rounded-lg bg-brand-100 text-brand-700">
                <Tag className="w-3 h-3" /> {tag}
                <button onClick={() => removerTag(tag)} className="hover:text-red-600"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <input
            className={inputClass}
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={onTagKeyDown}
            placeholder="Digite e pressione Enter para adicionar..."
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {SUGESTOES_PREFERENCIAS.filter(s => !form.preferencias.includes(s)).map(s => (
              <button key={s} onClick={() => adicionarTag(s)}
                className="font-body text-xs px-2.5 py-1 rounded-lg border border-sand-200 text-sand-500 hover:border-brand-300 hover:text-brand-700 transition-colors">
                + {s}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Observações</label>
          <textarea className={`${inputClass} resize-none h-20`} value={form.observacoes} onChange={e => set('observacoes', e.target.value)} placeholder="Alergias, restrições, observações gerais..." />
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
  const { hospedes, quartos, addHospede, updateHospede, removeHospede, getEstadiasPorHospede } = useData()
  const [busca, setBusca] = useState('')
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<Hospede | null>(null)
  const { isAuthorized } = useAuth()
  const podeEditar = isAuthorized('hospedes')

  const salvar = (dados: Omit<Hospede, 'id' | 'createdAt'>) => {
    if (editando) {
      updateHospede(editando.id, dados)
      setEditando(null)
    } else {
      addHospede(dados)
      setFormAberto(false)
    }
  }

  const excluir = (id: string) => {
    if (confirm('Excluir este hóspede?')) removeHospede(id)
  }

  const nomeQuarto = (id?: string) => quartos.find(q => q.id === id)?.nome || '—'

  const filtrados = hospedes.filter(h =>
    h.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    h.cpf?.includes(busca) ||
    h.email?.toLowerCase().includes(busca.toLowerCase())
  ).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-brand-900">Hóspedes</h1>
          <p className="font-body text-sand-500 text-sm mt-0.5">{hospedes.length} hóspede{hospedes.length !== 1 ? 's' : ''} cadastrado{hospedes.length !== 1 ? 's' : ''}</p>
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
        <FormHospede onSalvar={salvar} onCancelar={() => setFormAberto(false)} />
      )}
      {editando && (
        <FormHospede inicial={editando} onSalvar={salvar} onCancelar={() => setEditando(null)} />
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
      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-12 h-12 text-sand-300 mb-3" strokeWidth={1} />
          <p className="font-body font-semibold text-brand-900">Nenhum hóspede encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map(h => {
            const ultimaEstadia = getEstadiasPorHospede(h.id)[0]
            return (
              <div key={h.id} className="bg-white rounded-2xl shadow-card border border-sand-100 p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="font-body font-semibold text-brand-700">{h.nome?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-body font-semibold text-brand-900 text-sm">{h.nome}</h3>
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
                    {(h.cidade || h.pais) && <span className="flex items-center gap-1 font-body text-xs text-sand-500"><MapPin className="w-3 h-3" />{[h.cidade, h.estado, h.pais].filter(Boolean).join(', ')}</span>}
                    {h.nacionalidade && <span className="flex items-center gap-1 font-body text-xs text-sand-500"><Globe2 className="w-3 h-3" />{h.nacionalidade}</span>}
                  </div>
                  {h.preferencias.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {h.preferencias.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 font-body text-xs font-medium px-2 py-0.5 rounded-lg bg-brand-50 text-brand-600">
                          <Tag className="w-3 h-3" /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {ultimaEstadia && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 rounded-xl bg-sand-50">
                      <span className={`font-body text-xs font-medium px-2 py-0.5 rounded-lg ${ultimaEstadia.status === 'ativa' ? 'bg-brand-100 text-brand-700' : 'bg-sand-100 text-sand-600'}`}>
                        {ultimaEstadia.status === 'ativa' ? 'Estadia ativa' : 'Última estadia'}
                      </span>
                      <span className="flex items-center gap-1 font-body text-xs text-sand-500"><MapPin className="w-3 h-3" />{nomeQuarto(ultimaEstadia.quartoId)}</span>
                      <span className="flex items-center gap-1 font-body text-xs text-sand-500"><CalendarCheck className="w-3 h-3" />{new Date(ultimaEstadia.dataEntrada).toLocaleDateString('pt-BR')}</span>
                      <span className="flex items-center gap-1 font-body text-xs text-sand-500"><CalendarX className="w-3 h-3" />{new Date(ultimaEstadia.dataSaida).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
