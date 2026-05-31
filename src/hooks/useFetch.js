import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../services/api'

export function useFetch(path, deps = []) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  // Use a counter so refetch() always triggers a new load even if path didn't change
  const [tick, setTick]       = useState(0)
  const pathRef               = useRef(path)
  pathRef.current             = path

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try   { setData(await api.get(pathRef.current)) }
    catch (e) { setError(e.message) }
    finally   { setLoading(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(deps), tick])

  useEffect(() => { load() }, [load])

  const refetch = useCallback(() => setTick(t => t + 1), [])

  return { data, loading, error, refetch }
}
