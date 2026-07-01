import { useEffect, useState } from 'react'
import { ref, onValue, push, update, remove } from 'firebase/database'
import { db } from '../../services/firebase'
import { Quarto, StatusQuarto, ItemMobilia, ItemConsumo } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import {
  Plus, BedDouble, Package, ShoppingBasket, TrendingUp,
  MoreVertical, Edit2, Trash2, Check, X
} from 'lucide-react'
import QuartoDetalhe from './QuartoDetalhe'

const STATUS_CONFIG: Record<StatusQuarto, { label: string; color: string; dot: string }> = {
  disponivel: { label: 'Disponível',   color: 'bg-brand-100 text-brand-700',  dot: 'bg-brand-500' },
  ocupado:    { label: 'Ocupado',      color: 'bg-red-50 text-red-700',       dot: 'bg-red-500' },
  limpeza:    { label: 'Em limpeza',   color: 'bg-amber-50 text-amber-700',   dot: 'bg-amber-500' },
  desativado: { label: 'Desativado',   color: 'bg-sand-100 text-sand-600',    dot: 'bg-sand-400' },
}

interface QuartoCardProps {
  quarto: Quarto
  itensMobilia: ItemMobilia[]
  itensConsumo: ItemConsumo[]
  onSelect: (q: Quarto) => void
  podeEditar: boolean
}

function QuartoCard({ quarto, itensMobilia, itensConsumo, onSelect, podeEditar }: QuartoCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editandoNome, setEditandoNome] = useState(false)
  const [novoNome, setNovoNome] = useState(quarto.nome)
  const cfg = STATUS_CONFIG[quarto.status]

  const qtdMobilia = (quarto.itensMobilia || []).length
  const qtdConsumo = (quarto.itensConsumo || []).length

  const salvarNome = async () => {
    if (novoNome.trim()) {
      await update(ref(db, `quartos/${quarto.id}`), { nome: novoNome.trim() })
    }
    setEditandoNome(false)
  }

  const excluirQuarto = async () => {
    if (confirm(`Excluir o quarto "${quarto.nome}"?`)) {
      await remove(ref(db, `quartos/${quarto.id}`))
    }
    setMenuOpen(false)
  }

  const mudarStatus = async (status: StatusQuarto) => {
    await update(ref(db, `quartos/${quarto.id}`), { status })
    setMenuOpen(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-sand-100 overflow-hidden flex flex-col">

      {/* Header do card com nome editável */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        {editandoNome ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && salvarNome()}
              autoFocus
              className="flex-1 font-body font-semibold text-brand-900 text-sm border-b-2 border-brand-400 outline-none bg-transparent"
            />
            <button onClick={salvarNome} className="p-1 text-brand-600 hover:text-brand-800"><Check className="w-4 h-4" /></button>
            <button onClick={() => setEditandoNome(false)} className="p-1 text-sand-400 hover:text-red-500"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <h3 className="font-body font-semibold text-brand-900 text-sm flex-1">{quarto.nome}</h3>
        )}
        {podeEditar && !editandoNome && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-1.5 text-sand-400 hover:text-brand-600 hover:bg-sand-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-card-lg border border-sand-100 z-10 py-1">
                <button onClick={() => { setEditandoNome(true); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm font-body text-brand-800 hover:bg-sand-50">
                  <Edit2 className="w-3.5 h-3.5" /> Renomear
                </button>
                <div className="border-t border-sand-100 my-1" />
                <p className="px-3 py-1 text-xs font-body text-sand-400 uppercase tracking-wider">Mudar status</p>
                {(Object.keys(STATUS_CONFIG) as StatusQuarto[]).map(s => (
                  <button key={s} onClick={() => mudarStatus(s)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm font-body hover:bg-sand-50 ${quarto.status === s ? 'text-brand-700 font-medium' : 'text-brand-800'}`}>
                    <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
                <div className="border-t border-sand-100 my-1" />
                <button onClick={excluirQuarto}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm font-body text-red-600 hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ícone principal do quarto */}
      <button
        onClick={() => onSelect(quarto)}
        className="mx-4 mb-3 rounded-xl bg-sand-50 hover:bg-brand-50 transition-colors flex items-center justify-center py-6 group"
      >
        <BedDouble className="w-16 h-16 text-brand-300 group-hover:text-brand-500 transition-colors" strokeWidth={1} />
      </button>

      {/* Status badge */}
      <div className="px-4 mb-3">
        <span className={`inline-flex items-center gap-1.5 font-body text-xs font-medium px-2.5 py-1 rounded-lg ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {/* Grid de ações */}
      <div className="px-4 pb-4 grid grid-cols-3 gap-2">
        <button onClick={() => onSelect(quarto)}
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-sand-50 transition-colors group">
          <Package className="w-5 h-5 text-brand-400 group-hover:text-brand-600" />
          <span className="font-body text-xs text-sand-500">{qtdMobilia} Itens</span>
        </button>
        <button onClick={() => onSelect(quarto)}
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-sand-50 transition-colors group">
          <ShoppingBasket className="w-5 h-5 text-amber-400 group-hover:text-amber-600" />
          <span className="font-body text-xs text-sand-500">{qtdConsumo} Consumo</span>
        </button>
        <button onClick={() => onSelect(quarto)}
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-sand-50 transition-colors group">
          <TrendingUp className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600" />
          <span className="font-body text-xs text-sand-500">Ver mais</span>
        </button>
      </div>
    </div>
  )
}

export default function QuartosPage() {
  const [quartos, setQuartos] = useState<Quarto[]>([])
  const [itensMobilia, setItensMobilia] = useState<ItemMobilia[]>([])
  const [itensConsumo, setItensConsumo] = useState<ItemConsumo[]>([])
  const [quartoSelecionado, setQuartoSelecionado] = useState<Quarto | null>(null)
  const [carregando, setCarregando] = useState(true)
  const { isAuthorized } = useAuth()
  const podeEditar = isAuthorized('adm')

  useEffect(() => {
    const unsubQ = onValue(ref(db, 'quartos'), snap => {
      const data: Quarto[] = []
      snap.forEach(child => data.push({ id: child.key!, ...child.val() }))
      setQuartos(data)
      setCarregando(false)
    })
    const unsubI = onValue(ref(db, 'itens'), snap => {
      const data: ItemMobilia[] = []
      snap.forEach(child => data.push({ id: child.key!, ...child.val() }))
      setItensMobilia(data)
    })
    const unsubC = onValue(ref(db, 'consumo'), snap => {
      const data: ItemConsumo[] = []
      snap.forEach(child => data.push({ id: child.key!, ...child.val() }))
      setItensConsumo(data)
    })
    return () => { unsubQ(); unsubI(); unsubC() }
  }, [])

  const novoQuarto = async () => {
    const num = quartos.length + 1
    await push(ref(db, 'quartos'), {
      nome: `Quarto ${num}`,
      status: 'disponivel',
      itensMobilia: [],
      itensConsumo: [],
      posicoes: {},
      createdAt: Date.now()
    })
  }

  if (quartoSelecionado) {
    return (
      <QuartoDetalhe
        quarto={quartoSelecionado}
        itensMobilia={itensMobilia}
        itensConsumo={itensConsumo}
        onVoltar={() => setQuartoSelecionado(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-brand-900">Quartos</h1>
          <p className="font-body text-sand-500 text-sm mt-0.5">{quartos.length} quarto{quartos.length !== 1 ? 's' : ''} cadastrado{quartos.length !== 1 ? 's' : ''}</p>
        </div>
        {podeEditar && (
          <button
            onClick={novoQuarto}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-600 text-white font-body font-medium text-sm rounded-xl shadow-card-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo quarto</span>
            <span className="sm:hidden">Novo</span>
          </button>
        )}
      </div>

      {/* Cards */}
      {carregando ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-56 animate-pulse border border-sand-100" />
          ))}
        </div>
      ) : quartos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BedDouble className="w-16 h-16 text-sand-300 mb-4" strokeWidth={1} />
          <h3 className="font-body font-semibold text-brand-900 mb-1">Nenhum quarto cadastrado</h3>
          <p className="font-body text-sand-400 text-sm mb-4">Comece adicionando o primeiro quarto da pousada.</p>
          {podeEditar && (
            <button onClick={novoQuarto}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 text-white font-body text-sm rounded-xl">
              <Plus className="w-4 h-4" /> Cadastrar novo quarto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {quartos.map(q => (
            <QuartoCard
              key={q.id}
              quarto={q}
              itensMobilia={itensMobilia}
              itensConsumo={itensConsumo}
              onSelect={setQuartoSelecionado}
              podeEditar={podeEditar}
            />
          ))}
        </div>
      )}
    </div>
  )
}
