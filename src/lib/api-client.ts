import { supabase } from '@/lib/supabase'

/** fetch() that attaches the signed-in user's Supabase access token for protected API routes. */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession()
  const headers = new Headers(init.headers)
  if (data.session?.access_token) {
    headers.set('Authorization', `Bearer ${data.session.access_token}`)
  }
  return fetch(input, { ...init, headers })
}
