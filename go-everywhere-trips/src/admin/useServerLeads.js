import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../lib/api'

// Enquiries, WhatsApp clicks and payments as recorded on the server (site-logs/*.csv).
export default function useServerLeads() {
  const [s, setS] = useState({ loading: true, leads: [], clicks: [], payments: [], error: null })
  const load = useCallback(async () => {
    setS((x) => ({ ...x, loading: true }))
    const r = await adminApi.leads()
    setS({ loading: false, leads: r.leads || [], clicks: r.clicks || [], payments: r.payments || [], error: r.ok ? null : r.error || 'Could not load enquiries' })
  }, [])
  useEffect(() => { load() }, [load])
  const setLeads = useCallback((fn) => setS((x) => ({ ...x, leads: fn(x.leads) })), [])
  return { ...s, reload: load, setLeads }
}
