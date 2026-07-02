import { useState, ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { AreaKey } from '../../types'
import {
  LayoutDashboard, BedDouble, Package, Users, ShoppingBasket,
  LogOut, Menu, X, Leaf, ChevronRight, UserCircle, LogIn, Map
} from 'lucide-react'

interface NavItem {
  to: string
  icon: ReactNode
  label: string
  area: AreaKey
  somenteAdmin?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',     icon: <LayoutDashboard className="w-5 h-5" />,  label: 'Dashboard',     area: 'dashboard' },
  { to: '/quartos',       icon: <BedDouble className="w-5 h-5" />,        label: 'Quartos',       area: 'quartos' },
  { to: '/hospedes',      icon: <Users className="w-5 h-5" />,            label: 'Hóspedes',      area: 'hospedes' },
  { to: '/entrada',       icon: <LogIn className="w-5 h-5" />,            label: 'Entrada',       area: 'entrada' },
  { to: '/mapa-hospedes', icon: <Map className="w-5 h-5" />,              label: 'Mapa de Hóspedes', area: 'mapaHospedes' },
  { to: '/itens',         icon: <Package className="w-5 h-5" />,          label: 'Itens',         area: 'itens' },
  { to: '/consumo',       icon: <ShoppingBasket className="w-5 h-5" />,   label: 'Consumo',       area: 'consumo' },
  { to: '/colaboradores', icon: <UserCircle className="w-5 h-5" />,       label: 'Colaboradores', area: 'colaboradores', somenteAdmin: true },
]

interface LayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { usuario, logout, isAuthorized } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sand-100">
        <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center flex-shrink-0">
          <Leaf className="w-5 h-5 text-brand-100" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-display text-brand-900 text-base leading-tight">Pousada</p>
          <p className="font-body text-sand-500 text-xs">Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.filter(item =>
          isAuthorized(item.area) && (!item.somenteAdmin || usuario?.admin)
        ).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-brand-700 text-white shadow-card'
                  : 'text-sand-700 hover:bg-sand-100 hover:text-brand-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-brand-100' : 'text-sand-500 group-hover:text-brand-600'}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-200" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-3 py-4 border-t border-sand-100">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-sand-50">
          <div className="w-8 h-8 rounded-lg bg-brand-200 flex items-center justify-center flex-shrink-0">
            <span className="font-body font-semibold text-brand-800 text-sm">
              {usuario?.nome?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body font-medium text-brand-900 text-sm truncate">{usuario?.nome}</p>
            <span className={`inline-block font-body text-xs px-1.5 py-0.5 rounded-md font-medium ${
              usuario?.admin ? 'bg-brand-100 text-brand-700' : 'bg-sand-100 text-sand-700'
            }`}>
              {usuario?.admin ? 'Administrador' : 'Colaborador'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            className="p-1.5 text-sand-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-sand-50 flex">

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-sand-100 shadow-card fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-brand-950/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar mobile drawer */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-sand-100 shadow-card-lg z-50
        transition-transform duration-300 ease-in-out lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 text-sand-400 hover:text-brand-700 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Top bar mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-sand-100 sticky top-0 z-20 shadow-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-brand-700 hover:bg-sand-100 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-brand-600" strokeWidth={1.5} />
            <span className="font-display text-brand-900 text-base">Pousada Manager</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
            <span className="font-body font-semibold text-brand-700 text-sm">
              {usuario?.nome?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
