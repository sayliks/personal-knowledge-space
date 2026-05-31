"use client"

import { useEffect, useState } from "react"
import styles from "./page.module.css"

const INTRO_DURATION_MS = 3400
const REDUCED_MOTION_DURATION_MS = 350

export function BlackMirrorSplash() {
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const duration = mediaQuery.matches ? REDUCED_MOTION_DURATION_MS : INTRO_DURATION_MS
    const timeout = window.setTimeout(() => setIsPlaying(false), duration)

    return () => window.clearTimeout(timeout)
  }, [])

  if (!isPlaying) {
    return null
  }

  return (
    <div className={`${styles.home} black-mirror-home`}>
      <object
        aria-label="BLACK MIRROR"
        className={styles.title}
        data="/black-mirror.svg"
        role="img"
        tabIndex={-1}
        type="image/svg+xml"
      />
    </div>
  )
}
