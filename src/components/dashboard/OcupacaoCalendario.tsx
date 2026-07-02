import { Fragment, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import ModalQuarto from '../quartos/ModalQuarto'
import { CalendarDays, ChevronLeft, ChevronRight, Search } from 'lucide-react'

export default function OcupacaoCalendario() {
  const { quartos, estadias, hospedes } = useData()
  const [offsetMes, setOffsetMes] = useState(0)
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState<{ quartoId: string; estadiaId?: string } | null>(null)

  const base = new Date()
  const referencia = new Date(base.getFullYear(), base.getMonth() + offsetMes, 1)
  const ano = referencia.getFullYear()
  const mes = referencia.getMonth()
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1)

  const quartosAtivos = quartos
    .filter(q => q.status !== 'desativado')
    .filter(q => q.nome.toLowerCase().includes(busca.toLowerCase()))

  const diaChave = (dia: number) => `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`

  const estadiaNoDia = (quartoId: string, dia: number) => {
    const chave = diaChave(dia)
    return estadias.find(e => e.quartoId === quartoId && chave >= e.dataEntrada && chave < e.dataSaida)
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-5 overflow-x-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="font-body font-semibold text-brand-900 text-sm flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-brand-600" />
          Ocupação — {referencia.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sand-400" />
            <input
              value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Buscar quarto..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-sand-200 bg-sand-50 font-body text-xs text-brand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-brand-400 w-36"
            />
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setOffsetMes(o => o - 1)} title="Mês anterior"
              className="p-1.5 rounded-lg border border-sand-200 text-sand-500 hover:border-brand-300 hover:text-brand-700 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {offsetMes !== 0 && (
              <button onClick={() => setOffsetMes(0)} className="font-body text-xs text-brand-600 hover:underline px-1">Hoje</button>
            )}
            <button onClick={() => setOffsetMes(o => o + 1)} title="Próximo mês"
              className="p-1.5 rounded-lg border border-sand-200 text-sand-500 hover:border-brand-300 hover:text-brand-700 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {quartosAtivos.length === 0 ? (
        <p className="font-body text-sand-400 text-sm">Nenhum quarto encontrado.</p>
      ) : (
        <div className="min-w-[640px]">
          <div className="grid" style={{ gridTemplateColumns: `120px repeat(${diasNoMes}, minmax(18px, 1fr))` }}>
            <div />
            {dias.map(d => (
              <div key={d} className="text-center font-mono text-[10px] text-sand-400 pb-1">{d}</div>
            ))}
            {quartosAtivos.map(q => (
              <Fragment key={q.id}>
                <button
                  onClick={() => setSelecionado({ quartoId: q.id })}
                  className="font-body text-xs font-medium text-brand-800 py-1 truncate pr-2 flex items-center hover:text-brand-600 hover:underline text-left"
                >
                  {q.nome}
                </button>
                {dias.map(d => {
                  const estadia = estadiaNoDia(q.id, d)
                  const hospede = estadia ? hospedes.find(h => h.id === estadia.hospedeId) : undefined
                  return (
                    <div
                      key={d}
                      role={estadia ? 'button' : undefined}
                      onClick={() => setSelecionado({ quartoId: q.id, estadiaId: estadia?.id })}
                      title={estadia ? `${hospede?.nome || 'Hóspede'} · ${estadia.status === 'ativa' ? 'estadia ativa' : 'finalizada'}` : 'Livre'}
                      className={`h-5 border border-sand-100 cursor-pointer ${
                        estadia ? (estadia.status === 'ativa' ? 'bg-brand-400 hover:bg-brand-500' : 'bg-sand-300 hover:bg-sand-400') : 'bg-sand-50 hover:bg-sand-100'
                      }`}
                    />
                  )
                })}
              </Fragment>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <span className="flex items-center gap-1.5 font-body text-xs text-sand-500"><span className="w-3 h-3 rounded bg-brand-400 inline-block" /> Ocupado</span>
            <span className="flex items-center gap-1.5 font-body text-xs text-sand-500"><span className="w-3 h-3 rounded bg-sand-300 inline-block" /> Estadia finalizada</span>
            <span className="flex items-center gap-1.5 font-body text-xs text-sand-500"><span className="w-3 h-3 rounded bg-sand-50 border border-sand-200 inline-block" /> Livre</span>
          </div>
        </div>
      )}

      {selecionado && (
        <ModalQuarto
          quartoId={selecionado.quartoId}
          estadiaId={selecionado.estadiaId}
          onFechar={() => setSelecionado(null)}
        />
      )}
    </div>
  )
}
