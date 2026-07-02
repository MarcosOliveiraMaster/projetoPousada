import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatarMoeda, mesAtualChave } from '../../utils/format'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts'
import {
  Users, Banknote, CalendarClock, BedDouble, DoorOpen, TrendingUp, Target, Edit2, Check, RotateCcw,
  ChevronDown, Search, X
} from 'lucide-react'
import BuscaDisponibilidade from './BuscaDisponibilidade'
import OcupacaoCalendario from './OcupacaoCalendario'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  bgColor: string
  sub?: string
}

function StatCard({ title, value, icon, color, bgColor, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-sand-100 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor}`}>
        <span className={color}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sand-500 text-xs uppercase tracking-wider mb-0.5">{title}</p>
        <p className="font-display text-2xl text-brand-900">{value}</p>
        {sub && <p className="font-body text-xs text-sand-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { usuario, isAuthorized } = useAuth()
  const { quartos, hospedes, estadias, getReceitaMes, getMetaMes, setMetaMes, resetDadosExemplo } = useData()
  const [editandoMeta, setEditandoMeta] = useState(false)
  const [filtroEstadiasAberto, setFiltroEstadiasAberto] = useState(false)
  const [filtroDataInicio, setFiltroDataInicio] = useState('')
  const [filtroDataFim, setFiltroDataFim] = useState('')
  const [filtroClienteNome, setFiltroClienteNome] = useState('')

  const mesChave = mesAtualChave()
  const receitaMes = getReceitaMes(mesChave)
  const metaMes = getMetaMes(mesChave)
  const [metaInput, setMetaInput] = useState(metaMes)
  const progressoMeta = metaMes > 0 ? Math.min(100, Math.round((receitaMes / metaMes) * 100)) : 0

  const quartosDisponiveis = quartos.filter(q => q.status === 'disponivel').length
  const quartosOcupados = quartos.filter(q => q.status === 'ocupado').length
  const estadiasAtivas = estadias.filter(e => e.status === 'ativa').length

  // Entradas por mês (últimos 6 meses)
  const entradasPorMes = (() => {
    const meses: Record<string, number> = {}
    const hoje = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      meses[key] = 0
    }
    estadias.forEach(e => {
      if (e.dataEntrada) {
        const d = new Date(`${e.dataEntrada}T00:00:00`)
        const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        if (key in meses) meses[key]++
      }
    })
    return Object.entries(meses).map(([mes, entradas]) => ({ mes, entradas }))
  })()

  // Receita por mês (últimos 6 meses)
  const receitaPorMes = (() => {
    const hoje = new Date()
    const lista = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      lista.push({ mes: label, valor: getReceitaMes(chave) })
    }
    return lista
  })()

  const hoje = new Date().toISOString().split('T')[0]
  const proximosCheckouts = estadias.filter(e => e.status === 'ativa' && e.dataSaida >= hoje).length

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  const nomeHospede = (id: string) => hospedes.find(h => h.id === id)?.nome || '—'
  const nomeQuarto = (id: string) => quartos.find(q => q.id === id)?.nome || '—'

  const salvarMeta = () => {
    setMetaMes(mesChave, metaInput)
    setEditandoMeta(false)
  }

  const filtroAtivo = Boolean(filtroDataInicio || filtroDataFim || filtroClienteNome.trim())
  const estadiasOrdenadas = [...estadias].sort((a, b) => b.createdAt - a.createdAt)
  const estadiasExibidas = filtroAtivo
    ? estadiasOrdenadas.filter(e => {
        if (filtroDataInicio && e.dataEntrada < filtroDataInicio) return false
        if (filtroDataFim && e.dataEntrada > filtroDataFim) return false
        if (filtroClienteNome.trim() && !nomeHospede(e.hospedeId).toLowerCase().includes(filtroClienteNome.trim().toLowerCase())) return false
        return true
      })
    : estadiasOrdenadas.slice(0, 5)

  const limparFiltroEstadias = () => {
    setFiltroDataInicio('')
    setFiltroDataFim('')
    setFiltroClienteNome('')
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl lg:text-3xl text-brand-900">
          {saudacao}, {usuario?.nome?.split(' ')[0] || 'bem-vindo'}
        </h1>
        <p className="font-body text-sand-500 text-sm mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {isAuthorized('entrada') && <BuscaDisponibilidade />}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Quartos disponíveis"
          value={quartosDisponiveis}
          icon={<BedDouble className="w-6 h-6" />}
          color="text-brand-700"
          bgColor="bg-brand-100"
          sub={`de ${quartos.length} cadastrados`}
        />
        <StatCard
          title="Quartos ocupados"
          value={quartosOcupados}
          icon={<DoorOpen className="w-6 h-6" />}
          color="text-red-700"
          bgColor="bg-red-50"
          sub={`${estadiasAtivas} estadia${estadiasAtivas !== 1 ? 's' : ''} ativa${estadiasAtivas !== 1 ? 's' : ''}`}
        />
        <StatCard
          title="Receita do mês"
          value={formatarMoeda(receitaMes)}
          icon={<Banknote className="w-6 h-6" />}
          color="text-emerald-700"
          bgColor="bg-emerald-50"
          sub="hospedagem + consumo"
        />
        <StatCard
          title="Hóspedes cadastrados"
          value={hospedes.length}
          icon={<Users className="w-6 h-6" />}
          color="text-blue-700"
          bgColor="bg-blue-50"
          sub={`${proximosCheckouts} checkout(s) previsto(s)`}
        />
      </div>

      {/* Meta financeira */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-sand-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-600" />
            <h2 className="font-body font-semibold text-brand-900 text-base">Meta do mês</h2>
          </div>
          {usuario?.admin && !editandoMeta && (
            <button onClick={() => { setMetaInput(metaMes); setEditandoMeta(true) }}
              className="p-1.5 text-sand-400 hover:text-brand-600 hover:bg-sand-100 rounded-lg transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {editandoMeta ? (
          <div className="flex items-center gap-2 mb-3">
            <input type="number" min={0} step="100" value={metaInput} onChange={e => setMetaInput(Number(e.target.value))}
              className="flex-1 px-3 py-2 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <button onClick={salvarMeta} className="p-2 bg-brand-700 hover:bg-brand-600 text-white rounded-xl"><Check className="w-4 h-4" /></button>
          </div>
        ) : (
          <p className="font-body text-sm text-sand-500 mb-3">
            {formatarMoeda(receitaMes)} de {formatarMoeda(metaMes)} ({progressoMeta}%)
          </p>
        )}
        <div className="w-full h-3 rounded-full bg-sand-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-500" style={{ width: `${progressoMeta}%` }} />
        </div>
      </div>

      {isAuthorized('quartos') && <OcupacaoCalendario />}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl p-6 shadow-card border border-sand-100">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            <h2 className="font-body font-semibold text-brand-900 text-base">Entradas de hóspedes</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={entradasPorMes} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#267455" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#267455" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9a754a', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9a754a', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5d9bf', borderRadius: 12, fontFamily: 'DM Sans', fontSize: 12 }}
                labelStyle={{ color: '#183d2f', fontWeight: 500 }}
              />
              <Area type="monotone" dataKey="entradas" stroke="#267455" strokeWidth={2} fill="url(#gradEntradas)" dot={{ fill: '#267455', r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card border border-sand-100">
          <div className="flex items-center gap-2 mb-5">
            <Banknote className="w-5 h-5 text-emerald-600" />
            <h2 className="font-body font-semibold text-brand-900 text-base">Evolução da receita</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={receitaPorMes} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9a754a', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9a754a', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5d9bf', borderRadius: 12, fontFamily: 'DM Sans', fontSize: 12 }}
                labelStyle={{ color: '#183d2f', fontWeight: 500 }}
                formatter={(v: number) => [formatarMoeda(v), 'Receita']}
              />
              <Line type="monotone" dataKey="valor" stroke="#059669" strokeWidth={2.5} dot={{ fill: '#059669', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estadias recentes */}
      {estadias.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-sand-100">
          <button
            onClick={() => setFiltroEstadiasAberto(v => !v)}
            className="w-full flex items-center justify-between gap-2 mb-4 group"
          >
            <h2 className="font-body font-semibold text-brand-900 text-base flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-brand-600" />
              {filtroAtivo ? `Estadias filtradas (${estadiasExibidas.length})` : 'Estadias recentes'}
            </h2>
            <ChevronDown className={`w-4 h-4 text-sand-400 group-hover:text-brand-600 transition-transform ${filtroEstadiasAberto ? 'rotate-180' : ''}`} />
          </button>

          {filtroEstadiasAberto && (
            <div className="flex flex-col sm:flex-row gap-2 mb-4 pb-4 border-b border-sand-100">
              <input type="date" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)}
                className="px-3 py-2 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <input type="date" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)}
                className="px-3 py-2 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
                <input
                  value={filtroClienteNome} onChange={e => setFiltroClienteNome(e.target.value)}
                  placeholder="Buscar por nome do hóspede..."
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-sand-200 bg-sand-50 font-body text-sm text-brand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              {filtroAtivo && (
                <button onClick={limparFiltroEstadias}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl font-body text-sm text-sand-500 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <X className="w-3.5 h-3.5" /> Limpar
                </button>
              )}
            </div>
          )}

          <div className="space-y-2">
            {estadiasExibidas.length === 0 && (
              <p className="font-body text-sand-400 text-sm text-center py-4">Nenhuma estadia encontrada com esses filtros.</p>
            )}
            {estadiasExibidas.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-sand-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <span className="font-body font-semibold text-brand-700 text-sm">{nomeHospede(e.hospedeId).charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-body font-medium text-brand-900 text-sm">{nomeHospede(e.hospedeId)}</p>
                    <p className="font-body text-xs text-sand-400">{nomeQuarto(e.quartoId)}</p>
                  </div>
                </div>
                <span className={`font-body text-xs px-2 py-1 rounded-lg font-medium ${
                  e.status === 'ativa' ? 'bg-brand-100 text-brand-700' : 'bg-sand-100 text-sand-600'
                }`}>
                  {e.status === 'ativa' ? 'Ativa' : 'Finalizada'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {usuario?.admin && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => { if (confirm('Restaurar os dados de exemplo? Todas as alterações mockadas serão perdidas.')) resetDadosExemplo() }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sand-400 hover:text-brand-600 hover:bg-sand-100 font-body text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restaurar dados de exemplo
          </button>
        </div>
      )}
    </div>
  )
}
