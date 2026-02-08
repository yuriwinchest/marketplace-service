// Centraliza traduções de mensagens comuns do Supabase Auth para PT-BR.
// Evita vazar mensagens em inglês para o frontend.

export function toPtBrAuthErrorMessage(raw: string): string {
  const msg = String(raw || '').trim()
  const lower = msg.toLowerCase()

  if (!msg) return 'Erro ao processar autenticação'

  // Sign up / register
  if (lower.includes('already registered') || lower.includes('already exists')) {
    return 'E-mail já cadastrado'
  }
  if (lower.includes('email rate limit exceeded')) {
    return 'Muitas tentativas de cadastro. Tente novamente mais tarde.'
  }
  if (lower.includes('password') && lower.includes('should be at least')) {
    return 'Senha muito fraca. Use uma senha mais forte.'
  }
  if (lower.includes('invalid email') || lower.includes('email address') && lower.includes('is invalid')) {
    return 'E-mail inválido'
  }

  // Sign in / login
  if (lower.includes('invalid login credentials')) {
    return 'E-mail ou senha inválidos'
  }
  if (lower.includes('email not confirmed') || lower.includes('not confirmed')) {
    return 'Confirme seu e-mail antes de entrar.'
  }
  if (lower.includes('too many requests')) {
    return 'Muitas tentativas. Aguarde um pouco e tente novamente.'
  }

  // Refresh
  if (lower.includes('refresh token') && (lower.includes('invalid') || lower.includes('expired'))) {
    return 'Sessão expirada. Faça login novamente.'
  }

  // Fallback (não expor texto cru se parecer “técnico demais”)
  // Mantemos a mensagem original se já estiver em PT-BR, ou se for curta e legível.
  const looksEnglish = /[a-z]/.test(msg) && !/[áéíóúâêôãõç]/i.test(msg) && lower.includes(' ')
  if (looksEnglish) return 'Erro de autenticação. Tente novamente.'

  return msg
}

