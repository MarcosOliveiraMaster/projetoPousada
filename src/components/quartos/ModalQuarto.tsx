import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import Modal from '../shared/Modal'
import PlantaQuartoMini from './PlantaQuartoMini'
import RegistrarConsumoForm from '../shared/RegistrarConsumoForm'
import GaleriaComprovantes from '../shared/GaleriaComprovantes'
import { formatarData, calcularNoites } from '../../utils/format'
import { UserCircle, CalendarCheck, CalendarX, Moon, MapPin, Image as ImageIcon } from 'lucide-react'

interface Props {
  quartoId: string
  estadiaId?: string
  onFechar: () => void
}

export default function ModalQuarto({ quartoId, estadiaId, onFechar }: Props) {
  const { quartos, itensMobilia, hospedes, estadias, updateQuarto, updateEstadia, getEstadiaAtivaPorQuarto } = useData()
  const { isAuthorized } = useAuth()
  const podeEditar = isAuthorized('quartos')

  const quarto = quartos.find(q => q.id === quartoId)
  const estadia = estadiaId ? estadias.find(e => e.id === estadiaId) : getEstadiaAtivaPorQuarto(quartoId)
  const hospede = estadia ? hospedes.find(h => h.id === estadia.hospedeId) : undefined

  const [descricao, setDescricao] = useState(quarto?.descricao || '')

  if (!quarto) return null

  const salvarDescricao = () => updateQuarto(quarto.id, { descricao })
  const noites = estadia ? calcularNoites(estadia.dataEntrada, estadia.dataSaida) : 0

  return (
    <Modal titulo={quarto.nome} onFechar={onFechar} largura="max-w-3xl">
      <div className="space-y-5">

        {/* Fotos do quarto */}
        <div>
          <p className="font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-2">Fotos do quarto</p>
          <GaleriaComprovantes
            arquivos={quarto.fotos || []}
            onChange={fotos => updateQuarto(quarto.id, { fotos })}
            max={8}
            podeEditar={podeEditar}
          />
        </div>

        {/* Descrição */}
        <div>
          <p className="font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-2">Descrição</p>
          {podeEditar ? (
            <textarea
              value={descricao} onChange={e => setDescricao(e.target.value)} onBlur={salvarDescricao}
              placeholder="Descreva o quarto (vista, tamanho, comodidades...)"
              className="w-full px-3 py-2 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 resize-none h-16 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          ) : (
            <p className="font-body text-sm text-sand-600">{descricao || 'Sem descrição.'}</p>
          )}
        </div>

        {/* Hóspede / ocupação */}
        <div className="bg-sand-50 rounded-xl p-4">
          {estadia ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="flex items-center gap-2 font-body text-sm font-medium text-brand-900">
                <UserCircle className="w-4 h-4 text-brand-500" /> {hospede?.nome || 'Hóspede'}
              </span>
              <span className="flex items-center gap-1.5 font-body text-xs text-sand-500">
                <CalendarCheck className="w-3.5 h-3.5" /> {formatarData(estadia.dataEntrada)}
              </span>
              <span className="flex items-center gap-1.5 font-body text-xs text-sand-500">
                <CalendarX className="w-3.5 h-3.5" /> {formatarData(estadia.dataSaida)}
              </span>
              <span className="flex items-center gap-1.5 font-body text-xs text-sand-500">
                <Moon className="w-3.5 h-3.5" /> {noites} noite{noites !== 1 ? 's' : ''}
              </span>
              <span className={`font-body text-xs font-medium px-2 py-0.5 rounded-lg ${estadia.status === 'ativa' ? 'bg-brand-100 text-brand-700' : 'bg-sand-100 text-sand-600'}`}>
                {estadia.status === 'ativa' ? 'Estadia ativa' : 'Estadia finalizada'}
              </span>
            </div>
          ) : (
            <p className="font-body text-sm text-sand-400">Sem hóspede associado a este quarto no momento.</p>
          )}
        </div>

        {/* Mapa do quarto */}
        <div>
          <p className="font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Mapa do quarto
          </p>
          <PlantaQuartoMini quarto={quarto} itensMobilia={itensMobilia} />
        </div>

        {/* Consumo da estadia */}
        {estadia && (
          <RegistrarConsumoForm estadiaId={estadia.id} quartoId={quarto.id} somenteHistorico={estadia.status !== 'ativa'} />
        )}

        {/* Área de imagens (comprovantes da estadia) */}
        {estadia && (
          <div>
            <p className="font-body text-xs font-medium text-brand-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Imagens da estadia
            </p>
            <GaleriaComprovantes
              arquivos={estadia.comprovantes}
              onChange={comprovantes => updateEstadia(estadia.id, { comprovantes })}
              podeEditar={podeEditar}
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
