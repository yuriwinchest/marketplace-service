import { useCallback, useEffect, useState } from 'react'
import './App.css'
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





import type { View, AuthState, User, Category, Region, Service } from './types'

function App() {
  const [view, setView] = useState<View>('home')
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const apiBaseUrl = 'http://localhost:5000'

  const [auth, setAuth] = useState<AuthState>(() => {
    const raw = localStorage.getItem('auth')
    if (!raw) return { state: 'anonymous' }
    try {
      const parsed = JSON.parse(raw)
      if (parsed.token && parsed.user) {
        return { state: 'authenticated', token: parsed.token, user: parsed.user }
      }
      return { state: 'anonymous' }
    } catch {
      return { state: 'anonymous' }
    }
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [myServices, setMyServices] = useState<Service[]>([])





  const [loading, setLoading] = useState(false)

  const saveAuth = useCallback((next: AuthState) => {
    setAuth(next)
    if (next.state === 'authenticated') {
      localStorage.setItem('auth', JSON.stringify({ token: next.token, user: next.user }))
    } else {
      localStorage.removeItem('auth')
    }
  }, [])

  const token = auth.state === 'authenticated' ? auth.token : null

  const apiFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers)
      headers.set('Accept', 'application/json')
      if (init?.body) headers.set('Content-Type', 'application/json')
      if (token) headers.set('Authorization', `Bearer ${token}`)

      const res = await fetch(`${apiBaseUrl}${path}`, {
        ...init,
        headers,
      })
      return res
    },
    [apiBaseUrl, token],
  )

  const loadPublicData = useCallback(async () => {
    try {
      console.log('Carregando dados públicos...')
      const [catRes, regRes] = await Promise.all([
        apiFetch('/api/categories', { method: 'GET' }),
        apiFetch('/api/regions', { method: 'GET' }),
      ])

      if (catRes.ok) {
        const json = await catRes.json()
        const items = json.data?.items || json.items || []
        console.log('Categorias carregadas:', items.length)
        setCategories(items)
      } else {
        console.error('Erro ao carregar categorias:', catRes.status)
      }

      if (regRes.ok) {
        const json = await regRes.json()
        const items = json.data?.items || json.items || []
        console.log('Regiões carregadas:', items.length)
        setRegions(items)
      }
    } catch (error) {
      console.error('Erro na carga de dados públicos:', error)
    }
  }, [apiFetch])

  const loadServices = useCallback(async () => {
    // Permitir carregar se autenticado OU explicitamente no modo publico
    // (A checagem de view dentro do useCallback pode ser tricky se view nao for dependencia, 
    // mas aqui o backend endpoint /open agora eh publico)
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
  }, [apiFetch, auth.state])

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
      const res = await apiFetch('/api/profile', { method: 'GET' })
      if (res.ok) {
        const json = await res.json()
        const data = json.data || json
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        saveAuth({ state: 'authenticated', token: token!, user: data.user })
      }
    } catch {
      // silent
    }
  }, [apiFetch, auth.state, token, saveAuth])

  const onLogout = useCallback(() => {
    saveAuth({ state: 'anonymous' })
    setServices([])
    setMyServices([])
    setView('home')
  }, [saveAuth])

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
            apiBaseUrl={apiBaseUrl}
          />
        )}

        {view === 'services' && auth.state === 'authenticated' && (
          <ServicesPage
            services={services}
            categories={categories}
            regions={regions}
            loading={loading}
            onRefresh={loadServices}
            openServiceDetail={openServiceDetail}
          />
        )}

        {view === 'public-services' && (
          <ServicesPage
            services={services}
            categories={categories}
            regions={regions}
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
            apiBaseUrl={apiBaseUrl}
            myServicesCount={myServices.length}
            servicesCount={services.length}
          />
        )}

        {view === 'edit-profile' && auth.state === 'authenticated' && (
          <EditProfilePage
            auth={auth}
            setView={setView}
            apiFetch={apiFetch}
            apiBaseUrl={apiBaseUrl}
            onProfileUpdated={loadProfile}
          />
        )}

        {view === 'login' && (
          <LoginPage setView={setView} onLoginSuccess={handleLoginSuccess} apiBaseUrl={apiBaseUrl} />
        )}

        {view === 'register' && (
          <RegisterPage setView={setView} onRegisterSuccess={handleRegisterSuccess} apiBaseUrl={apiBaseUrl} />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
