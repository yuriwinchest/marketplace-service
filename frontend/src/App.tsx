import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { Header } from './components/Header'
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





import type { View, AuthState, User, Profile, Category, Region, Service } from './types'
import { formatDate, formatCurrency, urgencyLabel, urgencyClass, statusLabel, statusClass, formatLocation } from './utils/formatters'






function App() {
  const [view, setView] = useState<View>('home')
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

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
      const [catRes, regRes] = await Promise.all([
        apiFetch('/api/categories', { method: 'GET' }),
        apiFetch('/api/regions', { method: 'GET' }),
      ])
      if (catRes.ok) {
        const data = (await catRes.json()) as { items: Category[] }
        setCategories(data.items || [])
      }
      if (regRes.ok) {
        const data = (await regRes.json()) as { items: Region[] }
        setRegions(data.items || [])
      }
    } catch {
      // silent
    }
  }, [apiFetch])

  const loadServices = useCallback(async () => {
    if (auth.state !== 'authenticated') return
    setLoading(true)
    try {
      const res = await apiFetch('/api/requests/open', { method: 'GET' })
      if (res.ok) {
        const data = (await res.json()) as { items: Service[] }
        setServices(data.items || [])
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
        const data = (await res.json()) as { items: Service[] }
        setMyServices(data.items || [])
      }
    } catch {
      // silent
    }
  }, [apiFetch, auth.state])

  useEffect(() => {
    void loadPublicData()
  }, [loadPublicData])

  useEffect(() => {
    if (auth.state === 'authenticated') {
      void loadServices()
      void loadMyServices()
    }
  }, [auth.state, loadServices, loadMyServices])









  const loadProfile = useCallback(async () => {
    if (auth.state !== 'authenticated') return
    try {
      const res = await apiFetch('/api/profile', { method: 'GET' })
      if (res.ok) {
        const data = await res.json() as { user: User; profile: Profile | null }
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

  const handleLoginSuccess = useCallback((data: { token: string; user: User }) => {
    saveAuth({ state: 'authenticated', token: data.token, user: data.user })
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
          <LandingPage setView={setView} categories={categories} regions={regions} />
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

        {view === 'service-detail' && selectedService && (
          <div className="serviceDetailPage">
            <button className="backBtn" onClick={() => setView(auth.state === 'authenticated' && auth.user.role === 'client' ? 'my-services' : 'services')}>
              ← Voltar
            </button>

            <div className="serviceDetailLayout">
              <div className="serviceDetailMain">
                <div className="card">
                  <div className="serviceDetailHeader">
                    <div>
                      <span className={`badge ${statusClass(selectedService.status)}`}>
                        {statusLabel(selectedService.status)}
                      </span>
                      <h1>{selectedService.title}</h1>
                      <div className="serviceDetailMeta">
                        <span>📅 {formatDate(selectedService.created_at)}</span>
                        <span>📍 {formatLocation(selectedService)}</span>
                        <span>🏷️ {selectedService.category_name || 'Sem categoria'}</span>
                      </div>
                    </div>
                    <div className="serviceDetailBudget">
                      <div className="budgetLabel">Orcamento</div>
                      <div className="budgetValue">
                        {selectedService.budget_min && selectedService.budget_max
                          ? `${formatCurrency(selectedService.budget_min)} - ${formatCurrency(selectedService.budget_max)}`
                          : 'A combinar'}
                      </div>
                    </div>
                  </div>

                  <div className="serviceDetailBody">
                    <h2>Descricao</h2>
                    <p>{selectedService.description || 'Sem descricao detalhada.'}</p>
                  </div>

                  <div className="serviceDetailInfo">
                    <div className="infoItem">
                      <span className="infoLabel">Urgencia</span>
                      <span className={`badge ${urgencyClass(selectedService.urgency)}`}>
                        {urgencyLabel(selectedService.urgency)}
                      </span>
                    </div>
                    <div className="infoItem">
                      <span className="infoLabel">Status</span>
                      <span className={`badge ${statusClass(selectedService.status)}`}>
                        {statusLabel(selectedService.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="serviceDetailSidebar">
                {auth.state === 'authenticated' && auth.user.role === 'professional' && selectedService.status === 'open' && (
                  <div className="card">
                    <h3>Interessado?</h3>
                    <p className="cardDesc">
                      O sistema de propostas esta em desenvolvimento. Em breve voce podera enviar propostas diretamente por aqui.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
          <ProposalsPage />
        )}

        {view === 'service-detail' && selectedService && (
          <ServiceDetailPage
            service={selectedService}
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
    </div>
  )
}

export default App
