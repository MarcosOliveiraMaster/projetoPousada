import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { UserNivel } from '../../types'
import { Leaf } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  nivelMinimo?: UserNivel
}

export default function ProtectedRoute({ children, nivelMinimo = 'simples' }: ProtectedRouteProps) {
  const { firebaseUser, usuario, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-700 flex items-center justify-center animate-pulse">
            <Leaf className="w-7 h-7 text-brand-100" strokeWidth={1.5} />
          </div>
          <p className="font-body text-sand-500 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!firebaseUser) return <Navigate to="/login" replace />

  if (usuario && nivelMinimo) {
    const hierarquia: Record<UserNivel, number> = { master: 3, adm: 2, simples: 1 }
    if (hierarquia[usuario.nivel] < hierarquia[nivelMinimo]) {
      return (
        <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="font-display text-xl text-brand-900 mb-2">Acesso restrito</p>
            <p className="font-body text-sand-500 text-sm">Você não tem permissão para acessar esta área.</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
