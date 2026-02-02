
import { useState, useCallback } from 'react'
import type { AuthState, User } from '../types'

export function useAuth() {
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

    const saveAuth = useCallback((next: AuthState) => {
        setAuth(next)
        if (next.state === 'authenticated') {
            localStorage.setItem('auth', JSON.stringify({ token: next.token, user: next.user }))
        } else {
            localStorage.removeItem('auth')
        }
    }, [])

    const logout = useCallback(() => {
        saveAuth({ state: 'anonymous' })
    }, [saveAuth])

    // Helper to update user data without changing token
    const updateUser = useCallback((user: User) => {
        setAuth(prev => {
            if (prev.state !== 'authenticated') return prev
            const next = { ...prev, user }
            localStorage.setItem('auth', JSON.stringify({ token: next.token, user: next.user }))
            return next
        })
    }, [])

    return { auth, setAuth, saveAuth, logout, updateUser }
}
