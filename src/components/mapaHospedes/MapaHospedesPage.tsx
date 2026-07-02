import { Map } from 'lucide-react'

export default function MapaHospedesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl text-brand-900">Mapa de Hóspedes</h1>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl shadow-card border border-sand-100">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
          <Map className="w-8 h-8 text-brand-600" strokeWidth={1.5} />
        </div>
        <p className="font-body text-sand-500 text-sm max-w-md">
          Aqui estarão gráficos e indicadores com mapeamentos dos hóspedes que já frequentaram sua pousada.
        </p>
      </div>
    </div>
  )
}
