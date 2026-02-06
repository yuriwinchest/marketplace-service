
import type { AuthState, View } from '../types'
import { useEditProfile } from '../hooks/useEditProfile'
import { ProfileAvatarEditor } from '../components/ProfileAvatarEditor'

interface EditProfilePageProps {
    auth: Extract<AuthState, { state: 'authenticated' }>
    setView: (view: View) => void
    apiFetch: (path: string, init?: RequestInit) => Promise<Response>
    onProfileUpdated: () => Promise<void>
    apiBaseUrl: string
}

export function EditProfilePage({ auth, setView, apiFetch, onProfileUpdated, apiBaseUrl }: EditProfilePageProps) {
    const {
        formState,
        setters,
        ui,
        saveProfile,
        uploadAvatar
    } = useEditProfile({ auth, apiFetch, onProfileUpdated, apiBaseUrl })

    const { name, description, bio, phone, skills } = formState
    const { setName, setDescription, setBio, setPhone, setSkills } = setters
    const { loading, error, avatarUploading } = ui

    return (
        <div className="editProfilePage">
            <button className="backBtn" onClick={() => setView('profile')}>← Voltar</button>
            <div className="formCard">
                <h1>Editar Perfil</h1>

                <ProfileAvatarEditor
                    user={auth.user}
                    apiBaseUrl={apiBaseUrl}
                    avatarUploading={avatarUploading}
                    onUpload={uploadAvatar}
                />

                <div className="formSection">
                    <div className="formGroup">
                        <label>Nome completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Seu nome"
                        />
                    </div>
                    <div className="formGroup">
                        <label>E-mail</label>
                        <input type="email" defaultValue={auth.user.email} disabled />
                    </div>
                    <div className="formGroup">
                        <label>Descrição</label>
                        <textarea
                            placeholder="Fale um pouco sobre você (minimo 10 caracteres)"
                            rows={4}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                    {auth.user.role === 'professional' && (
                        <>
                            <div className="formGroup">
                                <label>Telefone</label>
                                <input
                                    type="tel"
                                    placeholder="(00) 00000-0000"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </div>
                            <div className="formGroup">
                                <label>Bio profissional (opcional)</label>
                                <textarea
                                    placeholder="Conte um pouco sobre você e sua experiência..."
                                    rows={4}
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                />
                            </div>
                            <div className="formGroup">
                                <label>Habilidades (separadas por vírgula)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Pintura, Encanamento, Excel, Design..."
                                    value={skills}
                                    onChange={e => setSkills(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {error && <div className="errorBox">{error}</div>}

                    <div className="formActions">
                        <button
                            className="btnPrimary"
                            onClick={() => saveProfile(() => setView('profile'))}
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
