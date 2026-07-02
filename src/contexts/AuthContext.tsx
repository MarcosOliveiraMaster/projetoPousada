import { createContext, useContext, useState, ReactNode } from 'react'
import { useData } from './DataContext'
import { Usuario, AreaKey } from '../types'

// Login mockado: qualquer email/senha autentica, sem validação contra backend.
const TODAS_AREAS: AreaKey[] = ['dashboard', 'quartos', 'hospedes', 'itens', 'consumo', 'entrada', 'colaboradores', 'mapaHospedes']

interface AuthContextType {
  autenticado: boolean
  usuario: Usuario | null
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
  isAuthorized: (area: AreaKey) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [autenticado, setAutenticado] = useState(false)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading] = useState(false)
  const { getUsuarioPorEmail, addUsuario } = useData()

  const login = async (email: string, _senha: string) => {
    let perfil = getUsuarioPorEmail(email)
    if (!perfil) {
      perfil = addUsuario({
        nome: email.split('@')[0] || 'Usuário',
        cpf: '',
        contato: '',
        email,
        admin: true,
        areas: TODAS_AREAS,
        loginUsername: email
      })
    }
    setUsuario(perfil)
    setAutenticado(true)
  }

  const logout = async () => {
    setUsuario(null)
    setAutenticado(false)
  }

  const isAuthorized = (area: AreaKey) => {
    if (!usuario) return false
    return usuario.admin || usuario.areas.includes(area)
  }

  return (
    <AuthContext.Provider value={{ autenticado, usuario, loading, login, logout, isAuthorized }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
