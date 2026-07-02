import { useState } from 'react'
import Modal from '../shared/Modal'
import { BIBLIOTECA_CONSUMO } from '../../constants/consumoBiblioteca'
import { Search } from 'lucide-react'

interface Props {
  onSelecionar: (value: string, label: string) => void
  onFechar: () => void
}

export default function ModalBibliotecaConsumo({ onSelecionar, onFechar }: Props) {
  const [busca, setBusca] = useState('')
  const filtrados = BIBLIOTECA_CONSUMO.filter(i => i.label.toLowerCase().includes(busca.toLowerCase()))

  return (
    <Modal titulo="Biblioteca de ícones — comidas e bebidas" onFechar={onFechar} largura="max-w-xl">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
        <input
          value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar item..." autoFocus
          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
        {filtrados.map(item => {
          const Icon = item.icon
          return (
            <button key={item.value} onClick={() => onSelecionar(item.value, item.label)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-sand-200 text-sand-500 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50 transition-all">
              <Icon className="w-6 h-6" strokeWidth={1.5} />
              <span className="font-body text-xs text-center leading-tight">{item.label}</span>
            </button>
          )
        })}
        {filtrados.length === 0 && (
          <p className="col-span-full text-center font-body text-sand-400 text-sm py-6">Nenhum item encontrado.</p>
        )}
      </div>
    </Modal>
  )
}
