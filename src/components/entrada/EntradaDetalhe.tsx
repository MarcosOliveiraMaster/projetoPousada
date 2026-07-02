import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { Estadia, FormaPagamento } from '../../types'
import { formatarMoeda, formatarData, calcularStatusPagamento } from '../../utils/format'
import RegistrarConsumoForm from '../shared/RegistrarConsumoForm'
import GaleriaComprovantes from '../shared/GaleriaComprovantes'
import {
  ArrowLeft, UserCircle, BedDouble, CalendarCheck, CalendarX, Banknote,
  Image as ImageIcon, CheckCircle2, Wallet
} from 'lucide-react'

const FORMAS_PAGAMENTO: { value: FormaPagamento; label: string }[] = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'Pix' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'transferencia', label: 'Transferência' },
]

const STATUS_PAGAMENTO_CONFIG = {
  pendente: { label: 'Pendente', color: 'bg-red-50 text-red-700' },
  parcial:  { label: 'Parcial',  color: 'bg-amber-50 text-amber-700' },
  pago:     { label: 'Pago',     color: 'bg-brand-100 text-brand-700' },
}

interface Props {
  estadia: Estadia
  onVoltar: () => void
}

export default function EntradaDetalhe({ estadia, onVoltar }: Props) {
  const { hospedes, quartos, updateEstadia, finalizarEstadia, getTotalConsumoEstadia } = useData()
  const [valorPago, setValorPago] = useState(estadia.valorPago)
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>(estadia.formaPagamento)
  const [observacoes, setObservacoes] = useState(estadia.observacoes)

  const hospede = hospedes.find(h => h.id === estadia.hospedeId)
  const quarto = quartos.find(q => q.id === estadia.quartoId)
  const totalConsumo = getTotalConsumoEstadia(estadia.id)
  const saldoFinal = estadia.valorTotal + totalConsumo - valorPago
  const statusPagamento = calcularStatusPagamento(valorPago, estadia.valorTotal + totalConsumo)

  const salvarPagamento = () => {
    updateEstadia(estadia.id, { valorPago, formaPagamento, statusPagamento })
  }

  const salvarObservacoes = () => {
    updateEstadia(estadia.id, { observacoes })
  }

  const inputClass = "w-full px-3 py-2 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onVoltar} className="p-2 hover:bg-sand-100 rounded-xl transition-colors text-brand-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl text-brand-900">{hospede?.nome || 'Hóspede'}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-block font-body text-xs font-medium px-2 py-0.5 rounded-lg ${estadia.status === 'ativa' ? 'bg-brand-100 text-brand-700' : 'bg-sand-100 text-sand-600'}`}>
              {estadia.status === 'ativa' ? 'Estadia ativa' : 'Finalizada'}
            </span>
            <span className={`inline-block font-body text-xs font-medium px-2 py-0.5 rounded-lg ${STATUS_PAGAMENTO_CONFIG[statusPagamento].color}`}>
              {STATUS_PAGAMENTO_CONFIG[statusPagamento].label}
            </span>
          </div>
        </div>
        {estadia.status === 'ativa' && (
          <button
            onClick={() => { if (confirm('Finalizar esta estadia? O quarto ficará em limpeza.')) finalizarEstadia(estadia.id) }}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-body text-sm font-medium shadow-card-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" /> Finalizar estadia
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Dados da estadia */}
          <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="font-body text-xs text-sand-500 uppercase tracking-wide flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> Quarto</p>
              <p className="font-body text-sm font-medium text-brand-900 mt-1">{quarto?.nome || '—'}</p>
            </div>
            <div>
              <p className="font-body text-xs text-sand-500 uppercase tracking-wide flex items-center gap-1"><CalendarCheck className="w-3.5 h-3.5" /> Entrada</p>
              <p className="font-body text-sm font-medium text-brand-900 mt-1">{formatarData(estadia.dataEntrada)}</p>
            </div>
            <div>
              <p className="font-body text-xs text-sand-500 uppercase tracking-wide flex items-center gap-1"><CalendarX className="w-3.5 h-3.5" /> Saída</p>
              <p className="font-body text-sm font-medium text-brand-900 mt-1">{formatarData(estadia.dataSaida)}</p>
            </div>
            <div>
              <p className="font-body text-xs text-sand-500 uppercase tracking-wide flex items-center gap-1"><Banknote className="w-3.5 h-3.5" /> Diária</p>
              <p className="font-body text-sm font-medium text-brand-900 mt-1">{formatarMoeda(estadia.valorDiaria)}</p>
            </div>
          </div>

          {/* Consumo */}
          <RegistrarConsumoForm estadiaId={estadia.id} quartoId={estadia.quartoId} />

          {/* Comprovantes */}
          <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4">
            <p className="font-body font-medium text-brand-900 text-sm mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-500" /> Comprovantes
            </p>
            <GaleriaComprovantes
              arquivos={estadia.comprovantes}
              onChange={comprovantes => updateEstadia(estadia.id, { comprovantes })}
            />
          </div>

          {/* Observações */}
          <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4">
            <p className="font-body font-medium text-brand-900 text-sm mb-3">Observações</p>
            <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} onBlur={salvarObservacoes}
              className={`${inputClass} resize-none h-20`} placeholder="Observações sobre a estadia..." />
          </div>
        </div>

        {/* Painel de pagamento */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4">
            <p className="font-body font-medium text-brand-900 text-sm mb-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" /> Pagamento
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between font-body text-sm">
                <span className="text-sand-500">Diária × noites</span>
                <span className="font-medium text-brand-900">{formatarMoeda(estadia.valorTotal)}</span>
              </div>
              <div className="flex items-center justify-between font-body text-sm">
                <span className="text-sand-500">Consumo</span>
                <span className="font-medium text-brand-900">{formatarMoeda(totalConsumo)}</span>
              </div>
              <div className="border-t border-sand-100 pt-2 flex items-center justify-between font-body text-sm">
                <span className="font-semibold text-brand-900">Total geral</span>
                <span className="font-semibold text-brand-900">{formatarMoeda(estadia.valorTotal + totalConsumo)}</span>
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-1">Valor pago</label>
                <input type="number" min={0} step="0.01" value={valorPago} onChange={e => setValorPago(Number(e.target.value))}
                  onBlur={salvarPagamento} className={inputClass} />
              </div>
              <div>
                <label className="block font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-1">Forma de pagamento</label>
                <select value={formaPagamento} onChange={e => { setFormaPagamento(e.target.value as FormaPagamento); }}
                  onBlur={salvarPagamento} className={inputClass}>
                  {FORMAS_PAGAMENTO.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>

              <div className={`rounded-xl px-3 py-3 text-center ${saldoFinal > 0 ? 'bg-red-50' : 'bg-brand-50'}`}>
                <p className="font-body text-xs text-sand-500 uppercase tracking-wide">Saldo final</p>
                <p className={`font-display text-xl ${saldoFinal > 0 ? 'text-red-600' : 'text-brand-700'}`}>
                  {formatarMoeda(Math.max(0, saldoFinal))}
                </p>
                {saldoFinal <= 0 && <p className="font-body text-xs text-brand-600 mt-0.5">Quitado</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
