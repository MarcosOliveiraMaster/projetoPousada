import { useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { criarContaColaborador } from '../../services/firebase'
import { useData } from '../../contexts/DataContext'
import { Usuario, AreaKey } from '../../types'
import {
  Plus, UserCircle, Edit2, Trash2, X, Check, Phone, ShieldCheck, Shield, Loader2
} from 'lucide-react'

const AREAS_DISPONIVEIS: { value: AreaKey; label: string }[] = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'quartos', label: 'Quartos' },
  { value: 'hospedes', label: 'Hóspedes' },
  { value: 'entrada', label: 'Entrada' },
  { value: 'mapaHospedes', label: 'Mapa de Hóspedes' },
  { value: 'itens', label: 'Itens' },
  { value: 'consumo', label: 'Consumo' },
]

type ColabForm = { nome: string; cpf: string; contato: string; email: string; senha: string; admin: boolean; areas: AreaKey[] }
const VAZIO: ColabForm = { nome: '', cpf: '', contato: '', email: '', senha: '', admin: false, areas: [] }

interface FormColabProps {
  inicial?: Usuario
  onSalvar: (d: ColabForm) => Promise<void>
  onCancelar: () => void
}

function FormColab({ inicial, onSalvar, onCancelar }: FormColabProps) {
  const [form, setForm] = useState<ColabForm>(
    inicial
      ? { nome: inicial.nome, cpf: inicial.cpf, contato: inicial.contato, email: inicial.email, senha: '', admin: inicial.admin, areas: inicial.areas }
      : VAZIO
  )
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const set = <K extends keyof ColabForm>(k: K, v: ColabForm[K]) => setForm(p => ({ ...p, [k]: v }))
  const input = "w-full px-3 py-2.5 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
  const label = "block font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-1.5"

  const toggleArea = (area: AreaKey) => {
    setForm(p => ({
      ...p,
      areas: p.areas.includes(area) ? p.areas.filter(a => a !== area) : [...p.areas, area]
    }))
  }

  const podeSalvar = form.nome.trim() && (inicial || (form.email.trim() && form.senha.length >= 6))

  const salvar = async () => {
    setErro('')
    setSalvando(true)
    try {
      await onSalvar(form)
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/email-already-in-use') setErro('Este e-mail já está cadastrado.')
        else if (err.code === 'auth/weak-password') setErro('A senha deve ter pelo menos 6 caracteres.')
        else if (err.code === 'auth/invalid-email') setErro('E-mail inválido.')
        else setErro(`Erro ao criar conta (${err.code})`)
      } else {
        setErro('Erro inesperado ao salvar colaborador.')
      }
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-sand-100 p-6">
      <h2 className="font-body font-semibold text-brand-900 text-base mb-5">{inicial ? 'Editar colaborador' : 'Novo colaborador'}</h2>

      {erro && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
          <p className="font-body text-red-600 text-sm">{erro}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={label}>Nome</label>
          <input className={input} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome completo" />
        </div>
        <div>
          <label className={label}>CPF</label>
          <input className={input} value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" />
        </div>
        <div>
          <label className={label}>Contato</label>
          <input className={input} value={form.contato} onChange={e => set('contato', e.target.value)} placeholder="(82) 99999-9999" />
        </div>
        <div>
          <label className={label}>E-mail {inicial && '(não editável)'}</label>
          <input type="email" disabled={!!inicial} className={`${input} ${inicial ? 'opacity-60' : ''}`} value={form.email} onChange={e => set('email', e.target.value)} placeholder="colaborador@pousada.com" />
        </div>
        {!inicial && (
          <div>
            <label className={label}>Senha de acesso</label>
            <input type="password" className={input} value={form.senha} onChange={e => set('senha', e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
        )}

        <div className="sm:col-span-2 flex items-center gap-2 pt-1">
          <input type="checkbox" id="admin" checked={form.admin} onChange={e => set('admin', e.target.checked)} className="w-4 h-4 rounded accent-brand-600" />
          <label htmlFor="admin" className="font-body text-sm text-brand-800">Administrador (acesso total e pode gerenciar colaboradores)</label>
        </div>

        {!form.admin && (
          <div className="sm:col-span-2">
            <label className={label}>Áreas com acesso</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AREAS_DISPONIVEIS.map(a => (
                <button key={a.value} type="button" onClick={() => toggleArea(a.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                    form.areas.includes(a.value) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-sand-200 text-sand-500 hover:border-sand-300'
                  }`}>
                  <span className={`w-4 h-4 rounded flex items-center justify-center border ${form.areas.includes(a.value) ? 'bg-brand-600 border-brand-600' : 'border-sand-300'}`}>
                    {form.areas.includes(a.value) && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span className="font-body text-sm">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-3 justify-end mt-5">
        <button onClick={onCancelar} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-body text-sm text-sand-600 hover:bg-sand-100">
          <X className="w-4 h-4" /> Cancelar
        </button>
        <button onClick={salvar} disabled={!podeSalvar || salvando}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-body text-sm font-medium shadow-card-md transition-all disabled:opacity-50">
          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Salvar
        </button>
      </div>
    </div>
  )
}

export default function ColaboradoresPage() {
  const { usuarios: colaboradores, addUsuario, updateUsuario, removeUsuario } = useData()
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)

  const salvar = async (dados: ColabForm) => {
    if (editando) {
      updateUsuario(editando.id, { nome: dados.nome, cpf: dados.cpf, contato: dados.contato, admin: dados.admin, areas: dados.areas })
      setEditando(null)
    } else {
      await criarContaColaborador(dados.email, dados.senha)
      addUsuario({
        nome: dados.nome, cpf: dados.cpf, contato: dados.contato, email: dados.email,
        admin: dados.admin, areas: dados.areas, loginUsername: dados.email
      })
      setFormAberto(false)
    }
  }

  const excluir = (id: string) => {
    if (confirm('Excluir este colaborador? A conta de login não será removida do Firebase.')) removeUsuario(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-brand-900">Colaboradores</h1>
          <p className="font-body text-sand-500 text-sm mt-0.5">{colaboradores.length} colaborador{colaboradores.length !== 1 ? 'es' : ''}</p>
        </div>
        <button onClick={() => { setFormAberto(true); setEditando(null) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-600 text-white font-body font-medium text-sm rounded-xl shadow-card-md transition-all">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo colaborador</span>
        </button>
      </div>

      {(formAberto && !editando) && <FormColab onSalvar={salvar} onCancelar={() => setFormAberto(false)} />}
      {editando && <FormColab inicial={editando} onSalvar={salvar} onCancelar={() => setEditando(null)} />}

      {colaboradores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UserCircle className="w-12 h-12 text-sand-300 mb-3" strokeWidth={1} />
          <p className="font-body font-semibold text-brand-900">Nenhum colaborador cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colaboradores.map(c => (
            <div key={c.id} className="bg-white rounded-2xl shadow-card border border-sand-100 p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                <span className="font-body font-semibold text-brand-700">{c.nome?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-body font-semibold text-brand-900 text-sm truncate">{c.nome}</h3>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setEditando(c)} className="p-1.5 text-sand-400 hover:text-brand-600 hover:bg-sand-100 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => excluir(c.id)} className="p-1.5 text-sand-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 font-body text-xs font-medium px-2 py-0.5 rounded-lg mt-1 ${c.admin ? 'bg-purple-50 text-purple-700' : 'bg-sand-100 text-sand-700'}`}>
                  {c.admin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                  {c.admin ? 'Administrador' : 'Colaborador'}
                </span>
                {c.contato && (
                  <p className="flex items-center gap-1 font-body text-xs text-sand-400 mt-1.5">
                    <Phone className="w-3 h-3" /> {c.contato}
                  </p>
                )}
                {!c.admin && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.areas.length === 0 ? (
                      <span className="font-body text-xs text-sand-400">Sem áreas liberadas</span>
                    ) : c.areas.map(a => (
                      <span key={a} className="font-body text-xs px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-600">
                        {AREAS_DISPONIVEIS.find(ad => ad.value === a)?.label || a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
