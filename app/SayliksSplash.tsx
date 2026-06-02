"use client"

import { useEffect, useState } from "react"
import styles from "./page.module.css"

const INTRO_DURATION_MS = 4400
const REDUCED_MOTION_DURATION_MS = 350
const INTRO_COOKIE = "sayliks_intro_seen"

type SayliksSplashProps = {
  shouldPlay: boolean
}

export function SayliksSplash({ shouldPlay }: SayliksSplashProps) {
  const [isPlaying, setIsPlaying] = useState(shouldPlay)

  useEffect(() => {
    if (!shouldPlay) return

    document.cookie = `${INTRO_COOKIE}=1; path=/; SameSite=Lax`

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const duration = mediaQuery.matches ? REDUCED_MOTION_DURATION_MS : INTRO_DURATION_MS
    const timeout = window.setTimeout(() => setIsPlaying(false), duration)

    return () => window.clearTimeout(timeout)
  }, [shouldPlay])

  if (!isPlaying) {
    return null
  }

  return (
    <div className={`${styles.home} sayliks-intro-home animate-entrance`}>
      <object
        aria-label="sayliks"
        className={styles.title}
        data="/sayliks-intro.svg"
        role="img"
        tabIndex={-1}
        type="image/svg+xml"
      />
    </div>
  )
}
