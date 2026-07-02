import { useMemo, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { Estadia, FormaPagamento, StatusEstadia } from '../../types'
import { formatarMoeda, formatarData, calcularStatusPagamento, calcularNoites } from '../../utils/format'
import { lerArquivosComoBase64 } from '../../utils/upload'
import EntradaDetalhe from './EntradaDetalhe'
import {
  Plus, LogIn, Search, X, Check, CalendarCheck, CalendarX, BedDouble,
  UserCircle, Upload, Image as ImageIcon
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

interface NovaEntradaFormProps {
  onSalvar: (dados: Omit<Estadia, 'id' | 'createdAt'>) => void
  onCancelar: () => void
}

function NovaEntradaForm({ onSalvar, onCancelar }: NovaEntradaFormProps) {
  const { hospedes, getQuartosDisponiveisNoPeriodo } = useData()
  const [hospedeId, setHospedeId] = useState(hospedes[0]?.id || '')
  const [dataEntrada, setDataEntrada] = useState('')
  const [dataSaida, setDataSaida] = useState('')
  const [quartoId, setQuartoId] = useState('')
  const [valorDiaria, setValorDiaria] = useState(200)
  const [valorPago, setValorPago] = useState(0)
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix')
  const [observacoes, setObservacoes] = useState('')
  const [comprovantes, setComprovantes] = useState<string[]>([])
  const [enviandoFotos, setEnviandoFotos] = useState(false)

  const noites = calcularNoites(dataEntrada, dataSaida)
  const valorTotal = noites * valorDiaria
  const quartosDisponiveis = dataEntrada && dataSaida ? getQuartosDisponiveisNoPeriodo(dataEntrada, dataSaida) : []

  const adicionarFotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const vagas = 5 - comprovantes.length
    if (vagas <= 0) return
    setEnviandoFotos(true)
    try {
      const novas = await lerArquivosComoBase64(Array.from(files).slice(0, vagas))
      setComprovantes(prev => [...prev, ...novas])
    } finally {
      setEnviandoFotos(false)
    }
  }

  const podeSalvar = hospedeId && quartoId && dataEntrada && dataSaida && noites > 0

  const salvar = () => {
    if (!podeSalvar) return
    onSalvar({
      hospedeId, quartoId, dataEntrada, dataSaida, valorDiaria, valorTotal, valorPago,
      formaPagamento, statusPagamento: calcularStatusPagamento(valorPago, valorTotal),
      status: 'ativa', comprovantes, observacoes
    })
  }

  const inputClass = "w-full px-3 py-2 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
  const labelClass = "block font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-1"

  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-sand-100 p-6">
      <h2 className="font-body font-semibold text-brand-900 text-base mb-5">Nova entrada</h2>

      {hospedes.length === 0 ? (
        <p className="font-body text-sand-500 text-sm">Cadastre um hóspede antes de registrar uma entrada.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Hóspede</label>
            <select value={hospedeId} onChange={e => setHospedeId(e.target.value)} className={inputClass}>
              {hospedes.map(h => <option key={h.id} value={h.id}>{h.nome}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Data de entrada</label>
            <input type="date" value={dataEntrada} onChange={e => { setDataEntrada(e.target.value); setQuartoId('') }} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Data de saída</label>
            <input type="date" value={dataSaida} onChange={e => { setDataSaida(e.target.value); setQuartoId('') }} className={inputClass} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Quarto {noites > 0 && `(${quartosDisponiveis.length} disponível${quartosDisponiveis.length !== 1 ? 'is' : ''} no período)`}</label>
            {!dataEntrada || !dataSaida ? (
              <p className="font-body text-sand-400 text-sm px-1">Selecione as datas para ver os quartos disponíveis.</p>
            ) : noites <= 0 ? (
              <p className="font-body text-red-500 text-sm px-1">A data de saída deve ser depois da entrada.</p>
            ) : quartosDisponiveis.length === 0 ? (
              <p className="font-body text-red-500 text-sm px-1">Nenhum quarto disponível nesse período.</p>
            ) : (
              <select value={quartoId} onChange={e => setQuartoId(e.target.value)} className={inputClass}>
                <option value="">Selecione um quarto</option>
                {quartosDisponiveis.map(q => <option key={q.id} value={q.id}>{q.nome}</option>)}
              </select>
            )}
          </div>

          <div>
            <label className={labelClass}>Valor da diária (R$)</label>
            <input type="number" min={0} step="0.01" value={valorDiaria} onChange={e => setValorDiaria(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Valor total ({noites} noite{noites !== 1 ? 's' : ''})</label>
            <input type="number" min={0} step="0.01" value={valorTotal} readOnly className={`${inputClass} opacity-70`} />
          </div>

          <div>
            <label className={labelClass}>Valor pago no check-in (R$)</label>
            <input type="number" min={0} step="0.01" value={valorPago} onChange={e => setValorPago(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Forma de pagamento</label>
            <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value as FormaPagamento)} className={inputClass}>
              {FORMAS_PAGAMENTO.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Comprovantes ({comprovantes.length}/5)</label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {comprovantes.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-sand-200 group">
                  <img src={src} alt={`Comprovante ${idx + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => setComprovantes(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            {comprovantes.length < 5 && (
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-sand-300 text-sand-500 hover:border-brand-300 hover:text-brand-600 cursor-pointer transition-colors font-body text-sm">
                {enviandoFotos ? <ImageIcon className="w-4 h-4 animate-pulse" /> : <Upload className="w-4 h-4" />}
                {enviandoFotos ? 'Enviando...' : 'Adicionar fotos (recibos, comprovantes...)'}
                <input type="file" accept="image/*" multiple className="hidden" disabled={enviandoFotos}
                  onChange={e => { adicionarFotos(e.target.files); e.target.value = '' }} />
              </label>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Observações</label>
            <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className={`${inputClass} resize-none h-16`} />
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-5 justify-end">
        <button onClick={onCancelar} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-body text-sm text-sand-600 hover:bg-sand-100 transition-colors">
          <X className="w-4 h-4" /> Cancelar
        </button>
        <button onClick={salvar} disabled={!podeSalvar}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-body text-sm font-medium shadow-card-md transition-all disabled:opacity-50">
          <Check className="w-4 h-4" /> Registrar entrada
        </button>
      </div>
    </div>
  )
}

export default function EntradaPage() {
  const { estadias, hospedes, quartos, addEstadia } = useData()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todas' | StatusEstadia>('todas')
  const [formAberto, setFormAberto] = useState(false)
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null)

  const nomeHospede = (id: string) => hospedes.find(h => h.id === id)?.nome || '—'
  const nomeQuarto = (id: string) => quartos.find(q => q.id === id)?.nome || '—'

  const filtradas = useMemo(() => {
    return estadias
      .filter(e => filtroStatus === 'todas' || e.status === filtroStatus)
      .filter(e => {
        const termo = busca.toLowerCase()
        if (!termo) return true
        return nomeHospede(e.hospedeId).toLowerCase().includes(termo) || nomeQuarto(e.quartoId).toLowerCase().includes(termo)
      })
      .sort((a, b) => b.createdAt - a.createdAt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadias, busca, filtroStatus, hospedes, quartos])

  const selecionada = estadias.find(e => e.id === selecionadaId)
  if (selecionada) {
    return <EntradaDetalhe estadia={selecionada} onVoltar={() => setSelecionadaId(null)} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-brand-900">Entrada</h1>
          <p className="font-body text-sand-500 text-sm mt-0.5">{estadias.length} estadia{estadias.length !== 1 ? 's' : ''} registrada{estadias.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setFormAberto(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-600 text-white font-body font-medium text-sm rounded-xl shadow-card-md transition-all">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova entrada</span>
        </button>
      </div>

      {formAberto && (
        <NovaEntradaForm
          onSalvar={dados => { const nova = addEstadia(dados); setFormAberto(false); setSelecionadaId(nova.id) }}
          onCancelar={() => setFormAberto(false)}
        />
      )}

      {/* Busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
          <input
            value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por hóspede ou quarto..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-200 bg-white font-body text-sm text-brand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div className="flex gap-2">
          {(['todas', 'ativa', 'finalizada'] as const).map(s => (
            <button key={s} onClick={() => setFiltroStatus(s)}
              className={`px-3 py-2 rounded-xl font-body text-sm font-medium transition-colors ${
                filtroStatus === s ? 'bg-brand-700 text-white' : 'bg-white border border-sand-200 text-sand-600 hover:border-sand-300'
              }`}>
              {s === 'todas' ? 'Todas' : s === 'ativa' ? 'Ativas' : 'Finalizadas'}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <LogIn className="w-12 h-12 text-sand-300 mb-3" strokeWidth={1} />
          <p className="font-body font-semibold text-brand-900">Nenhuma entrada encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map(e => (
            <button key={e.id} onClick={() => setSelecionadaId(e.id)}
              className="w-full text-left bg-white rounded-2xl shadow-card border border-sand-100 p-4 flex flex-wrap items-center gap-x-6 gap-y-2 hover:border-brand-200 transition-colors">
              <span className="flex items-center gap-2 font-body font-semibold text-brand-900 text-sm">
                <UserCircle className="w-4 h-4 text-brand-500" /> {nomeHospede(e.hospedeId)}
              </span>
              <span className="flex items-center gap-1.5 font-body text-xs text-sand-500">
                <BedDouble className="w-3.5 h-3.5" /> {nomeQuarto(e.quartoId)}
              </span>
              <span className="flex items-center gap-1.5 font-body text-xs text-sand-500">
                <CalendarCheck className="w-3.5 h-3.5" /> {formatarData(e.dataEntrada)}
              </span>
              <span className="flex items-center gap-1.5 font-body text-xs text-sand-500">
                <CalendarX className="w-3.5 h-3.5" /> {formatarData(e.dataSaida)}
              </span>
              <span className="font-mono text-xs text-brand-900 font-medium">{formatarMoeda(e.valorTotal)}</span>
              <div className="ml-auto flex items-center gap-2">
                <span className={`font-body text-xs font-medium px-2 py-0.5 rounded-lg ${e.status === 'ativa' ? 'bg-brand-100 text-brand-700' : 'bg-sand-100 text-sand-600'}`}>
                  {e.status === 'ativa' ? 'Ativa' : 'Finalizada'}
                </span>
                <span className={`font-body text-xs font-medium px-2 py-0.5 rounded-lg ${STATUS_PAGAMENTO_CONFIG[e.statusPagamento].color}`}>
                  {STATUS_PAGAMENTO_CONFIG[e.statusPagamento].label}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
