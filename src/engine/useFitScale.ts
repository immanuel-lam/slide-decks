import { useEffect, useRef, useState, type RefObject } from 'react'
import { STAGE_W, STAGE_H } from './types.ts'

/** Scale that fits the 1280×720 stage inside the observed element, with a little air. */
export function useFitScale<T extends HTMLElement>(pad = 1): [RefObject<T | null>, number] {
  const ref = useRef<T>(null)
  const [scale, setScale] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      setScale(Math.min(rect.width / STAGE_W, rect.height / STAGE_H) * pad)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [pad])
  return [ref, scale]
}
