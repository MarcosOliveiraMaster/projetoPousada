import { useState } from 'react'
import { lerArquivosComoBase64 } from '../../utils/upload'
import { Upload, X, FileText } from 'lucide-react'

interface Props {
  arquivos: string[]
  onChange: (arquivos: string[]) => void
  max?: number
  podeEditar?: boolean
}

function ehPdf(src: string) {
  return src.startsWith('data:application/pdf')
}

export default function GaleriaComprovantes({ arquivos, onChange, max = 5, podeEditar = true }: Props) {
  const [enviando, setEnviando] = useState(false)

  const adicionar = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const vagas = max - arquivos.length
    if (vagas <= 0) return
    setEnviando(true)
    try {
      const novos = await lerArquivosComoBase64(Array.from(files).slice(0, vagas))
      onChange([...arquivos, ...novos])
    } finally {
      setEnviando(false)
    }
  }

  const remover = (idx: number) => onChange(arquivos.filter((_, i) => i !== idx))

  return (
    <div>
      {arquivos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
          {arquivos.map((src, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-sand-200 group bg-sand-50 flex items-center justify-center">
              {ehPdf(src) ? (
                <a href={src} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-brand-600 p-2">
                  <FileText className="w-8 h-8" />
                  <span className="font-body text-[10px]">Abrir PDF</span>
                </a>
              ) : (
                <img src={src} alt={`Arquivo ${idx + 1}`} className="w-full h-full object-cover" />
              )}
              {podeEditar && (
                <button onClick={() => remover(idx)}
                  className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {podeEditar && arquivos.length < max && (
        <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-sand-300 text-sand-500 hover:border-brand-300 hover:text-brand-600 cursor-pointer transition-colors font-body text-sm">
          <Upload className="w-4 h-4" />
          {enviando ? 'Enviando...' : `Adicionar arquivos (${arquivos.length}/${max})`}
          <input type="file" accept="image/*,application/pdf" multiple className="hidden" disabled={enviando}
            onChange={e => { adicionar(e.target.files); e.target.value = '' }} />
        </label>
      )}
    </div>
  )
}
