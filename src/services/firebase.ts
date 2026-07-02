import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyAM4fQ5hV-nWDQrnaZd0fllPpLZ8-v94v8",
  authDomain: "projetopousada.firebaseapp.com",
  databaseURL: "https://projetopousada-default-rtdb.firebaseio.com",
  projectId: "projetopousada",
  storageBucket: "projetopousada.firebasestorage.app",
  messagingSenderId: "132616743187",
  appId: "1:132616743187:web:d82bbf2c871e74588152e6",
  measurementId: "G-N9267J8XHR"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)
export default app

// Cria a conta de login de um colaborador sem trocar a sessão atual (admin
// logado). O SDK do client troca automaticamente a sessão ativa para o
// usuário recém-criado, então isso é feito num app Firebase secundário e
// descartável, mantendo a sessão principal intacta.
export async function criarContaColaborador(email: string, senha: string): Promise<string> {
  const appSecundario = initializeApp(firebaseConfig, `secundario-${Date.now()}`)
  const authSecundario = getAuth(appSecundario)
  try {
    const cred = await createUserWithEmailAndPassword(authSecundario, email, senha)
    return cred.user.uid
  } finally {
    await signOut(authSecundario).catch(() => {})
    await deleteApp(appSecundario).catch(() => {})
  }
}
