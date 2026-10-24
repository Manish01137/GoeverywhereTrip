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
  useEffect(() => {
    load()
    // Keep the list fresh while the admin page is open (new enquiries appear without reloading).
    const t = setInterval(() => { if (document.visibilityState === 'visible') adminApi.leads().then((r) => r.ok && setS((x) => ({ ...x, leads: r.leads, clicks: r.clicks, payments: r.payments }))) }, 30000)
    return () => clearInterval(t)
  }, [load])
  const setLeads = useCallback((fn) => setS((x) => ({ ...x, leads: fn(x.leads) })), [])
  return { ...s, reload: load, setLeads }
}
