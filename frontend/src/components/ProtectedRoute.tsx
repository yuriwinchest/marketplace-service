
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

interface ProtectedRouteProps {
    allowedRoles?: ('client' | 'professional')[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { auth } = useAuthStore()

    if (auth.state !== 'authenticated') {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}
