
import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { API_BASE_URL } from './config'
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
import { useAuth } from './hooks/useAuth'

import type { View, User, Category, Region, Service } from './types'

function App() {
  const [view, setView] = useState<View>('home')
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const { auth, saveAuth, logout, updateUser } = useAuth()

  const [categories, setCategories] = useState<Category[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [publicDataLoading, setPublicDataLoading] = useState(false)
  const [publicDataError, setPublicDataError] = useState('')
  const [services, setServices] = useState<Service[]>([])
  const [myServices, setMyServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)

  const token = auth.state === 'authenticated' ? auth.token : null

  const apiFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers)
      headers.set('Accept', 'application/json')
      if (init?.body) headers.set('Content-Type', 'application/json')
      if (token) headers.set('Authorization', `Bearer ${token}`)

      const res = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers,
      })
      return res
    },
    [token],
  )

  const loadPublicData = useCallback(async () => {
    setPublicDataLoading(true)
    setPublicDataError('')
    try {
      const [catRes, regRes] = await Promise.all([
        apiFetch('/api/categories', { method: 'GET' }),
        apiFetch('/api/regions', { method: 'GET' }),
      ])

      if (catRes.ok) {
        const json = await catRes.json()
        const items = json.data?.items || json.items || []
        setCategories(items)
      } else {
        setPublicDataError(`Erro ao carregar categorias (HTTP ${catRes.status})`)
      }

      if (regRes.ok) {
        const json = await regRes.json()
        const items = json.data?.items || json.items || []
        setRegions(items)
      } else {
        setPublicDataError((prev) => prev || `Erro ao carregar regiões (HTTP ${regRes.status})`)
      }
    } catch {
      setPublicDataError('Erro de conexão ao carregar dados públicos')
    } finally {
      setPublicDataLoading(false)
    }
  }, [apiFetch])

  const loadServices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/requests/open', { method: 'GET' })
      if (res.ok) {
        const json = await res.json()
        const items = json.data?.items || json.items || []
        setServices(items)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [apiFetch])

  const loadMyServices = useCallback(async () => {
    if (auth.state !== 'authenticated') return
    try {
      const res = await apiFetch('/api/requests', { method: 'GET' })
      if (res.ok) {
        const json = await res.json()
        const items = json.data?.items || json.items || []
        setMyServices(items)
      }
    } catch {
      // silent
    }
  }, [apiFetch, auth.state])

  useEffect(() => {
    void loadPublicData()
  }, [loadPublicData])

  useEffect(() => {
    if (auth.state === 'authenticated' || view === 'public-services') {
      void loadServices()
    }
    if (auth.state === 'authenticated') {
      void loadMyServices()
    }
  }, [auth.state, view, loadServices, loadMyServices])


  const loadProfile = useCallback(async () => {
    if (auth.state !== 'authenticated') return
    try {
      const res = await apiFetch('/api/users/profile', { method: 'GET' })
      if (res.ok) {
        const json = await res.json() as { success: true; data: { user: User } }
        updateUser(json.data.user)
      }
    } catch {
      // silent
    }
  }, [apiFetch, auth.state, updateUser])

  const onLogout = useCallback(() => {
    logout()
    setServices([])
    setMyServices([])
    setView('home')
  }, [logout])

  const handleLoginSuccess = useCallback((data: { token: string; user: User } | { data: { token: string; user: User } }) => {
    const actualData = 'data' in data ? data.data : data
    saveAuth({ state: 'authenticated', token: actualData.token, user: actualData.user })
    setView('dashboard')
  }, [saveAuth])

  const handleRegisterSuccess = useCallback(() => {
    setView('login')
  }, [])

  const openServiceDetail = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    setView('service-detail')
  }

  const selectedService = services.find(s => s.id === selectedServiceId) || myServices.find(s => s.id === selectedServiceId)

  useEffect(() => {
    if (auth.state === 'authenticated' && view === 'home') {
      setView('dashboard')
    }
  }, [auth.state, view])

  return (
    <div className="app">
      <Header view={view} setView={setView} auth={auth} onLogout={onLogout} />

      <main className="main">
        {view === 'home' && auth.state === 'anonymous' && (
          <LandingPage
            setView={setView}
            categories={categories}
            regions={regions}
            setSelectedCategoryId={setSelectedCategoryId}
            publicDataLoading={publicDataLoading}
            publicDataError={publicDataError}
          />
        )}

        {view === 'dashboard' && auth.state === 'authenticated' && (
          <Dashboard
            auth={auth}
            services={services}
            myServices={myServices}
            categories={categories}
            regions={regions}
            setView={setView}
            loadServices={loadServices}
            loadMyServices={loadMyServices}
            loadProfile={loadProfile}
            openServiceDetail={openServiceDetail}
            apiBaseUrl={API_BASE_URL}
          />
        )}

        {view === 'services' && auth.state === 'authenticated' && (
          <ServicesPage
            services={services}
            categories={categories}
            loading={loading}
            onRefresh={loadServices}
            openServiceDetail={openServiceDetail}
          />
        )}

        {view === 'public-services' && (
          <ServicesPage
            services={services}
            categories={categories}
            loading={loading}
            onRefresh={loadServices}
            openServiceDetail={openServiceDetail}
            initialCategory={selectedCategoryId || undefined}
            fixedCategory={true}
            onBack={() => setView('home')}
          />
        )}

        {view === 'my-services' && auth.state === 'authenticated' && (
          <MyServicesPage
            myServices={myServices}
            setView={setView}
            openServiceDetail={openServiceDetail}
          />
        )}

        {view === 'create-service' && auth.state === 'authenticated' && auth.user.role === 'client' && (
          <CreateServicePage
            auth={auth}
            categories={categories}
            setView={setView}
            onServiceCreated={() => { loadMyServices(); setView('my-services') }}
            apiFetch={apiFetch}
          />
        )}

        {view === 'proposals' && auth.state === 'authenticated' && (
          <ProposalsPage auth={auth} apiFetch={apiFetch} />
        )}

        {view === 'service-detail' && selectedService && (
          <ServiceDetailPage
            service={selectedService}
            auth={auth}
            apiFetch={apiFetch}
            setView={setView}
          />
        )}

        {view === 'profile' && auth.state === 'authenticated' && (
          <ProfilePage
            auth={auth}
            setView={setView}
            apiFetch={apiFetch}
            apiBaseUrl={API_BASE_URL}
            myServicesCount={myServices.length}
            servicesCount={services.length}
          />
        )}

        {view === 'edit-profile' && auth.state === 'authenticated' && (
          <EditProfilePage
            auth={auth}
            setView={setView}
            apiFetch={apiFetch}
            apiBaseUrl={API_BASE_URL}
            onProfileUpdated={loadProfile}
          />
        )}

        {view === 'login' && (
          <LoginPage setView={setView} onLoginSuccess={handleLoginSuccess} apiBaseUrl={API_BASE_URL} />
        )}

        {view === 'register' && (
          <RegisterPage setView={setView} onRegisterSuccess={handleRegisterSuccess} apiBaseUrl={API_BASE_URL} />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
