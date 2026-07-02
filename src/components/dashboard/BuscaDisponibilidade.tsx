import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { Search, BedDouble } from 'lucide-react'

export default function BuscaDisponibilidade() {
  const { getQuartosDisponiveisNoPeriodo } = useData()
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [buscou, setBuscou] = useState(false)

  const resultado = buscou ? getQuartosDisponiveisNoPeriodo(dataInicio, dataFim) : []

  return (
    <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-5">
      <p className="font-body font-semibold text-brand-900 text-sm mb-3 flex items-center gap-2">
        <Search className="w-4 h-4 text-brand-600" /> Quando um quarto está livre?
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input type="date" value={dataInicio}
          onChange={e => { setDataInicio(e.target.value); setBuscou(false) }}
          className="flex-1 px-3 py-2 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        <input type="date" value={dataFim}
          onChange={e => { setDataFim(e.target.value); setBuscou(false) }}
          className="flex-1 px-3 py-2 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        <button onClick={() => setBuscou(true)} disabled={!dataInicio || !dataFim}
          className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-body text-sm font-medium disabled:opacity-50 transition-colors">
          Buscar
        </button>
      </div>
      {buscou && (
        <div className="mt-3">
          {dataInicio >= dataFim ? (
            <p className="font-body text-sm text-red-500">A data final deve ser depois da inicial.</p>
          ) : resultado.length === 0 ? (
            <p className="font-body text-sm text-red-500">Nenhum quarto disponível nesse período.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {resultado.map(q => (
                <span key={q.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 font-body text-xs font-medium">
                  <BedDouble className="w-3.5 h-3.5" /> {q.nome}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
