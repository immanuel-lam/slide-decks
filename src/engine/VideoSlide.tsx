import { useEffect, useRef } from 'react'
import { useDeckMedia } from './DeckMediaProvider.tsx'
import { useSlideRenderMode } from './SlideRenderContext.tsx'
import { shouldPlayVideo } from './slideRenderMode.ts'
import { startVideoPlayback } from './videoPlayback.ts'
import styles from './VideoSlide.module.css'

export function VideoSlide({
  src,
  poster,
  label,
}: {
  src: string
  poster: string
  label: string
}) {
  const mode = useSlideRenderMode()
  const { playbackError, retryToken, resolveVideo, reportPlaybackError, retry } = useDeckMedia()
  const videoRef = useRef<HTMLVideoElement>(null)
  const playsVideo = shouldPlayVideo(mode)
  const videoSrc = resolveVideo(src)

  useEffect(() => {
    if (!playsVideo || playbackError) return

    const video = videoRef.current
    if (!video) return

    return startVideoPlayback(video, reportPlaybackError)
  }, [playbackError, playsVideo, reportPlaybackError, retryToken, videoSrc])

  if (!playsVideo || playbackError) {
    return (
      <div className={styles.fallback}>
        <img className={styles.poster} src={poster} alt={label} />
        {playsVideo && (
          <button
            type="button"
            className={styles.retryButton}
            onClick={(event) => {
              event.stopPropagation()
              retry()
            }}
          >
            PLAY VIDEO
          </button>
        )}
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      className={styles.video}
      src={videoSrc}
      poster={poster}
      aria-label={label}
      onError={reportPlaybackError}
      muted
      playsInline
      preload="auto"
    />
  )
}
