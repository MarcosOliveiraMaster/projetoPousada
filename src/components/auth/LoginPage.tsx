import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Leaf } from 'lucide-react'
import { FirebaseError } from 'firebase/app'

export default function LoginPage() {
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleEntrar = async () => {
    setErro('')
    setCarregando(true)
    try {
      await login('userMaster', '@userMaster2026')
      navigate('/dashboard')
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/network-request-failed':
            setErro('Sem conexão com a internet. Verifique sua rede.')
            break
          case 'auth/operation-not-allowed':
            setErro('Autenticação não habilitada no Firebase.')
            break
          default:
            setErro(`Erro ao entrar (${err.code})`)
        }
      } else {
        setErro('Erro inesperado. Tente novamente.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">

      {/* Background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, rgba(54,145,105,0.06) 0%, transparent 50%),
                              radial-gradient(circle at 80% 80%, rgba(180,142,88,0.08) 0%, transparent 50%)`
          }}
        />
        <svg className="absolute bottom-0 left-0 w-full opacity-[0.04]" viewBox="0 0 1440 200" fill="none">
          <path d="M0 100 Q360 0 720 100 Q1080 200 1440 100 L1440 200 L0 200Z" fill="#1b4a37"/>
        </svg>
      </div>

      <div className="w-full max-w-sm relative">

        {/* Logo / marca */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-700 shadow-card-lg mb-5">
            <Leaf className="w-8 h-8 text-brand-100" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl text-brand-900 tracking-tight">Pousada Manager</h1>
          <p className="font-body text-sand-600 mt-1 text-sm">Gestão inteligente para sua pousada</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card-lg border border-sand-100 p-8 flex flex-col items-center gap-5">

          {erro && (
            <div className="w-full flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              <p className="font-body text-red-600 text-sm">{erro}</p>
            </div>
          )}

          <button
            onClick={handleEntrar}
            disabled={carregando}
            className="
              w-full py-3.5 rounded-xl
              bg-brand-700 hover:bg-brand-600 active:bg-brand-800
              text-white font-body font-medium text-sm
              shadow-card-md hover:shadow-card-lg
              transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            {carregando ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Entrando...
              </>
            ) : 'Entrar'}
          </button>
        </div>

        <p className="text-center font-body text-sand-400 text-xs mt-6">
          © {new Date().getFullYear()} Pousada Manager · Versão 1.0
        </p>
      </div>
    </div>
  )
}
