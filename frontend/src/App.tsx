
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { Dashboard } from './pages/Dashboard'
import { ServicesPage } from './pages/ServicesPage'
import { CreateServicePage } from './pages/CreateServicePage'
import { EditProfilePage } from './pages/EditProfilePage'
import { ProfilePage } from './pages/ProfilePage'
import { MyServicesPage } from './pages/MyServicesPage'
import { ProposalsPage } from './pages/ProposalsPage'
import { ServiceDetailPage } from './pages/ServiceDetailPage'
import { ProfessionalsPage } from './pages/ProfessionalsPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuthStore } from './store/useAuthStore'
import './App.css'


function App() {
  const { auth } = useAuthStore()
  const location = useLocation()
  const isLanding = location.pathname === '/'
  // categories used in Header or footer? Actually categories is retrieved in useCategories hook inside components now usually. 
  // But Header might still be using it or passed as prop. Let's check Header.

  return (
    <div className="app bg-forest-900 min-h-screen text-white font-sans">
      <Header />

      <main className={`main-content ${isLanding ? 'pt-0 pb-0' : 'pt-4 pb-20'}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            auth.state === 'authenticated'
              ? <Navigate to="/dashboard" replace />
              : <LandingPage />
          } />

          <Route path="/login" element={
            auth.state === 'authenticated'
              ? <Navigate to="/dashboard" replace />
              : <LoginPage />
          } />

          <Route path="/cadastrar" element={
            auth.state === 'authenticated'
              ? <Navigate to="/dashboard" replace />
              : <RegisterPage />
          } />

          <Route path="/profissionais" element={<ProfessionalsPage />} />
          <Route path="/servicos-publicos" element={<ServicesPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/perfil/editar" element={<EditProfilePage />} />
            <Route path="/propostas" element={<ProposalsPage />} />

            {/* Client only */}
            <Route element={<ProtectedRoute allowedRoles={['client']} />}>
              <Route path="/criar-servico" element={<CreateServicePage />} />
              <Route path="/meus-servicos" element={<MyServicesPage />} />
            </Route>

            {/* Professional only */}
            <Route element={<ProtectedRoute allowedRoles={['professional']} />}>
              <Route path="/servicos" element={<ServicesPage />} />
            </Route>

            <Route path="/servico/:id" element={<ServiceDetailPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
