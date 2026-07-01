import { useEffect, useState } from 'react'
import { ref, onValue, push, update, remove } from 'firebase/database'
import { db } from '../../services/firebase'
import { Usuario, UserNivel } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, UserCircle, Edit2, Trash2, X, Check, Phone, ShieldCheck, Shield } from 'lucide-react'

const NIVEL_CONFIG: Record<UserNivel, { label: string; color: string; icon: React.ReactNode }> = {
  master: { label: 'Master',       color: 'bg-purple-50 text-purple-700',  icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  adm:    { label: 'Administrador',color: 'bg-blue-50 text-blue-700',      icon: <Shield className="w-3.5 h-3.5" /> },
  simples:{ label: 'Colaborador',  color: 'bg-sand-100 text-sand-700',     icon: <UserCircle className="w-3.5 h-3.5" /> },
}

type ColabForm = { nome: string; cpf: string; contato: string; email: string; nivel: UserNivel }
const VAZIO: ColabForm = { nome: '', cpf: '', contato: '', email: '', nivel: 'simples' }

interface FormColabProps {
  inicial?: Usuario
  onSalvar: (d: ColabForm) => void
  onCancelar: () => void
}

function FormColab({ inicial, onSalvar, onCancelar }: FormColabProps) {
  const [form, setForm] = useState<ColabForm>(
    inicial ? { nome: inicial.nome, cpf: inicial.cpf, contato: inicial.contato, email: inicial.email, nivel: inicial.nivel }
    : VAZIO
  )
  const set = (k: keyof ColabForm, v: string) => setForm(p => ({ ...p, [k]: v }))
  const input = "w-full px-3 py-2.5 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
  const label = "block font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-1.5"

  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-sand-100 p-6">
      <h2 className="font-body font-semibold text-brand-900 text-base mb-5">{inicial ? 'Editar colaborador' : 'Novo colaborador'}</h2>
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
          <label className={label}>E-mail</label>
          <input type="email" className={input} value={form.email} onChange={e => set('email', e.target.value)} placeholder="colaborador@pousada.com" />
        </div>
        <div>
          <label className={label}>Nível de acesso</label>
          <select className={input} value={form.nivel} onChange={e => set('nivel', e.target.value as UserNivel)}>
            <option value="adm">Administrador</option>
            <option value="simples">Colaborador</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end mt-5">
        <button onClick={onCancelar} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-body text-sm text-sand-600 hover:bg-sand-100">
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

export default function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<Usuario[]>([])
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)
  const { isAuthorized } = useAuth()

  useEffect(() => {
    return onValue(ref(db, 'usuarios'), snap => {
      const data: Usuario[] = []
      snap.forEach(child => data.push({ id: child.key!, ...child.val() }))
      setColaboradores(data)
      setCarregando(false)
    })
  }, [])

  const salvar = async (dados: ColabForm) => {
    if (editando) {
      await update(ref(db, `usuarios/${editando.id}`), dados)
      setEditando(null)
    } else {
      await push(ref(db, 'usuarios'), { ...dados, loginUsername: dados.email })
      setFormAberto(false)
    }
  }

  const excluir = async (id: string) => {
    if (confirm('Excluir este colaborador?')) await remove(ref(db, `usuarios/${id}`))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-brand-900">Colaboradores</h1>
          <p className="font-body text-sand-500 text-sm mt-0.5">{colaboradores.length} colaborador{colaboradores.length !== 1 ? 'es' : ''}</p>
        </div>
        {isAuthorized('adm') && (
          <button onClick={() => { setFormAberto(true); setEditando(null) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-600 text-white font-body font-medium text-sm rounded-xl shadow-card-md transition-all">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo colaborador</span>
          </button>
        )}
      </div>

      {(formAberto && !editando) && <FormColab onSalvar={salvar} onCancelar={() => setFormAberto(false)} />}
      {editando && <FormColab inicial={editando} onSalvar={salvar} onCancelar={() => setEditando(null)} />}

      {carregando ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-sand-100" />)}</div>
      ) : colaboradores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UserCircle className="w-12 h-12 text-sand-300 mb-3" strokeWidth={1} />
          <p className="font-body font-semibold text-brand-900">Nenhum colaborador cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colaboradores.map(c => {
            const cfg = NIVEL_CONFIG[c.nivel] || NIVEL_CONFIG.simples
            return (
              <div key={c.id} className="bg-white rounded-2xl shadow-card border border-sand-100 p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="font-body font-semibold text-brand-700">{c.nome?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-body font-semibold text-brand-900 text-sm truncate">{c.nome}</h3>
                    {isAuthorized('adm') && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => setEditando(c)} className="p-1.5 text-sand-400 hover:text-brand-600 hover:bg-sand-100 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => excluir(c.id)} className="p-1.5 text-sand-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1 font-body text-xs font-medium px-2 py-0.5 rounded-lg mt-1 ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                  {c.contato && (
                    <p className="flex items-center gap-1 font-body text-xs text-sand-400 mt-1.5">
                      <Phone className="w-3 h-3" /> {c.contato}
                    </p>
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
