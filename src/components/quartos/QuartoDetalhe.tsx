import { useState, useRef } from 'react'
import { useData } from '../../contexts/DataContext'
import { Quarto, StatusQuarto, ItemMobilia } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { formatarData } from '../../utils/format'
import { getIconeItem } from '../../constants/itensBiblioteca'
import RegistrarConsumoForm from '../shared/RegistrarConsumoForm'
import {
  ArrowLeft, BedDouble, Refrigerator,
  Package, CheckCircle2, RotateCw, CalendarCheck, CalendarX, UserCircle, Trash2
} from 'lucide-react'

const STATUS_CONFIG: Record<StatusQuarto, { label: string; color: string }> = {
  disponivel: { label: 'Disponível',  color: 'bg-brand-100 text-brand-700' },
  ocupado:    { label: 'Ocupado',     color: 'bg-red-50 text-red-700' },
  limpeza:    { label: 'Em limpeza',  color: 'bg-amber-50 text-amber-700' },
  desativado: { label: 'Desativado',  color: 'bg-sand-100 text-sand-600' },
}

interface Props {
  quarto: Quarto
  itensMobilia: ItemMobilia[]
  onVoltar: () => void
}

export default function QuartoDetalhe({ quarto, itensMobilia, onVoltar }: Props) {
  const { itensConsumo, updateQuarto, removeQuarto, getEstadiaAtivaPorQuarto, hospedes } = useData()
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

  const excluirQuarto = () => {
    if (confirm(`Excluir o quarto "${quarto.nome}"? Essa ação não pode ser desfeita.`)) {
      removeQuarto(quarto.id)
      onVoltar()
    }
  }

  const disponiveisParaAdicionar = itensMobilia.filter(i => !(quarto.itensMobilia || []).includes(i.id))
  const consumoParaAdicionar = itensConsumo.filter(i => !(quarto.itensConsumo || []).includes(i.id))

  const painelScroll = "max-h-[55vh] lg:max-h-[calc(100vh-260px)] overflow-y-auto"

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onVoltar}
          className="p-2 hover:bg-sand-100 rounded-xl transition-colors text-brand-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl text-brand-900">{quarto.nome}</h1>
          <span className={`inline-block font-body text-xs font-medium px-2 py-0.5 rounded-lg ${STATUS_CONFIG[quarto.status].color}`}>
            {STATUS_CONFIG[quarto.status].label}
          </span>
        </div>
        {podeEditar && (
          <button onClick={excluirQuarto} title="Excluir quarto"
            className="p-2 text-sand-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
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

      {/* Linha 1: planta + status/histórico de consumo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Canvas drag-and-drop */}
        <div className="lg:col-span-2">
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
                          {getIconeItem(item.tipo)}
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
        </div>

        {/* Coluna direita: status + histórico de consumo */}
        <div className="flex flex-col gap-4">
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

          <div className={painelScroll}>
            {!temFrigobar ? (
              <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4">
                <p className="font-body font-medium text-brand-900 text-sm mb-1">Itens de consumo do quarto</p>
                <p className="font-body text-sand-400 text-sm">Este quarto não possui frigobar vinculado.</p>
              </div>
            ) : estadiaAtiva ? (
              <RegistrarConsumoForm estadiaId={estadiaAtiva.id} quartoId={quarto.id} somenteHistorico={false} />
            ) : (
              <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4">
                <p className="font-body font-medium text-brand-900 text-sm mb-1">Itens de consumo do quarto</p>
                <p className="font-body text-sand-400 text-sm">Sem hóspede ativo neste quarto no momento.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Linha 2: adicionar mobília (50%) + vincular item de consumo (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {podeEditar && (
          <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4 flex flex-col">
            <p className="font-body font-medium text-brand-900 text-sm mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-500" /> Adicionar mobília
            </p>
            <div className={`space-y-1.5 ${painelScroll}`}>
              {disponiveisParaAdicionar.length === 0 ? (
                <p className="font-body text-sand-400 text-sm">Todos os itens de mobília cadastrados já estão neste quarto.</p>
              ) : disponiveisParaAdicionar.map(item => (
                <button key={item.id} onClick={() => adicionarItem(item.id)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-sand-50 border border-sand-100 transition-colors text-left">
                  <span className="text-brand-500">{getIconeItem(item.tipo, 'w-5 h-5')}</span>
                  <span className="font-body text-sm text-brand-800">{item.nome}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {podeEditar && (
          <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4 flex flex-col">
            <p className="font-body font-medium text-brand-900 text-sm mb-3 flex items-center gap-2">
              <Refrigerator className="w-4 h-4 text-amber-500" /> Vincular item de consumo
            </p>
            <div className={`space-y-1.5 ${painelScroll}`}>
              {consumoParaAdicionar.length === 0 ? (
                <p className="font-body text-sand-400 text-sm">Todos os itens de consumo cadastrados já estão vinculados.</p>
              ) : consumoParaAdicionar.map(item => (
                <button key={item.id} onClick={() => adicionarConsumo(item.id)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-amber-50 border border-sand-100 transition-colors text-left">
                  <Refrigerator className="w-5 h-5 text-amber-500" />
                  <span className="font-body text-sm text-brand-800">{item.nome}</span>
                  <span className="ml-auto font-mono text-xs text-sand-400">{item.qtdAtual} un</span>
                </button>
              ))}
              {consumoDoQuarto.length > 0 && (
                <div className="pt-2 mt-2 border-t border-sand-100 flex flex-wrap gap-1.5">
                  {consumoDoQuarto.map(item => (
                    <span key={item.id} className="font-body text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-700">{item.nome}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
