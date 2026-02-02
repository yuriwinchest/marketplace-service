
interface RoleSelectorProps {
    role: 'client' | 'professional'
    setRole: (role: 'client' | 'professional') => void
}

export function RoleSelector({ role, setRole }: RoleSelectorProps) {
    return (
        <div className="roleSelector">
            <button
                className={`roleBtn ${role === 'client' ? 'active' : ''}`}
                onClick={() => setRole('client')}
            >
                <span className="roleIcon">🏢</span>
                <span className="roleTitle">Cliente</span>
                <span className="roleDesc">Contratar</span>
            </button>
            <button
                className={`roleBtn ${role === 'professional' ? 'active' : ''}`}
                onClick={() => setRole('professional')}
            >
                <span className="roleIcon">💼</span>
                <span className="roleTitle">Freelancer</span>
                <span className="roleDesc">Trabalhar</span>
            </button>
        </div>
    )
}
