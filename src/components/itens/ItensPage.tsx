import { useEffect, useState } from 'react'
import { ref, onValue, push, update, remove } from 'firebase/database'
import { db } from '../../services/firebase'
import { ItemMobilia, TipoItem } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import {
  Plus, Package, BedDouble, Tv, Refrigerator, AirVent,
  Sofa, Edit2, Trash2, X, Check
} from 'lucide-react'

const TIPOS: { value: TipoItem; label: string; icon: React.ReactNode }[] = [
  { value: 'cama',            label: 'Cama',           icon: <BedDouble className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'guarda-roupa',    label: 'Guarda-roupa',   icon: <Sofa className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'televisao',       label: 'Televisão',      icon: <Tv className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'frigobar',        label: 'Frigobar',       icon: <Refrigerator className="w-6 h-6" strokeWidth={1.5} /> },
  { value: 'ar-condicionado', label: 'Ar-condicionado',icon: <AirVent className="w-6 h-6" strokeWidth={1.5} /> },
]

const ICONE_POR_TIPO: Record<TipoItem, React.ReactNode> = {
  'cama':            <BedDouble className="w-10 h-10" strokeWidth={1.2} />,
  'guarda-roupa':    <Sofa className="w-10 h-10" strokeWidth={1.2} />,
  'televisao':       <Tv className="w-10 h-10" strokeWidth={1.2} />,
  'frigobar':        <Refrigerator className="w-10 h-10" strokeWidth={1.2} />,
  'ar-condicionado': <AirVent className="w-10 h-10" strokeWidth={1.2} />,
}

interface FormItemProps {
  inicial?: ItemMobilia
  onSalvar: (dados: Omit<ItemMobilia, 'id' | 'createdAt' | 'icone'>) => void
  onCancelar: () => void
}

function FormItem({ inicial, onSalvar, onCancelar }: FormItemProps) {
  const [tipo, setTipo] = useState<TipoItem>(inicial?.tipo || 'cama')
  const [nome, setNome] = useState(inicial?.nome || '')

  const tipoSelecionado = TIPOS.find(t => t.value === tipo)!

  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-sand-100 p-6">
      <h2 className="font-body font-semibold text-brand-900 text-base mb-5">
        {inicial ? 'Editar item' : 'Novo item de mobília'}
      </h2>

      {/* Seleção de tipo */}
      <div className="mb-4">
        <label className="block font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-2">Tipo</label>
        <div className="grid grid-cols-5 gap-2">
          {TIPOS.map(t => (
            <button key={t.value} onClick={() => { setTipo(t.value); setNome(t.label) }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                tipo === t.value
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-sand-200 text-sand-500 hover:border-sand-300'
              }`}>
              {t.icon}
              <span className="font-body text-xs text-center leading-tight">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nome */}
      <div className="mb-5">
        <label className="block font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-2">Nome</label>
        <input
          value={nome} onChange={e => setNome(e.target.value)}
          placeholder={tipoSelecionado.label}
          className="w-full px-3 py-2.5 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button onClick={onCancelar} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-body text-sm text-sand-600 hover:bg-sand-100">
          <X className="w-4 h-4" /> Cancelar
        </button>
        <button onClick={() => onSalvar({ nome: nome || tipoSelecionado.label, tipo })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-body text-sm font-medium shadow-card-md transition-all">
          <Check className="w-4 h-4" /> Salvar
        </button>
      </div>
    </div>
  )
}

export default function ItensPage() {
  const [itens, setItens] = useState<ItemMobilia[]>([])
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<ItemMobilia | null>(null)
  const [carregando, setCarregando] = useState(true)
  const { isAuthorized } = useAuth()
  const podeEditar = isAuthorized('adm')

  useEffect(() => {
    return onValue(ref(db, 'itens'), snap => {
      const data: ItemMobilia[] = []
      snap.forEach(child => data.push({ id: child.key!, ...child.val() }))
      setItens(data)
      setCarregando(false)
    })
  }, [])

  const salvar = async (dados: Omit<ItemMobilia, 'id' | 'createdAt' | 'icone'>) => {
    const payload = { ...dados, icone: dados.tipo, createdAt: Date.now() }
    if (editando) {
      await update(ref(db, `itens/${editando.id}`), payload)
      setEditando(null)
    } else {
      await push(ref(db, 'itens'), payload)
      setFormAberto(false)
    }
  }

  const excluir = async (id: string) => {
    if (confirm('Excluir este item?')) await remove(ref(db, `itens/${id}`))
  }

  // Agrupar por tipo
  const porTipo = TIPOS.map(t => ({
    ...t,
    items: itens.filter(i => i.tipo === t.value)
  })).filter(g => g.items.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-brand-900">Itens</h1>
          <p className="font-body text-sand-500 text-sm mt-0.5">{itens.length} item{itens.length !== 1 ? 'ns' : ''} cadastrado{itens.length !== 1 ? 's' : ''}</p>
        </div>
        {podeEditar && (
          <button onClick={() => { setFormAberto(true); setEditando(null) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-600 text-white font-body font-medium text-sm rounded-xl shadow-card-md transition-all">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo item</span>
          </button>
        )}
      </div>

      {(formAberto && !editando) && (
        <FormItem onSalvar={salvar} onCancelar={() => setFormAberto(false)} />
      )}
      {editando && (
        <FormItem inicial={editando} onSalvar={salvar} onCancelar={() => setEditando(null)} />
      )}

      {carregando ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-sand-100" />)}
        </div>
      ) : itens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="w-12 h-12 text-sand-300 mb-3" strokeWidth={1} />
          <p className="font-body font-semibold text-brand-900">Nenhum item cadastrado</p>
          <p className="font-body text-sand-400 text-sm mt-1">Adicione camas, TVs, frigobares e mais.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {porTipo.map(grupo => (
            <div key={grupo.value}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-brand-500">{grupo.icon}</span>
                <h2 className="font-body font-semibold text-brand-800 text-sm">{grupo.label}</h2>
                <span className="font-body text-xs text-sand-400 bg-sand-100 px-2 py-0.5 rounded-full">{grupo.items.length}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {grupo.items.map(item => (
                  <div key={item.id}
                    className="bg-white rounded-2xl shadow-card border border-sand-100 p-3 flex flex-col items-center gap-2 relative group">
                    <span className="text-brand-400">{ICONE_POR_TIPO[item.tipo]}</span>
                    <p className="font-body text-xs text-brand-800 text-center font-medium leading-tight">{item.nome}</p>
                    {item.quartoId && (
                      <span className="font-body text-xs text-sand-400 text-center truncate w-full text-center">Alocado</span>
                    )}
                    {podeEditar && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditando(item)} className="p-1 bg-white rounded-lg shadow-card text-sand-400 hover:text-brand-600">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => excluir(item.id)} className="p-1 bg-white rounded-lg shadow-card text-sand-400 hover:text-red-500">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
