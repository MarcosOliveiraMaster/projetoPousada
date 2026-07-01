import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../../services/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { Hospede, Pagamento, ItemMobilia, ItemConsumo } from '../../types'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts'
import { Users, Banknote, CalendarClock, Package, TrendingUp } from 'lucide-react'

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

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

export default function DashboardPage() {
  const { usuario } = useAuth()
  const [hospedes, setHospedes] = useState<Hospede[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [itens, setItens] = useState<(ItemMobilia | ItemConsumo)[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const unsubHospedes = onValue(ref(db, 'hospedes'), snap => {
      const data: Hospede[] = []
      snap.forEach(child => data.push({ id: child.key!, ...child.val() }))
      setHospedes(data)
    })
    const unsubPagamentos = onValue(ref(db, 'pagamentos'), snap => {
      const data: Pagamento[] = []
      snap.forEach(child => data.push({ id: child.key!, ...child.val() }))
      setPagamentos(data)
    })
    const unsubItens = onValue(ref(db, 'itens'), snap => {
      const data: ItemMobilia[] = []
      snap.forEach(child => data.push({ id: child.key!, ...child.val() }))
      const unsubConsumo = onValue(ref(db, 'consumo'), snapC => {
        const dataC: ItemConsumo[] = []
        snapC.forEach(child => dataC.push({ id: child.key!, ...child.val() }))
        setItens([...data, ...dataC])
        setCarregando(false)
      })
      return unsubConsumo
    })
    return () => { unsubHospedes(); unsubPagamentos(); unsubItens() }
  }, [])

  // Entradas por mês (últimos 6 meses)
  const entradasPorMes = (() => {
    const meses: Record<string, number> = {}
    const hoje = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      meses[key] = 0
    }
    hospedes.forEach(h => {
      if (h.checkin) {
        const d = new Date(h.checkin)
        const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        if (key in meses) meses[key]++
      }
    })
    return Object.entries(meses).map(([mes, entradas]) => ({ mes, entradas }))
  })()

  // Pagamentos por mês (últimos 6 meses)
  const pagamentosPorMes = (() => {
    const meses: Record<string, number> = {}
    const hoje = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      meses[key] = 0
    }
    pagamentos.forEach(p => {
      if (p.data) {
        const d = new Date(p.data)
        const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        if (key in meses) meses[key] += p.valor
      }
    })
    return Object.entries(meses).map(([mes, valor]) => ({ mes, valor }))
  })()

  const totalPagamentos = pagamentos.reduce((acc, p) => acc + (p.valor || 0), 0)
  const hoje = new Date().toISOString().split('T')[0]
  const proximosPagamentos = hospedes.filter(h => h.checkout && h.checkout >= hoje && h.status === 'ativo').length

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

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

      {/* Stats cards */}
      {carregando ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-card border border-sand-100 h-24 animate-pulse">
              <div className="bg-sand-100 rounded-xl h-4 w-24 mb-3" />
              <div className="bg-sand-100 rounded-xl h-7 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de hóspedes"
            value={hospedes.length}
            icon={<Users className="w-6 h-6" />}
            color="text-brand-700"
            bgColor="bg-brand-100"
            sub={`${hospedes.filter(h => h.status === 'ativo').length} ativos`}
          />
          <StatCard
            title="Pagamentos"
            value={formatarMoeda(totalPagamentos)}
            icon={<Banknote className="w-6 h-6" />}
            color="text-emerald-700"
            bgColor="bg-emerald-50"
            sub={`${pagamentos.length} registros`}
          />
          <StatCard
            title="Próximos checkouts"
            value={proximosPagamentos}
            icon={<CalendarClock className="w-6 h-6" />}
            color="text-amber-700"
            bgColor="bg-amber-50"
            sub="nos próximos dias"
          />
          <StatCard
            title="Itens cadastrados"
            value={itens.length}
            icon={<Package className="w-6 h-6" />}
            color="text-blue-700"
            bgColor="bg-blue-50"
            sub="mobília + consumo"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico entradas */}
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

        {/* Gráfico pagamentos */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-sand-100">
          <div className="flex items-center gap-2 mb-5">
            <Banknote className="w-5 h-5 text-emerald-600" />
            <h2 className="font-body font-semibold text-brand-900 text-base">Evolução de pagamentos</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pagamentosPorMes} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9a754a', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9a754a', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5d9bf', borderRadius: 12, fontFamily: 'DM Sans', fontSize: 12 }}
                labelStyle={{ color: '#183d2f', fontWeight: 500 }}
                formatter={(v: number) => [formatarMoeda(v), 'Pagamentos']}
              />
              <Line type="monotone" dataKey="valor" stroke="#059669" strokeWidth={2.5} dot={{ fill: '#059669', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hóspedes recentes */}
      {hospedes.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-sand-100">
          <h2 className="font-body font-semibold text-brand-900 text-base mb-4">Hóspedes recentes</h2>
          <div className="space-y-2">
            {hospedes.slice(-5).reverse().map(h => (
              <div key={h.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-sand-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <span className="font-body font-semibold text-brand-700 text-sm">{h.nome?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-body font-medium text-brand-900 text-sm">{h.nome}</p>
                    <p className="font-body text-xs text-sand-400">{h.alocacao || 'Sem quarto'}</p>
                  </div>
                </div>
                <span className={`font-body text-xs px-2 py-1 rounded-lg font-medium ${
                  h.status === 'ativo' ? 'bg-brand-100 text-brand-700' : 'bg-sand-100 text-sand-600'
                }`}>
                  {h.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
