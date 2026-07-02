import { Fragment } from 'react'
import { useData } from '../../contexts/DataContext'
import { CalendarDays } from 'lucide-react'

export default function OcupacaoCalendario() {
  const { quartos, estadias, hospedes } = useData()
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth()
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1)
  const quartosAtivos = quartos.filter(q => q.status !== 'desativado')

  const diaChave = (dia: number) => `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`

  const estadiaNoDia = (quartoId: string, dia: number) => {
    const chave = diaChave(dia)
    return estadias.find(e => e.quartoId === quartoId && chave >= e.dataEntrada && chave < e.dataSaida)
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-5 overflow-x-auto">
      <p className="font-body font-semibold text-brand-900 text-sm mb-4 flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-brand-600" />
        Ocupação — {hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
      </p>

      {quartosAtivos.length === 0 ? (
        <p className="font-body text-sand-400 text-sm">Nenhum quarto ativo cadastrado.</p>
      ) : (
        <div className="min-w-[640px]">
          <div className="grid" style={{ gridTemplateColumns: `120px repeat(${diasNoMes}, minmax(18px, 1fr))` }}>
            <div />
            {dias.map(d => (
              <div key={d} className="text-center font-mono text-[10px] text-sand-400 pb-1">{d}</div>
            ))}
            {quartosAtivos.map(q => (
              <Fragment key={q.id}>
                <div className="font-body text-xs font-medium text-brand-800 py-1 truncate pr-2 flex items-center">{q.nome}</div>
                {dias.map(d => {
                  const estadia = estadiaNoDia(q.id, d)
                  const hospede = estadia ? hospedes.find(h => h.id === estadia.hospedeId) : undefined
                  return (
                    <div
                      key={d}
                      title={estadia ? `${hospede?.nome || 'Hóspede'} · ${estadia.status === 'ativa' ? 'estadia ativa' : 'finalizada'}` : 'Livre'}
                      className={`h-5 border border-sand-100 ${
                        estadia ? (estadia.status === 'ativa' ? 'bg-brand-400' : 'bg-sand-300') : 'bg-sand-50'
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
    </div>
  )
}
