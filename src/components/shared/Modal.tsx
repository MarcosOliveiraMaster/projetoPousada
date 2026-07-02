import { useEffect, ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  titulo?: string
  onFechar: () => void
  children: ReactNode
  largura?: string
}

export default function Modal({ titulo, onFechar, children, largura = 'max-w-lg' }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onFechar])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm" onClick={onFechar} />
      <div className={`relative bg-white rounded-2xl shadow-card-lg w-full ${largura} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="font-body font-semibold text-brand-900 text-base">{titulo}</h2>
          <button onClick={onFechar} className="p-1.5 text-sand-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
