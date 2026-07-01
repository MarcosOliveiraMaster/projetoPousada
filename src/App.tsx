import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './components/auth/LoginPage'
import DashboardPage from './components/dashboard/DashboardPage'
import QuartosPage from './components/quartos/QuartosPage'
import HospedesPage from './components/hospedes/HospedesPage'
import ItensPage from './components/itens/ItensPage'
import ConsumoPage from './components/consumo/ConsumoPage'
import ColaboradoresPage from './components/colaboradores/ColaboradoresPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout>
            <Navigate to="/dashboard" replace />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><DashboardPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/quartos" element={
        <ProtectedRoute>
          <AppLayout><QuartosPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/hospedes" element={
        <ProtectedRoute>
          <AppLayout><HospedesPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/itens" element={
        <ProtectedRoute nivelMinimo="adm">
          <AppLayout><ItensPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/consumo" element={
        <ProtectedRoute>
          <AppLayout><ConsumoPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/colaboradores" element={
        <ProtectedRoute nivelMinimo="adm">
          <AppLayout><ColaboradoresPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
