import { useEffect, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { formatarMoeda } from '../../utils/format'
import { ConsumoRegistro } from '../../types'
import ModalEditarConsumo from './ModalEditarConsumo'
import { ShoppingBasket, Plus, ArrowUpDown, CheckCircle2, Circle } from 'lucide-react'

interface Props {
  estadiaId: string
  quartoId: string
  somenteHistorico?: boolean
}

type Ordenacao = 'data' | 'item'

function formatarDataHora(ts: number) {
  return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function RegistrarConsumoForm({ estadiaId, quartoId, somenteHistorico = false }: Props) {
  const { itensConsumo, registrarConsumo, getConsumoDaEstadia, updateConsumoRegistro } = useData()
  const [itemId, setItemId] = useState(itensConsumo[0]?.id || '')
  const [quantidade, setQuantidade] = useState(1)
  const [preco, setPreco] = useState(0)
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('data')
  const [editando, setEditando] = useState<ConsumoRegistro | null>(null)

  const itemSelecionado = itensConsumo.find(i => i.id === itemId)

  useEffect(() => {
    if (itemSelecionado) setPreco(itemSelecionado.preco)
  }, [itemId]) // eslint-disable-line react-hooks/exhaustive-deps

  const nomeItem = (id: string) => itensConsumo.find(i => i.id === id)?.nome || 'Item removido'

  const registros = [...getConsumoDaEstadia(estadiaId)].sort((a, b) =>
    ordenacao === 'data' ? b.data - a.data : nomeItem(a.itemConsumoId).localeCompare(nomeItem(b.itemConsumoId))
  )
  const total = registros.reduce((acc, r) => acc + r.precoTotal, 0)

  const inputClass = "px-3 py-2 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"

  const registrar = () => {
    if (!itemSelecionado || quantidade <= 0 || quantidade > itemSelecionado.qtdAtual) return
    registrarConsumo(estadiaId, quartoId, itemSelecionado.id, quantidade, preco)
    setQuantidade(1)
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-body font-medium text-brand-900 text-sm flex items-center gap-2">
          <ShoppingBasket className="w-4 h-4 text-amber-500" /> {somenteHistorico ? 'Itens de consumo do quarto' : 'Controle de consumo'}
        </p>
        {registros.length > 1 && (
          <button
            onClick={() => setOrdenacao(o => o === 'data' ? 'item' : 'data')}
            className="flex items-center gap-1 font-body text-xs text-sand-500 hover:text-brand-700 transition-colors"
          >
            <ArrowUpDown className="w-3 h-3" /> {ordenacao === 'data' ? 'Por data' : 'Por item'}
          </button>
        )}
      </div>

      {itensConsumo.length === 0 ? (
        <p className="font-body text-sand-400 text-sm">Nenhum item de consumo cadastrado.</p>
      ) : (
        <>
          {!somenteHistorico && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                <select value={itemId} onChange={e => setItemId(e.target.value)} className={`${inputClass} col-span-2 sm:col-span-1`}>
                  {itensConsumo.map(i => (
                    <option key={i.id} value={i.id}>{i.nome} ({i.qtdAtual} un.)</option>
                  ))}
                </select>
                <input
                  type="number" min={1} max={itemSelecionado?.qtdAtual || 1}
                  value={quantidade} onChange={e => setQuantidade(Number(e.target.value))}
                  className={inputClass} placeholder="Qtd."
                />
                <input
                  type="number" min={0} step="0.01"
                  value={preco} onChange={e => setPreco(Number(e.target.value))}
                  className={inputClass} placeholder="Preço unit."
                />
                <button
                  onClick={registrar}
                  disabled={!itemSelecionado || itemSelecionado.qtdAtual < 1 || quantidade > (itemSelecionado?.qtdAtual || 0)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-body text-sm font-medium transition-colors disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" /> Registrar
                </button>
              </div>

              {itemSelecionado && itemSelecionado.qtdAtual === 0 && (
                <p className="font-body text-xs text-red-500 mb-2">Sem estoque disponível para este item.</p>
              )}
            </>
          )}

          {registros.length === 0 ? (
            <p className="font-body text-sand-400 text-sm">Nenhum consumo registrado ainda.</p>
          ) : (
            <div className="space-y-1.5 mt-3 pt-3 border-t border-sand-100">
              {registros.map(r => (
                <div key={r.id}
                  onClick={() => setEditando(r)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 cursor-pointer transition-colors"
                >
                  <button
                    onClick={e => { e.stopPropagation(); updateConsumoRegistro(r.id, { pago: !r.pago }) }}
                    title={r.pago ? 'Pago — clique para marcar como pendente' : 'Pendente — clique para marcar como pago'}
                    className={r.pago ? 'text-brand-600' : 'text-sand-400 hover:text-brand-500'}
                  >
                    {r.pago ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-brand-800 truncate">{nomeItem(r.itemConsumoId)} × {r.quantidade}</p>
                    <p className="font-body text-[11px] text-sand-500">{formatarDataHora(r.data)}</p>
                  </div>
                  <span className="font-mono text-xs font-medium text-amber-700 flex-shrink-0">{formatarMoeda(r.precoTotal)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="font-body text-sm font-semibold text-brand-900">Total consumido</span>
                <span className="font-mono text-sm font-semibold text-brand-900">{formatarMoeda(total)}</span>
              </div>
            </div>
          )}
        </>
      )}

      {editando && (
        <ModalEditarConsumo
          registro={editando}
          nomeItem={nomeItem(editando.itemConsumoId)}
          onFechar={() => setEditando(null)}
        />
      )}
    </div>
  )
}
