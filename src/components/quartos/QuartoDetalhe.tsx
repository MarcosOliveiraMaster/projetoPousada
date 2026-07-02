import { useState, useRef } from 'react'
import { useData } from '../../contexts/DataContext'
import { Quarto, StatusQuarto, ItemMobilia } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { formatarData } from '../../utils/format'
import RegistrarConsumoForm from '../shared/RegistrarConsumoForm'
import {
  ArrowLeft, BedDouble, Tv, Refrigerator, AirVent, Microwave, Fan, ShowerHead, Bath,
  Package, Sofa, CheckCircle2, RotateCw, CalendarCheck, CalendarX, UserCircle
} from 'lucide-react'

const STATUS_CONFIG: Record<StatusQuarto, { label: string; color: string }> = {
  disponivel: { label: 'Disponível',  color: 'bg-brand-100 text-brand-700' },
  ocupado:    { label: 'Ocupado',     color: 'bg-red-50 text-red-700' },
  limpeza:    { label: 'Em limpeza',  color: 'bg-amber-50 text-amber-700' },
  desativado: { label: 'Desativado',  color: 'bg-sand-100 text-sand-600' },
}

const TIPO_ICONE: Record<string, React.ReactNode> = {
  'cama':                    <BedDouble className="w-8 h-8" strokeWidth={1.5} />,
  'guarda-roupa':            <Sofa className="w-8 h-8" strokeWidth={1.5} />,
  'televisao':               <Tv className="w-8 h-8" strokeWidth={1.5} />,
  'frigobar':                <Refrigerator className="w-8 h-8" strokeWidth={1.5} />,
  'ar-condicionado':         <AirVent className="w-8 h-8" strokeWidth={1.5} />,
  'microondas':              <Microwave className="w-8 h-8" strokeWidth={1.5} />,
  'ventilador-teto':         <Fan className="w-8 h-8" strokeWidth={1.5} />,
  'banheiro-agua-quente':    <ShowerHead className="w-8 h-8" strokeWidth={1.5} />,
  'banheiro-sem-agua-quente': <Bath className="w-8 h-8" strokeWidth={1.5} />,
}

interface Props {
  quarto: Quarto
  itensMobilia: ItemMobilia[]
  onVoltar: () => void
}

export default function QuartoDetalhe({ quarto, itensMobilia, onVoltar }: Props) {
  const { itensConsumo, updateQuarto, getEstadiaAtivaPorQuarto, hospedes } = useData()
  const { isAuthorized } = useAuth()
  const podeEditar = isAuthorized('quartos')
  const canvasRef = useRef<HTMLDivElement>(null)

  const itensDoQuarto = itensMobilia.filter(i => (quarto.itensMobilia || []).includes(i.id))
  const consumoDoQuarto = itensConsumo.filter(i => (quarto.itensConsumo || []).includes(i.id))
  const temFrigobar = itensDoQuarto.some(i => i.tipo === 'frigobar')
  const estadiaAtiva = getEstadiaAtivaPorQuarto(quarto.id)
  const hospedeAtivo = estadiaAtiva ? hospedes.find(h => h.id === estadiaAtiva.hospedeId) : undefined

  // Posições salvas (mantidas em estado local para o drag ficar fluido; persistidas no DataContext)
  const [posicoes, setPosicoes] = useState<Quarto['posicoes']>(quarto.posicoes || {})

  const draggingRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)

  const posOf = (id: string) => posicoes[id] || { itemId: id, x: 20, y: 20, rotacao: 0 }

  const onMouseDown = (e: React.MouseEvent, id: string) => {
    if (!podeEditar) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const pos = posOf(id)
    draggingRef.current = {
      id,
      offsetX: e.clientX - rect.left - pos.x,
      offsetY: e.clientY - rect.top - pos.y
    }
    e.preventDefault()
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const { id, offsetX, offsetY } = draggingRef.current
    const x = Math.max(0, Math.min(e.clientX - rect.left - offsetX, rect.width - 72))
    const y = Math.max(0, Math.min(e.clientY - rect.top - offsetY, rect.height - 72))
    setPosicoes(prev => ({ ...prev, [id]: { ...posOf(id), x, y } }))
  }

  const onMouseUp = () => {
    if (!draggingRef.current) return
    const id = draggingRef.current.id
    draggingRef.current = null
    updateQuarto(quarto.id, { posicoes: { ...quarto.posicoes, [id]: posOf(id) } })
  }

  const rotacionar = (id: string) => {
    const atual = posOf(id)
    const nova = { ...atual, rotacao: ((atual.rotacao || 0) + 90) % 360 }
    setPosicoes(prev => ({ ...prev, [id]: nova }))
    updateQuarto(quarto.id, { posicoes: { ...quarto.posicoes, [id]: nova } })
  }

  const adicionarItem = (itemId: string) => {
    const lista = [...(quarto.itensMobilia || []), itemId]
    updateQuarto(quarto.id, { itensMobilia: lista })
  }

  const adicionarConsumo = (itemId: string) => {
    const lista = [...(quarto.itensConsumo || []), itemId]
    updateQuarto(quarto.id, { itensConsumo: lista })
  }

  const mudarStatus = (status: StatusQuarto) => {
    updateQuarto(quarto.id, { status })
  }

  const disponiveisParaAdicionar = itensMobilia.filter(i => !(quarto.itensMobilia || []).includes(i.id))
  const consumoParaAdicionar = itensConsumo.filter(i => !(quarto.itensConsumo || []).includes(i.id))

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onVoltar}
          className="p-2 hover:bg-sand-100 rounded-xl transition-colors text-brand-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl text-brand-900">{quarto.nome}</h1>
          <span className={`inline-block font-body text-xs font-medium px-2 py-0.5 rounded-lg ${STATUS_CONFIG[quarto.status].color}`}>
            {STATUS_CONFIG[quarto.status].label}
          </span>
        </div>
      </div>

      {/* Estadia ativa */}
      {estadiaAtiva && (
        <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-2 font-body text-sm font-medium text-brand-900">
            <UserCircle className="w-4 h-4 text-brand-500" /> {hospedeAtivo?.nome || 'Hóspede'}
          </span>
          <span className="flex items-center gap-1.5 font-body text-xs text-sand-500">
            <CalendarCheck className="w-3.5 h-3.5" /> {formatarData(estadiaAtiva.dataEntrada)}
          </span>
          <span className="flex items-center gap-1.5 font-body text-xs text-sand-500">
            <CalendarX className="w-3.5 h-3.5" /> {formatarData(estadiaAtiva.dataSaida)}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Canvas drag-and-drop */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-card border border-sand-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-sand-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-500" />
              <span className="font-body font-medium text-brand-900 text-sm">Planta do quarto</span>
              {podeEditar && <span className="font-body text-xs text-sand-400 ml-auto">Arraste e gire os itens</span>}
            </div>
            <div
              ref={canvasRef}
              className="relative bg-sand-50"
              style={{
                height: 320,
                backgroundImage: 'radial-gradient(circle, #d4c098 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              {itensDoQuarto.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <BedDouble className="w-12 h-12 text-sand-300 mb-2" strokeWidth={1} />
                  <p className="font-body text-sand-400 text-sm">Adicione itens para visualizá-los aqui</p>
                </div>
              ) : (
                itensDoQuarto.map((item) => {
                  const pos = posOf(item.id)
                  return (
                    <div
                      key={item.id}
                      style={{ left: pos.x, top: pos.y, position: 'absolute' }}
                      className="flex flex-col items-center gap-1 w-[72px] select-none group"
                    >
                      <div
                        onMouseDown={e => onMouseDown(e, item.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl bg-white shadow-card border border-sand-200 w-full ${podeEditar ? 'cursor-grab active:cursor-grabbing hover:border-brand-300 hover:shadow-card-md' : ''} transition-shadow`}
                      >
                        <span className="text-brand-600 transition-transform" style={{ transform: `rotate(${pos.rotacao || 0}deg)` }}>
                          {TIPO_ICONE[item.tipo] || <Package className="w-8 h-8" />}
                        </span>
                        <span className="font-body text-xs text-sand-600 text-center leading-tight truncate w-full">{item.nome}</span>
                      </div>
                      {podeEditar && (
                        <button
                          onClick={() => rotacionar(item.id)}
                          title="Girar item"
                          className="opacity-0 group-hover:opacity-100 p-1 bg-white rounded-lg shadow-card border border-sand-200 text-sand-500 hover:text-brand-700 transition-opacity"
                        >
                          <RotateCw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Controle de consumo (quartos com frigobar) */}
          {temFrigobar && (
            estadiaAtiva ? (
              <RegistrarConsumoForm estadiaId={estadiaAtiva.id} quartoId={quarto.id} />
            ) : (
              <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4">
                <p className="font-body font-medium text-brand-900 text-sm mb-1">Controle de consumo</p>
                <p className="font-body text-sand-400 text-sm">Sem hóspede ativo neste quarto no momento.</p>
              </div>
            )
          )}
        </div>

        {/* Painel direito */}
        <div className="space-y-4">

          {/* Status */}
          {podeEditar && (
            <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4">
              <p className="font-body font-medium text-brand-900 text-sm mb-3">Status do quarto</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(STATUS_CONFIG) as StatusQuarto[]).map(s => (
                  <button key={s} onClick={() => mudarStatus(s)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body font-medium transition-all border ${
                      quarto.status === s
                        ? `${STATUS_CONFIG[s].color} border-current shadow-card`
                        : 'border-sand-200 text-sand-600 hover:border-sand-300'
                    }`}>
                    {quarto.status === s && <CheckCircle2 className="w-3 h-3" />}
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Adicionar item */}
          {podeEditar && disponiveisParaAdicionar.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4">
              <p className="font-body font-medium text-brand-900 text-sm mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-500" /> Adicionar mobília
              </p>
              <div className="space-y-1.5">
                {disponiveisParaAdicionar.map(item => (
                  <button key={item.id} onClick={() => adicionarItem(item.id)}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-sand-50 border border-sand-100 transition-colors text-left">
                    <span className="text-brand-500">{TIPO_ICONE[item.tipo] || <Package className="w-5 h-5" />}</span>
                    <span className="font-body text-sm text-brand-800">{item.nome}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vincular item de consumo ao quarto */}
          {podeEditar && consumoParaAdicionar.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4">
              <p className="font-body font-medium text-brand-900 text-sm mb-3 flex items-center gap-2">
                <Refrigerator className="w-4 h-4 text-amber-500" /> Vincular item de consumo
              </p>
              <div className="space-y-1.5">
                {consumoParaAdicionar.map(item => (
                  <button key={item.id} onClick={() => adicionarConsumo(item.id)}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-amber-50 border border-sand-100 transition-colors text-left">
                    <Refrigerator className="w-5 h-5 text-amber-500" />
                    <span className="font-body text-sm text-brand-800">{item.nome}</span>
                    <span className="ml-auto font-mono text-xs text-sand-400">{item.qtdAtual} un</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Itens de consumo vinculados */}
          {consumoDoQuarto.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4">
              <p className="font-body font-medium text-brand-900 text-sm mb-3">Itens de consumo do quarto</p>
              <div className="space-y-1.5">
                {consumoDoQuarto.map(item => (
                  <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50">
                    <Refrigerator className="w-4 h-4 text-amber-500" />
                    <span className="font-body text-sm text-brand-800 flex-1">{item.nome}</span>
                    <span className="font-mono text-xs font-medium text-amber-700">{item.qtdAtual} un</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
