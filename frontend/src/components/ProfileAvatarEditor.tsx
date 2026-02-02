
import type { User } from '../types'

interface ProfileAvatarEditorProps {
    user: User
    apiBaseUrl: string
    avatarUploading: boolean
    onUpload: (file: File) => void
    error?: string | null
}

export function ProfileAvatarEditor({ user, apiBaseUrl, avatarUploading, onUpload, error }: ProfileAvatarEditorProps) {
    const getUserName = () => user.name || user.email.split('@')[0]

    return (
        <div className="profileAvatarEdit">
            {user.avatar_url ? (
                <img
                    src={`${apiBaseUrl}${user.avatar_url}`}
                    alt="Avatar"
                    className="profileAvatarImg lg"
                />
            ) : (
                <div className="profileAvatar lg">
                    {getUserName().charAt(0).toUpperCase()}
                </div>
            )}
            <label className="btnSecondary btnSm avatarUploadBtn">
                {avatarUploading ? 'Enviando...' : 'Alterar foto'}
                <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) onUpload(file)
                    }}
                    disabled={avatarUploading}
                />
            </label>
            {error && <div className="errorBox">{error}</div>}
        </div>
    )
}
