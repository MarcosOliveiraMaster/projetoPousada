import { useState, useRef } from 'react'
import { ref, update } from 'firebase/database'
import { db } from '../../services/firebase'
import { Quarto, StatusQuarto, ItemMobilia, ItemConsumo } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import {
  ArrowLeft, BedDouble, Tv, Refrigerator, AirVent,
  ShoppingBasket, Package, Sofa, CheckCircle2
} from 'lucide-react'

const STATUS_CONFIG: Record<StatusQuarto, { label: string; color: string }> = {
  disponivel: { label: 'Disponível',  color: 'bg-brand-100 text-brand-700' },
  ocupado:    { label: 'Ocupado',     color: 'bg-red-50 text-red-700' },
  limpeza:    { label: 'Em limpeza',  color: 'bg-amber-50 text-amber-700' },
  desativado: { label: 'Desativado',  color: 'bg-sand-100 text-sand-600' },
}

const TIPO_ICONE: Record<string, React.ReactNode> = {
  'cama':          <BedDouble className="w-8 h-8" strokeWidth={1.5} />,
  'guarda-roupa':  <Sofa className="w-8 h-8" strokeWidth={1.5} />,
  'televisao':     <Tv className="w-8 h-8" strokeWidth={1.5} />,
  'frigobar':      <Refrigerator className="w-8 h-8" strokeWidth={1.5} />,
  'ar-condicionado': <AirVent className="w-8 h-8" strokeWidth={1.5} />,
}

interface ItemDraggable {
  id: string
  label: string
  tipo: string
  x: number
  y: number
}

interface Props {
  quarto: Quarto
  itensMobilia: ItemMobilia[]
  itensConsumo: ItemConsumo[]
  onVoltar: () => void
}

export default function QuartoDetalhe({ quarto, itensMobilia, itensConsumo, onVoltar }: Props) {
  const { isAuthorized } = useAuth()
  const podeEditar = isAuthorized('adm')
  const canvasRef = useRef<HTMLDivElement>(null)

  const itensDoCquarto = itensMobilia.filter(i => (quarto.itensMobilia || []).includes(i.id))
  const consumoDoCquarto = itensConsumo.filter(i => (quarto.itensConsumo || []).includes(i.id))

  // Posições salvas
  const [posicoes, setPosicoes] = useState<Record<string, { x: number; y: number }>>(
    quarto.posicoes || {}
  )

  // Drag state
  const draggingRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)

  const onMouseDown = (e: React.MouseEvent, id: string) => {
    if (!podeEditar) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const pos = posicoes[id] || { x: 20, y: 20 }
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
    setPosicoes(prev => ({ ...prev, [id]: { x, y } }))
  }

  const onMouseUp = async () => {
    if (!draggingRef.current) return
    const id = draggingRef.current.id
    draggingRef.current = null
    await update(ref(db, `quartos/${quarto.id}/posicoes`), { [id]: posicoes[id] })
  }

  const adicionarItem = async (itemId: string) => {
    const lista = [...(quarto.itensMobilia || []), itemId]
    await update(ref(db, `quartos/${quarto.id}`), { itensMobilia: lista })
  }

  const adicionarConsumo = async (itemId: string) => {
    const lista = [...(quarto.itensConsumo || []), itemId]
    await update(ref(db, `quartos/${quarto.id}`), { itensConsumo: lista })
  }

  const mudarStatus = async (status: StatusQuarto) => {
    await update(ref(db, `quartos/${quarto.id}`), { status })
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Canvas drag-and-drop */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-card border border-sand-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-sand-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-500" />
              <span className="font-body font-medium text-brand-900 text-sm">Planta do quarto</span>
              {podeEditar && <span className="font-body text-xs text-sand-400 ml-auto">Arraste os itens</span>}
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
              {itensDoCquarto.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <BedDouble className="w-12 h-12 text-sand-300 mb-2" strokeWidth={1} />
                  <p className="font-body text-sand-400 text-sm">Adicione itens para visualizá-los aqui</p>
                </div>
              ) : (
                itensDoCquarto.map((item) => {
                  const pos = posicoes[item.id] || { x: 20, y: 20 }
                  return (
                    <div
                      key={item.id}
                      onMouseDown={e => onMouseDown(e, item.id)}
                      style={{ left: pos.x, top: pos.y, position: 'absolute' }}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl bg-white shadow-card border border-sand-200 w-[72px] select-none ${podeEditar ? 'cursor-grab active:cursor-grabbing hover:border-brand-300 hover:shadow-card-md' : ''} transition-shadow`}
                    >
                      <span className="text-brand-600">{TIPO_ICONE[item.tipo] || <Package className="w-8 h-8" />}</span>
                      <span className="font-body text-xs text-sand-600 text-center leading-tight truncate w-full text-center">{item.nome}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
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

          {/* Adicionar consumo */}
          {isAuthorized('simples') && consumoParaAdicionar.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4">
              <p className="font-body font-medium text-brand-900 text-sm mb-3 flex items-center gap-2">
                <ShoppingBasket className="w-4 h-4 text-amber-500" /> Adicionar consumo
              </p>
              <div className="space-y-1.5">
                {consumoParaAdicionar.map(item => (
                  <button key={item.id} onClick={() => adicionarConsumo(item.id)}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-amber-50 border border-sand-100 transition-colors text-left">
                    <ShoppingBasket className="w-5 h-5 text-amber-500" />
                    <span className="font-body text-sm text-brand-800">{item.nome}</span>
                    <span className="ml-auto font-mono text-xs text-sand-400">{item.qtdAtual} un</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Consumo atual */}
          {consumoDoCquarto.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card border border-sand-100 p-4">
              <p className="font-body font-medium text-brand-900 text-sm mb-3">Consumo no quarto</p>
              <div className="space-y-1.5">
                {consumoDoCquarto.map(item => (
                  <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50">
                    <ShoppingBasket className="w-4 h-4 text-amber-500" />
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
