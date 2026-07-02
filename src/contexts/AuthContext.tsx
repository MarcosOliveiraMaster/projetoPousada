import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth } from '../services/firebase'
import { useData } from './DataContext'
import { Usuario, AreaKey } from '../types'

// Por enquanto, único login com bootstrap automático do sistema
const ADMIN_ACCOUNT = {
  email: 'adm@pousadasertanejo.com',
  senha: 'adm@2025',
  nome: 'Administrador'
}

const TODAS_AREAS: AreaKey[] = ['dashboard', 'quartos', 'hospedes', 'itens', 'consumo', 'entrada', 'colaboradores', 'mapaHospedes']

interface AuthContextType {
  firebaseUser: FirebaseUser | null
  usuario: Usuario | null
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
  isAuthorized: (area: AreaKey) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const { getUsuarioPorEmail, addUsuario } = useData()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser?.email) {
        const perfil = getUsuarioPorEmail(fbUser.email)
        setUsuario(perfil || null)
      } else {
        setUsuario(null)
      }
      setLoading(false)
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, senha: string) => {
    const isAdminBootstrap = email === ADMIN_ACCOUNT.email && senha === ADMIN_ACCOUNT.senha

    let cred
    try {
      cred = await signInWithEmailAndPassword(auth, email, senha)
    } catch (err) {
      if (
        isAdminBootstrap &&
        err instanceof FirebaseError &&
        (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')
      ) {
        // Primeira execução: cria a conta admin no Firebase Auth
        cred = await createUserWithEmailAndPassword(auth, email, senha)
      } else {
        throw err
      }
    }

    let perfil = getUsuarioPorEmail(cred.user.email || email)
    if (!perfil && isAdminBootstrap) {
      perfil = addUsuario({
        nome: ADMIN_ACCOUNT.nome,
        cpf: '',
        contato: '',
        email: ADMIN_ACCOUNT.email,
        admin: true,
        areas: TODAS_AREAS,
        loginUsername: ADMIN_ACCOUNT.email
      })
    }
    setUsuario(perfil || null)
  }

  const logout = async () => {
    await signOut(auth)
    setUsuario(null)
  }

  const isAuthorized = (area: AreaKey) => {
    if (!usuario) return false
    return usuario.admin || usuario.areas.includes(area)
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, usuario, loading, login, logout, isAuthorized }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
