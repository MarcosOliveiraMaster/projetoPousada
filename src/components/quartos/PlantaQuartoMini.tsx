import { Quarto, ItemMobilia } from '../../types'
import { getIconeItem } from '../../constants/itensBiblioteca'
import { BedDouble } from 'lucide-react'

interface Props {
  quarto: Quarto
  itensMobilia: ItemMobilia[]
}

// Versão somente-leitura da planta do quarto (sem drag/rotação). As posições
// foram salvas relativas ao canvas editável (mais largo), então aqui usamos
// scroll horizontal em vez de reescalar — evita erro de matemática de proporção.
export default function PlantaQuartoMini({ quarto, itensMobilia }: Props) {
  const itensDoQuarto = itensMobilia.filter(i => (quarto.itensMobilia || []).includes(i.id))

  return (
    <div
      className="relative bg-sand-50 rounded-xl overflow-auto border border-sand-100"
      style={{
        height: 220,
        backgroundImage: 'radial-gradient(circle, #d4c098 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      {itensDoQuarto.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <BedDouble className="w-10 h-10 text-sand-300 mb-2" strokeWidth={1} />
          <p className="font-body text-sand-400 text-xs">Nenhum item cadastrado</p>
        </div>
      ) : (
        <div className="relative" style={{ minWidth: 480, height: '100%' }}>
          {itensDoQuarto.map(item => {
            const pos = quarto.posicoes?.[item.id] || { x: 20, y: 20, rotacao: 0 }
            return (
              <div
                key={item.id}
                style={{ left: pos.x, top: pos.y, position: 'absolute' }}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-white shadow-card border border-sand-200 w-[60px]"
              >
                <span className="text-brand-600" style={{ transform: `rotate(${pos.rotacao || 0}deg)` }}>
                  {getIconeItem(item.tipo, 'w-6 h-6')}
                </span>
                <span className="font-body text-[10px] text-sand-600 text-center leading-tight truncate w-full">{item.nome}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
