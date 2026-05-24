import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../services/api'

export function useFetch(path, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const depsKey = JSON.stringify(deps)
  const pathRef = useRef(path)
  pathRef.current = path

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setData(await api.get(pathRef.current)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey])

  useEffect(() => { load() }, [load])
  return { data, loading, error, refetch: load }
}
