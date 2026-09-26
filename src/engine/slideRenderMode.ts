export type SlideRenderMode = 'audience' | 'presenter-current' | 'presenter-next' | 'overview'

export function shouldPlayVideo(mode: SlideRenderMode): boolean {
  return mode === 'audience' || mode === 'presenter-current'
}
