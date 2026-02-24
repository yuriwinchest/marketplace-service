
import { API_BASE_URL } from '../config'
import { useAuthStore } from '../store/useAuthStore'

export async function apiRequest<T>(
    path: string,
    init?: RequestInit
): Promise<T> {
    const { auth, setAuth, logout } = useAuthStore.getState()

    const token = auth.state === 'authenticated' ? auth.token : null
    const refreshToken = auth.state === 'authenticated' ? auth.refreshToken : null

    const headers = new Headers(init?.headers)
    headers.set('Accept', 'application/json')
    if (init?.body && !(init?.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json')
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    let response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers
    })

    // Handle Token Refresh
    if (response.status === 401 && refreshToken) {
        try {
            const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            })

            if (refreshRes.ok) {
                const data = await refreshRes.json()
                const nextData = data.data || data

                if (auth.state === 'authenticated') {
                    setAuth({
                        ...auth,
                        token: nextData.token,
                        refreshToken: nextData.refreshToken || refreshToken
                    })

                    // Retry with new token
                    headers.set('Authorization', `Bearer ${nextData.token}`)
                    response = await fetch(`${API_BASE_URL}${path}`, {
                        ...init,
                        headers
                    })
                }
            } else {
                logout()
            }
        } catch {
            logout()
        }
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
        throw new Error(error.message || `Erro ${response.status}`)
    }

    const json = await response.json()
    return (json.data || json) as T
}
