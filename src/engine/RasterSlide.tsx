import styles from './RasterSlide.module.css'

export function RasterSlide({ src, alt }: { src: string; alt: string }) {
  return <img className={styles.image} src={src} alt={alt} />
}
