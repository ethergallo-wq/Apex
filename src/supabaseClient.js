import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

function hasValidSupabaseConfig(url, key) {
  if (!url || !key) return false
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

export function getSupabaseAuthErrorMessage(error, fallback = 'Errore autenticazione.') {
  const code = String(error?.code || '')
  const message = String(error?.message || '')
  const networkFailure = /failed to fetch|network(?:error| request failed)|load failed|fetch failed/i.test(message)

  if (code === 'AUTH_TIMEOUT') {
    return 'Il servizio di accesso sta impiegando troppo tempo. Riprova tra poco.'
  }
  if (code === 'SUPABASE_CONFIG_ERROR' || /configurazione supabase/i.test(message)) {
    return 'Il servizio di accesso non è configurato correttamente.'
  }
  if (networkFailure) {
    return 'Il servizio di accesso è temporaneamente irraggiungibile. Controlla la connessione e riprova tra poco.'
  }
  return message || fallback
}

function createDisabledSupabaseClient() {
  const configError = new Error('Configurazione Supabase mancante o non valida.')
  configError.code = 'SUPABASE_CONFIG_ERROR'
  const fail = async () => ({ data:null, error:configError })
  const chain = {
    select: () => chain,
    insert: () => chain,
    upsert: () => chain,
    update: () => chain,
    delete: () => chain,
    eq: () => chain,
    neq: () => chain,
    in: () => chain,
    order: () => chain,
    limit: () => chain,
    maybeSingle: fail,
    single: fail,
    then: (resolve) => Promise.resolve({ data:null, error:configError }).then(resolve),
  }

  return {
    auth:{
      getSession: async () => ({ data:{ session:null }, error:null }),
      onAuthStateChange: () => ({ data:{ subscription:{ unsubscribe() {} } } }),
      signInWithOAuth: fail,
      signInWithIdToken: fail,
      signInWithPassword: fail,
      signUp: fail,
      refreshSession: async () => ({ data:{ session:null }, error:configError }),
      signOut: fail,
    },
    from: () => chain,
    rpc: fail,
    storage:{ from: () => ({ upload:fail, getPublicUrl:() => ({ data:{ publicUrl:'' } }) }) },
    functions:{ invoke:fail },
  }
}

export const supabase = hasValidSupabaseConfig(supabaseUrl, supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDisabledSupabaseClient()
