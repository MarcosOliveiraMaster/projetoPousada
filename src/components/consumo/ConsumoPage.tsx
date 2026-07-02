import { useEffect, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { ItemConsumo } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { formatarMoeda } from '../../utils/format'
import { getIconeConsumo, getItemBibliotecaConsumo } from '../../constants/consumoBiblioteca'
import ModalBibliotecaConsumo from './ModalBibliotecaConsumo'
import {
  Plus, ShoppingBasket, Edit2, Trash2, X, Check, Minus,
  ArrowDownCircle, ArrowUpCircle, History
} from 'lucide-react'

interface FormConsumoProps {
  inicial?: ItemConsumo
  onSalvar: (dados: Omit<ItemConsumo, 'id' | 'createdAt'>) => void
  onCancelar: () => void
}

function FormConsumo({ inicial, onSalvar, onCancelar }: FormConsumoProps) {
  const { iconesConsumoFixados, adicionarIconeConsumoFixado, removerIconeConsumoFixado } = useData()
  const [nome, setNome] = useState(inicial?.nome || '')
  const [qtd, setQtd] = useState(inicial?.qtdAtual ?? 0)
  const [preco, setPreco] = useState(inicial?.preco ?? 0)
  const [icone, setIcone] = useState(inicial?.icone || iconesConsumoFixados[0] || 'coffee')
  const [bibliotecaAberta, setBibliotecaAberta] = useState(false)
  const [menuContexto, setMenuContexto] = useState<{ x: number; y: number; value: string } | null>(null)

  useEffect(() => {
    if (!menuContexto) return
    const fechar = () => setMenuContexto(null)
    window.addEventListener('click', fechar)
    window.addEventListener('scroll', fechar, true)
    return () => {
      window.removeEventListener('click', fechar)
      window.removeEventListener('scroll', fechar, true)
    }
  }, [menuContexto])

  const escolherDaBiblioteca = (value: string, label: string) => {
    setIcone(value)
    if (!nome.trim() || nome === getItemBibliotecaConsumo(icone)?.label) setNome(label)
    adicionarIconeConsumoFixado(value)
    setBibliotecaAberta(false)
  }

  const excluirFixado = () => {
    if (menuContexto) removerIconeConsumoFixado(menuContexto.value)
    setMenuContexto(null)
  }

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

        <div>
          <label className="block font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-2">Preço de venda (R$)</label>
          <input type="number" min={0} step="0.01" value={preco} onChange={e => setPreco(Number(e.target.value))} className={inputClass} placeholder="0,00" />
        </div>

        <div className="sm:col-span-2">
          <label className="block font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-2">Ícone</label>
          <p className="font-body text-xs text-sand-400 mb-2">Clique com o botão direito num ícone fixado para removê-lo.</p>
          <div className="grid grid-cols-5 gap-2">
            {iconesConsumoFixados.map(value => {
              const item = getItemBibliotecaConsumo(value)
              return (
                <button
                  key={value}
                  onClick={() => setIcone(value)}
                  onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setMenuContexto({ x: e.clientX, y: e.clientY, value }) }}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
                    icone === value ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-sand-200 text-sand-500 hover:border-sand-300'
                  }`}>
                  {getIconeConsumo(value, 'w-6 h-6')}
                  <span className="font-body text-xs text-center leading-tight">{item?.label || value}</span>
                </button>
              )
            })}
            <button onClick={() => setBibliotecaAberta(true)}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 border-dashed border-sand-300 text-sand-400 hover:border-amber-300 hover:text-amber-600 transition-all">
              <Plus className="w-6 h-6" strokeWidth={1.5} />
              <span className="font-body text-xs text-center leading-tight">Mais opções</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-5">
        <button onClick={onCancelar} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-body text-sm text-sand-600 hover:bg-sand-100">
          <X className="w-4 h-4" /> Cancelar
        </button>
        <button onClick={() => onSalvar({ nome, qtdAtual: qtd, preco, icone })} disabled={!nome.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-body text-sm font-medium shadow-card-md transition-all disabled:opacity-50">
          <Check className="w-4 h-4" /> Salvar
        </button>
      </div>

      {bibliotecaAberta && (
        <ModalBibliotecaConsumo onSelecionar={escolherDaBiblioteca} onFechar={() => setBibliotecaAberta(false)} />
      )}

      {menuContexto && (
        <div
          style={{ position: 'fixed', left: menuContexto.x, top: menuContexto.y, zIndex: 60 }}
          className="bg-white rounded-xl shadow-card-lg border border-sand-100 py-1 w-40"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={excluirFixado}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-body text-red-600 hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" /> Excluir
          </button>
        </div>
      )}
    </div>
  )
}

function CardItem({ item, podeEditar, onRepor, onEditar, onExcluir, totalEntradas, totalSaidas }: {
  item: ItemConsumo
  podeEditar: boolean
  onRepor: (qtd: number) => void
  onEditar: () => void
  onExcluir: () => void
  totalEntradas: number
  totalSaidas: number
}) {
  const [reporQtd, setReporQtd] = useState(10)

  return (
    <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4 flex flex-col gap-3 relative group">
      <div className="flex flex-col items-center gap-2 pt-2">
        <span className={item.qtdAtual === 0 ? 'text-red-300' : 'text-amber-500'}>
          {getIconeConsumo(item.icone, 'w-10 h-10')}
        </span>
        <p className="font-body font-medium text-brand-900 text-sm text-center">{item.nome}</p>
        <span className="font-mono text-xs text-sand-500">{formatarMoeda(item.preco)} / un.</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div className="rounded-lg bg-sand-50 py-1.5">
          <p className="font-mono text-sm font-semibold text-brand-900">{item.qtdAtual}</p>
          <p className="font-body text-[10px] text-sand-500 uppercase tracking-wide">Estoque</p>
        </div>
        <div className="rounded-lg bg-brand-50 py-1.5">
          <p className="font-mono text-sm font-semibold text-brand-700">{totalEntradas}</p>
          <p className="font-body text-[10px] text-sand-500 uppercase tracking-wide">Entradas</p>
        </div>
        <div className="rounded-lg bg-amber-50 py-1.5">
          <p className="font-mono text-sm font-semibold text-amber-700">{totalSaidas}</p>
          <p className="font-body text-[10px] text-sand-500 uppercase tracking-wide">Saídas</p>
        </div>
      </div>

      {item.qtdAtual === 0 && (
        <span className="font-body text-xs text-red-500 text-center font-medium">Estoque zerado</span>
      )}

      {podeEditar && (
        <div className="flex items-center gap-1.5">
          <input type="number" min={1} value={reporQtd} onChange={e => setReporQtd(Number(e.target.value))}
            className="w-16 text-center px-2 py-1.5 rounded-lg border border-sand-200 bg-sand-50 font-mono text-xs text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <button onClick={() => onRepor(reporQtd)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-brand-100 hover:bg-brand-200 text-brand-700 font-body text-xs font-medium transition-colors">
            <ArrowDownCircle className="w-3.5 h-3.5" /> Repor estoque
          </button>
        </div>
      )}

      {podeEditar && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEditar} className="p-1.5 bg-white rounded-lg shadow-card text-sand-400 hover:text-brand-600">
            <Edit2 className="w-3 h-3" />
          </button>
          <button onClick={onExcluir} className="p-1.5 bg-white rounded-lg shadow-card text-sand-400 hover:text-red-500">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function ConsumoPage() {
  const {
    itensConsumo: itens, addItemConsumo, updateItemConsumo, removeItemConsumo,
    registrarEntradaEstoque, movimentosEstoque, getMovimentacoesRecentes
  } = useData()
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<ItemConsumo | null>(null)
  const { isAuthorized } = useAuth()
  const podeEditar = isAuthorized('consumo')

  const salvar = (dados: Omit<ItemConsumo, 'id' | 'createdAt'>) => {
    if (editando) {
      updateItemConsumo(editando.id, dados)
      setEditando(null)
    } else {
      addItemConsumo(dados)
      setFormAberto(false)
    }
  }

  const excluir = (id: string) => {
    if (confirm('Excluir este item?')) removeItemConsumo(id)
  }

  const totaisPorItem = (itemId: string) => {
    const doItem = movimentosEstoque.filter(m => m.itemConsumoId === itemId)
    return {
      entradas: doItem.filter(m => m.tipo === 'entrada').reduce((acc, m) => acc + m.quantidade, 0),
      saidas: doItem.filter(m => m.tipo === 'saida').reduce((acc, m) => acc + m.quantidade, 0),
    }
  }

  const nomeItem = (id: string) => itens.find(i => i.id === id)?.nome || 'Item removido'
  const movimentacoes = getMovimentacoesRecentes(12)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-brand-900">Consumo</h1>
          <p className="font-body text-sand-500 text-sm mt-0.5">Estoque, entradas e saídas dos itens consumíveis</p>
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
        <FormConsumo onSalvar={salvar} onCancelar={() => setFormAberto(false)} />
      )}
      {editando && (
        <FormConsumo inicial={editando} onSalvar={salvar} onCancelar={() => setEditando(null)} />
      )}

      {itens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBasket className="w-12 h-12 text-sand-300 mb-3" strokeWidth={1} />
          <p className="font-body font-semibold text-brand-900">Nenhum item de consumo</p>
          <p className="font-body text-sand-400 text-sm mt-1">Cadastre itens alimentícios para controlar o estoque.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {itens.map(item => {
            const totais = totaisPorItem(item.id)
            return (
              <CardItem
                key={item.id}
                item={item}
                podeEditar={podeEditar}
                onRepor={qtd => registrarEntradaEstoque(item.id, qtd)}
                onEditar={() => setEditando(item)}
                onExcluir={() => excluir(item.id)}
                totalEntradas={totais.entradas}
                totalSaidas={totais.saidas}
              />
            )
          })}
        </div>
      )}

      {/* Movimentações recentes */}
      {movimentacoes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-6">
          <h2 className="font-body font-semibold text-brand-900 text-base mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-brand-600" /> Movimentações recentes
          </h2>
          <div className="space-y-1.5">
            {movimentacoes.map(m => (
              <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-sand-50 transition-colors">
                <div className="flex items-center gap-2">
                  {m.tipo === 'entrada'
                    ? <ArrowDownCircle className="w-4 h-4 text-brand-500" />
                    : <ArrowUpCircle className="w-4 h-4 text-amber-500" />}
                  <span className="font-body text-sm text-brand-800">{nomeItem(m.itemConsumoId)}</span>
                  {m.motivo && <span className="font-body text-xs text-sand-400">· {m.motivo}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs font-medium ${m.tipo === 'entrada' ? 'text-brand-700' : 'text-amber-700'}`}>
                    {m.tipo === 'entrada' ? '+' : '-'}{m.quantidade}
                  </span>
                  <span className="font-body text-xs text-sand-400 w-20 text-right">{new Date(m.data).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
