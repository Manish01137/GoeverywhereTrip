import { useEffect, useRef, useState } from 'react'

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or blocked — state still lives in memory */
  }
}

// Persists only after the value actually changes, so untouched defaults keep
// following the code (content updates reach visitors who never edited anything).
export function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => load(key, fallback))
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    save(key, value)
  }, [key, value])
  return [value, setValue]
}
