export interface PlayableVideo {
  currentTime: number
  play: () => Promise<void>
  pause: () => void
}

export function startVideoPlayback(
  video: PlayableVideo,
  reportPlaybackError: () => void,
): () => void {
  let active = true

  video.currentTime = 0
  void video.play().catch(() => {
    if (active) reportPlaybackError()
  })

  return () => {
    active = false
    video.pause()
    video.currentTime = 0
  }
}
