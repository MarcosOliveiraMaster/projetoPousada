import { useEffect, useRef, useState, ReactNode } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface OpcaoDropdown {
  value: string
  label: string
  icon?: ReactNode
}

interface Props {
  label: string
  options: OpcaoDropdown[]
  selecionados: string[]
  onChange: (valores: string[]) => void
}

export default function MultiSelectDropdown({ label, options, selecionados, onChange }: Props) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickFora = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', onClickFora)
    return () => document.removeEventListener('mousedown', onClickFora)
  }, [])

  const toggle = (value: string) => {
    onChange(selecionados.includes(value) ? selecionados.filter(v => v !== value) : [...selecionados, value])
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto(v => !v)}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border font-body text-sm font-medium transition-colors whitespace-nowrap ${
          selecionados.length > 0 ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-sand-200 bg-white text-sand-600 hover:border-sand-300'
        }`}
      >
        {label}{selecionados.length > 0 && ` (${selecionados.length})`}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>
      {aberto && (
        <div className="absolute right-0 top-full mt-2 w-64 max-h-72 overflow-y-auto bg-white rounded-xl shadow-card-lg border border-sand-100 z-20 py-2">
          {options.length === 0 ? (
            <p className="px-3 py-2 font-body text-xs text-sand-400">Nenhuma opção disponível</p>
          ) : options.map(o => (
            <button key={o.value} onClick={() => toggle(o.value)}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-sand-50 text-left">
              <span className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 ${
                selecionados.includes(o.value) ? 'bg-brand-600 border-brand-600' : 'border-sand-300'
              }`}>
                {selecionados.includes(o.value) && <Check className="w-3 h-3 text-white" />}
              </span>
              {o.icon && <span className="text-brand-400 flex-shrink-0">{o.icon}</span>}
              <span className="font-body text-sm text-brand-800 truncate">{o.label}</span>
            </button>
          ))}
          {selecionados.length > 0 && (
            <>
              <div className="border-t border-sand-100 my-1" />
              <button onClick={() => onChange([])} className="w-full px-3 py-2 text-left font-body text-xs text-red-500 hover:bg-red-50">
                Limpar filtro
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
