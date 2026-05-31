import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

function createDisabledSupabaseClient() {
  const configError = new Error('Configurazione Supabase mancante o non valida.')
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
      signInWithPassword: fail,
      signUp: fail,
      signOut: fail,
    },
    from: () => chain,
    rpc: fail,
    storage:{ from: () => ({ upload:fail, getPublicUrl:() => ({ data:{ publicUrl:'' } }) }) },
    functions:{ invoke:fail },
  }
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDisabledSupabaseClient()
