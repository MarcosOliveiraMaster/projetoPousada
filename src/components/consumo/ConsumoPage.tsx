import { useEffect, useState } from 'react'
import { ref, onValue, push, update, remove } from 'firebase/database'
import { db } from '../../services/firebase'
import { ItemConsumo } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import {
  Plus, ShoppingBasket, Edit2, Trash2, X, Check,
  Minus, Coffee, Wine, Apple, Sandwich, Droplets, Cookie, Beef, Fish, Salad
} from 'lucide-react'

const ICONES_DISPONIVEIS = [
  { value: 'coffee',    label: 'Café',      icon: <Coffee className="w-6 h-6" /> },
  { value: 'wine',      label: 'Bebida',    icon: <Wine className="w-6 h-6" /> },
  { value: 'apple',     label: 'Fruta',     icon: <Apple className="w-6 h-6" /> },
  { value: 'sandwich',  label: 'Lanche',    icon: <Sandwich className="w-6 h-6" /> },
  { value: 'water',     label: 'Água',      icon: <Droplets className="w-6 h-6" /> },
  { value: 'cookie',    label: 'Snack',     icon: <Cookie className="w-6 h-6" /> },
  { value: 'beef',      label: 'Carne',     icon: <Beef className="w-6 h-6" /> },
  { value: 'fish',      label: 'Peixe',     icon: <Fish className="w-6 h-6" /> },
  { value: 'salad',     label: 'Salada',    icon: <Salad className="w-6 h-6" /> },
  { value: 'basket',    label: 'Outro',     icon: <ShoppingBasket className="w-6 h-6" /> },
]

function getIconeConsumo(value: string, size = 'w-8 h-8') {
  const found = ICONES_DISPONIVEIS.find(i => i.value === value)
  if (!found) return <ShoppingBasket className={size} strokeWidth={1.5} />
  return <span className={size}>{found.icon}</span>
}

interface FormConsumoProps {
  inicial?: ItemConsumo
  onSalvar: (dados: Omit<ItemConsumo, 'id' | 'createdAt'>) => void
  onCancelar: () => void
}

function FormConsumo({ inicial, onSalvar, onCancelar }: FormConsumoProps) {
  const [nome, setNome] = useState(inicial?.nome || '')
  const [qtd, setQtd] = useState(inicial?.qtdAtual ?? 0)
  const [icone, setIcone] = useState(inicial?.icone || 'basket')

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"

  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-sand-100 p-6">
      <h2 className="font-body font-semibold text-brand-900 text-base mb-5">
        {inicial ? 'Editar item de consumo' : 'Novo item de consumo'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-2">Nome</label>
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Água mineral, Cerveja artesanal..." className={inputClass} />
        </div>
        <div>
          <label className="block font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-2">Quantidade inicial</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setQtd(q => Math.max(0, q - 1))}
              className="w-9 h-9 rounded-xl border border-sand-200 flex items-center justify-center text-sand-600 hover:bg-sand-100">
              <Minus className="w-4 h-4" />
            </button>
            <input type="number" value={qtd} onChange={e => setQtd(Number(e.target.value))} min={0}
              className="flex-1 text-center px-3 py-2.5 rounded-xl border border-sand-200 bg-sand-50 font-mono text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <button onClick={() => setQtd(q => q + 1)}
              className="w-9 h-9 rounded-xl border border-sand-200 flex items-center justify-center text-sand-600 hover:bg-sand-100">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-2">Ícone</label>
          <div className="grid grid-cols-5 gap-2">
            {ICONES_DISPONIVEIS.map(ic => (
              <button key={ic.value} onClick={() => setIcone(ic.value)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
                  icone === ic.value ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-sand-200 text-sand-500 hover:border-sand-300'
                }`}>
                {ic.icon}
                <span className="font-body text-xs">{ic.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-5">
        <button onClick={onCancelar} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-body text-sm text-sand-600 hover:bg-sand-100">
          <X className="w-4 h-4" /> Cancelar
        </button>
        <button onClick={() => onSalvar({ nome, qtdAtual: qtd, icone })} disabled={!nome.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-body text-sm font-medium shadow-card-md transition-all disabled:opacity-50">
          <Check className="w-4 h-4" /> Salvar
        </button>
      </div>
    </div>
  )
}

export default function ConsumoPage() {
  const [itens, setItens] = useState<ItemConsumo[]>([])
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<ItemConsumo | null>(null)
  const [carregando, setCarregando] = useState(true)
  const { isAuthorized } = useAuth()
  const podeEditar = isAuthorized('simples')

  useEffect(() => {
    return onValue(ref(db, 'consumo'), snap => {
      const data: ItemConsumo[] = []
      snap.forEach(child => data.push({ id: child.key!, ...child.val() }))
      setItens(data)
      setCarregando(false)
    })
  }, [])

  const salvar = async (dados: Omit<ItemConsumo, 'id' | 'createdAt'>) => {
    if (editando) {
      await update(ref(db, `consumo/${editando.id}`), dados)
      setEditando(null)
    } else {
      await push(ref(db, 'consumo'), { ...dados, createdAt: Date.now() })
      setFormAberto(false)
    }
  }

  const excluir = async (id: string) => {
    if (confirm('Excluir este item?')) await remove(ref(db, `consumo/${id}`))
  }

  const ajustarQtd = async (item: ItemConsumo, delta: number) => {
    const nova = Math.max(0, (item.qtdAtual || 0) + delta)
    await update(ref(db, `consumo/${item.id}`), { qtdAtual: nova })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-brand-900">Consumo</h1>
          <p className="font-body text-sand-500 text-sm mt-0.5">Controle de estoque alimentício</p>
        </div>
        {isAuthorized('adm') && (
          <button onClick={() => { setFormAberto(true); setEditando(null) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-600 text-white font-body font-medium text-sm rounded-xl shadow-card-md transition-all">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo item</span>
          </button>
        )}
      </div>

      {(formAberto && !editando) && (
        <FormConsumo onSalvar={salvar} onCancelar={() => setFormAberto(false)} />
      )}
      {editando && (
        <FormConsumo inicial={editando} onSalvar={salvar} onCancelar={() => setEditando(null)} />
      )}

      {carregando ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-sand-100" />)}
        </div>
      ) : itens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBasket className="w-12 h-12 text-sand-300 mb-3" strokeWidth={1} />
          <p className="font-body font-semibold text-brand-900">Nenhum item de consumo</p>
          <p className="font-body text-sand-400 text-sm mt-1">Cadastre itens alimentícios para controlar o estoque.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {itens.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-card border border-sand-100 p-4 flex flex-col gap-3 relative group">
              {/* Ícone e nome */}
              <div className="flex flex-col items-center gap-2 pt-2">
                <span className={`${item.qtdAtual === 0 ? 'text-red-300' : 'text-amber-500'}`}>
                  {getIconeConsumo(item.icone, 'w-10 h-10')}
                </span>
                <p className="font-body font-medium text-brand-900 text-sm text-center">{item.nome}</p>
              </div>

              {/* Quantidade */}
              <div className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 ${item.qtdAtual === 0 ? 'bg-red-50' : 'bg-sand-50'}`}>
                <button onClick={() => ajustarQtd(item, -1)} disabled={item.qtdAtual === 0}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sand-500 hover:bg-sand-200 disabled:opacity-30 transition-colors">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className={`font-mono font-medium text-base ${item.qtdAtual === 0 ? 'text-red-600' : 'text-brand-900'}`}>
                  {item.qtdAtual}
                </span>
                <button onClick={() => ajustarQtd(item, 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sand-500 hover:bg-sand-200 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {item.qtdAtual === 0 && (
                <span className="font-body text-xs text-red-500 text-center font-medium">Estoque zerado</span>
              )}

              {/* Ações (hover) */}
              {isAuthorized('adm') && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditando(item)} className="p-1.5 bg-white rounded-lg shadow-card text-sand-400 hover:text-brand-600">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => excluir(item.id)} className="p-1.5 bg-white rounded-lg shadow-card text-sand-400 hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
