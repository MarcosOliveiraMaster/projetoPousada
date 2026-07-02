import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider } from './contexts/DataContext'
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
import EntradaPage from './components/entrada/EntradaPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={
        <ProtectedRoute area="dashboard">
          <AppLayout>
            <Navigate to="/dashboard" replace />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute area="dashboard">
          <AppLayout><DashboardPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/quartos" element={
        <ProtectedRoute area="quartos">
          <AppLayout><QuartosPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/hospedes" element={
        <ProtectedRoute area="hospedes">
          <AppLayout><HospedesPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/itens" element={
        <ProtectedRoute area="itens">
          <AppLayout><ItensPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/consumo" element={
        <ProtectedRoute area="consumo">
          <AppLayout><ConsumoPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/entrada" element={
        <ProtectedRoute area="entrada">
          <AppLayout><EntradaPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/colaboradores" element={
        <ProtectedRoute area="colaboradores" somenteAdmin>
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
      <DataProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  )
}
