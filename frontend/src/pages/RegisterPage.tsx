import { useEffect, useMemo } from 'react'
import type { View } from '../types'
import { RoleSelector } from '../components/RoleSelector'
import { useRegister } from '../hooks/useRegister'

interface RegisterPageProps {
    setView: (view: View) => void
    onRegisterSuccess: (email: string) => void
    apiBaseUrl: string
}

export function RegisterPage({ setView, onRegisterSuccess, apiBaseUrl }: RegisterPageProps) {
    const { formState, setters, ui, handleRegister } = useRegister({ apiBaseUrl, onRegisterSuccess })
    const { name, email, password, description, avatarUrl, avatarFile, role } = formState
    const { setName, setEmail, setPassword, setDescription, setAvatarUrl, setAvatarFile, setRole } = setters
    const { error, loading } = ui

    const canSubmit =
        !!email &&
        !!password &&
        description.trim().length >= 10 &&
        (avatarUrl.trim().length > 0 || !!avatarFile)

    const filePreviewUrl = useMemo(() => {
        if (!avatarFile) return ''
        return URL.createObjectURL(avatarFile)
    }, [avatarFile])

    useEffect(() => {
        return () => {
            if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
        }
    }, [filePreviewUrl])

    const previewUrl = filePreviewUrl || (avatarUrl.trim() ? avatarUrl.trim() : '')

    return (
        <div className="authPage">
            <div className="authCard">
                <h1>Criar conta</h1>
                <p className="subtitle">Cadastre-se gratuitamente</p>
                <div className="authForm">
                    <div className="authGrid">
                        <div className="authInputs">
                            <div className="formGroup">
                                <label>Nome completo</label>
                                <input
                                    type="text"
                                    placeholder="Seu nome"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div className="formGroup">
                                <label>Descrição</label>
                                <textarea
                                    placeholder="Conte um pouco sobre você (minimo 10 caracteres)"
                                    rows={4}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="formGroup">
                                <label>Foto</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null
                                        setAvatarFile(file)
                                    }}
                                />
                                <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Opcional: se preferir, cole um link abaixo. Se anexar arquivo, ele sera enviado para o servidor.
                                </div>
                                <input
                                    type="url"
                                    placeholder="https://... (opcional)"
                                    value={avatarUrl}
                                    onChange={e => setAvatarUrl(e.target.value)}
                                    style={{ marginTop: '0.6rem' }}
                                />
                                {!!previewUrl && (
                                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <img
                                            src={previewUrl}
                                            alt="Prévia da foto"
                                            style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover' }}
                                            onError={(e) => {
                                                ; (e.currentTarget as HTMLImageElement).style.display = 'none'
                                            }}
                                            onLoad={(e) => {
                                                ; (e.currentTarget as HTMLImageElement).style.display = 'block'
                                            }}
                                        />
                                        {avatarFile && (
                                            <button
                                                className="btnSecondary btnSm"
                                                type="button"
                                                onClick={() => setAvatarFile(null)}
                                            >
                                                Remover anexo
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="formGroup">
                                <label>E-mail</label>
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="formGroup">
                                <label>Senha</label>
                                <input
                                    type="password"
                                    placeholder="Minimo 6 caracteres"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="authRoles">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Tipo de conta</label>
                            <RoleSelector role={role} setRole={setRole} />
                        </div>
                    </div>
                    {error && <div className="errorBox">{error}</div>}
                    <button
                        className="btnPrimary btnFull"
                        onClick={handleRegister}
                        disabled={loading || !canSubmit}
                    >
                        {loading ? 'Criando...' : 'Criar conta'}
                    </button>
                </div>
                <div className="authFooter">
                    <span>Ja tem conta?</span>
                    <button className="btnLink" onClick={() => setView('login')}>Entrar</button>
                </div>
            </div>
        </div>
    )
}
