import { useEffect, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { formatarMoeda } from '../../utils/format'
import { ShoppingBasket, Plus } from 'lucide-react'

interface Props {
  estadiaId: string
  quartoId: string
}

export default function RegistrarConsumoForm({ estadiaId, quartoId }: Props) {
  const { itensConsumo, registrarConsumo, getConsumoDaEstadia } = useData()
  const [itemId, setItemId] = useState(itensConsumo[0]?.id || '')
  const [quantidade, setQuantidade] = useState(1)
  const [preco, setPreco] = useState(0)

  const itemSelecionado = itensConsumo.find(i => i.id === itemId)

  useEffect(() => {
    if (itemSelecionado) setPreco(itemSelecionado.preco)
  }, [itemId]) // eslint-disable-line react-hooks/exhaustive-deps

  const registros = getConsumoDaEstadia(estadiaId)
  const total = registros.reduce((acc, r) => acc + r.precoTotal, 0)

  const inputClass = "px-3 py-2 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"

  const registrar = () => {
    if (!itemSelecionado || quantidade <= 0 || quantidade > itemSelecionado.qtdAtual) return
    registrarConsumo(estadiaId, quartoId, itemSelecionado.id, quantidade, preco)
    setQuantidade(1)
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4">
      <p className="font-body font-medium text-brand-900 text-sm mb-3 flex items-center gap-2">
        <ShoppingBasket className="w-4 h-4 text-amber-500" /> Controle de consumo
      </p>

      {itensConsumo.length === 0 ? (
        <p className="font-body text-sand-400 text-sm">Nenhum item de consumo cadastrado.</p>
      ) : (
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

          {registros.length > 0 && (
            <div className="space-y-1.5 mt-3 pt-3 border-t border-sand-100">
              {registros.map(r => {
                const item = itensConsumo.find(i => i.id === r.itemConsumoId)
                return (
                  <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50">
                    <span className="font-body text-sm text-brand-800">{item?.nome || 'Item removido'} × {r.quantidade}</span>
                    <span className="font-mono text-xs font-medium text-amber-700">{formatarMoeda(r.precoTotal)}</span>
                  </div>
                )
              })}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="font-body text-sm font-semibold text-brand-900">Total consumido</span>
                <span className="font-mono text-sm font-semibold text-brand-900">{formatarMoeda(total)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
