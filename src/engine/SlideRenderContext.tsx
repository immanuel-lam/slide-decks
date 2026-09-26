import { createContext, useContext, type ReactNode } from 'react'
import type { SlideRenderMode } from './slideRenderMode.ts'

const SlideRenderContext = createContext<SlideRenderMode>('overview')

export function SlideRenderModeProvider({
  mode,
  children,
}: {
  mode: SlideRenderMode
  children: ReactNode
}) {
  return <SlideRenderContext.Provider value={mode}>{children}</SlideRenderContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useSlideRenderMode(): SlideRenderMode {
  return useContext(SlideRenderContext)
}
