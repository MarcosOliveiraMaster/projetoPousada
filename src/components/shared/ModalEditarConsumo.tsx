import { useState } from 'react'
import Modal from './Modal'
import { ConsumoRegistro } from '../../types'
import { useData } from '../../contexts/DataContext'
import { Check, Trash2 } from 'lucide-react'

interface Props {
  registro: ConsumoRegistro
  nomeItem: string
  onFechar: () => void
}

function paraDatetimeLocal(ts: number) {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function ModalEditarConsumo({ registro, nomeItem, onFechar }: Props) {
  const { updateConsumoRegistro, removeConsumoRegistro } = useData()
  const [dataHora, setDataHora] = useState(paraDatetimeLocal(registro.data))
  const [pago, setPago] = useState(!!registro.pago)

  const salvar = () => {
    const novaData = new Date(dataHora).getTime()
    updateConsumoRegistro(registro.id, { data: Number.isNaN(novaData) ? registro.data : novaData, pago })
    onFechar()
  }

  const apagar = () => {
    if (confirm(`Apagar o consumo de "${nomeItem}"? A quantidade volta para o estoque.`)) {
      removeConsumoRegistro(registro.id)
      onFechar()
    }
  }

  return (
    <Modal titulo={`Editar consumo — ${nomeItem}`} onFechar={onFechar} largura="max-w-sm">
      <div className="space-y-4">
        <div>
          <label className="block font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-1">Data e hora</label>
          <input
            type="datetime-local" value={dataHora} onChange={e => setDataHora(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={pago} onChange={e => setPago(e.target.checked)} className="w-4 h-4 rounded accent-brand-600" />
          <span className="font-body text-sm text-brand-800">Marcar como pago</span>
        </label>
        <div className="flex items-center justify-between gap-3 pt-2">
          <button onClick={apagar} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-body text-sm text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" /> Apagar
          </button>
          <button onClick={salvar} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-body text-sm font-medium shadow-card-md transition-all">
            <Check className="w-4 h-4" /> Salvar
          </button>
        </div>
      </div>
    </Modal>
  )
}
