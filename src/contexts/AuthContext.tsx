import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { ref, get, set } from 'firebase/database'
import { auth, db } from '../services/firebase'
import { Usuario, UserNivel } from '../types'

// Mapeamento de logins customizados para emails Firebase
const LOGIN_MAP: Record<string, { email: string; senha: string; nivel: UserNivel; nome: string }> = {
  userMaster: {
    email: 'master@pousada.app',
    senha: '@userMaster2026',
    nivel: 'master',
    nome: 'Administrador Master'
  }
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null
  usuario: Usuario | null
  loading: boolean
  login: (username: string, senha: string) => Promise<void>
  logout: () => Promise<void>
  isAuthorized: (nivelMinimo: UserNivel) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const NIVEL_HIERARQUIA: Record<UserNivel, number> = {
  master: 3,
  adm: 2,
  simples: 1
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        try {
          const snap = await get(ref(db, `usuarios/${fbUser.uid}`))
          if (snap.exists()) {
            setUsuario({ id: fbUser.uid, ...snap.val() } as Usuario)
          }
        } catch (err) {
          console.error('Erro ao carregar usuário:', err)
        }
      } else {
        setUsuario(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async (username: string, senha: string) => {
    const mapped = LOGIN_MAP[username]
    if (mapped) {
      let cred
      try {
        cred = await signInWithEmailAndPassword(auth, mapped.email, mapped.senha)
      } catch (err) {
        if (
          err instanceof FirebaseError &&
          (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')
        ) {
          // Primeira execução: cria o usuário master no Firebase Auth
          cred = await createUserWithEmailAndPassword(auth, mapped.email, mapped.senha)
        } else {
          throw err
        }
      }
      // Garante que o perfil existe no banco
      const snap = await get(ref(db, `usuarios/${cred.user.uid}`))
      if (!snap.exists()) {
        const perfil: Omit<Usuario, 'id'> = {
          nome: mapped.nome,
          cpf: '',
          contato: '',
          email: mapped.email,
          nivel: mapped.nivel,
          loginUsername: username
        }
        await set(ref(db, `usuarios/${cred.user.uid}`), perfil)
        setUsuario({ id: cred.user.uid, ...perfil })
      }
    } else {
      // Login direto por email (colaboradores cadastrados)
      await signInWithEmailAndPassword(auth, username, senha)
    }
  }

  const logout = async () => {
    await signOut(auth)
    setUsuario(null)
  }

  const isAuthorized = (nivelMinimo: UserNivel) => {
    if (!usuario) return false
    return NIVEL_HIERARQUIA[usuario.nivel] >= NIVEL_HIERARQUIA[nivelMinimo]
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
