import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import DiscCascadeCarousel, { type DiscCascadeItem } from '@/components/ui/disc-cascade-carousel'
import { MinimalPlayer } from '@/components/ui/minimal-player'
import { TRACKS } from '@/data/tracks'

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(() => {
    try {
      const saved = localStorage.getItem('side_b_volume')
      return saved !== null ? Math.max(0, Math.min(1, parseFloat(saved))) : 0.8
    } catch {
      return 0.8
    }
  })
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentTrack = TRACKS[currentIndex]

  // Map tracks to DiscCascadeItems (memoized once)
  const carouselItems: DiscCascadeItem[] = useMemo(() => {
    return TRACKS.map((t) => ({
      title: t.title,
      src: t.coverSrc,
      credits: [
        { label: "Artist", value: t.artist },
        { label: t.side || "Side", value: t.year || "Archive" },
        { label: "Note", value: t.message },
      ],
      reviews: [
        {
          source: "From Me",
          quote: t.quote,
          stars: 5,
        },
      ],
    }))
  }, [])

  // Sync volume & mute state to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
    try {
      localStorage.setItem('side_b_volume', volume.toString())
    } catch {
      // ignore
    }
  }, [volume, isMuted])

  // Preload initial track on mount
  useEffect(() => {
    if (audioRef.current && TRACKS[0]) {
      audioRef.current.src = TRACKS[0].audioSrc
      audioRef.current.volume = isMuted ? 0 : volume
      audioRef.current.load()
    }
  }, [])

  // Debounced audio loading & playback so transitions across tracks are buttery smooth
  useEffect(() => {
    const targetTrack = TRACKS[currentIndex]
    if (!audioRef.current || !targetTrack) return

    const wasPlaying = isPlaying

    const timer = setTimeout(() => {
      const audio = audioRef.current
      if (!audio) return

      const cleanSrc = targetTrack.audioSrc
      if (!audio.src.endsWith(encodeURI(cleanSrc)) && audio.src !== cleanSrc) {
        audio.src = cleanSrc
        audio.volume = isMuted ? 0 : volume
      }

      if (wasPlaying) {
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((err) => {
              if (err.name !== 'AbortError') {
                console.warn('Playback error:', err)
                setIsPlaying(false)
              }
            })
        }
      }
    }, 380)

    return () => clearTimeout(timer)
  }, [currentIndex, isMuted, volume])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      const audio = audioRef.current
      if (!audio.src) {
        audio.src = TRACKS[currentIndex].audioSrc
      }
      audio.volume = isMuted ? 0 : volume
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Playback error:', err)
          })
      }
    }
  }, [isPlaying, currentIndex, isMuted, volume])

  const handleIndexChange = useCallback((i: number) => {
    setCurrentIndex(i)
  }, [])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % TRACKS.length)
  }, [])

  const handleSeek = useCallback((time: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }, [])

  const handleVolumeChange = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol))
    setVolume(clamped)
    if (clamped > 0 && isMuted) {
      setIsMuted(false)
    }
  }, [isMuted])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      if (!next && volume === 0) {
        setVolume(0.5)
      }
      return next
    })
  }, [volume])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  // Keyboard shortcuts: Spacebar to toggle Play/Pause, M to mute/unmute, Up/Down for volume
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.code === 'KeyM') {
        e.preventDefault()
        toggleMute()
      } else if (e.code === 'ArrowUp') {
        e.preventDefault()
        handleVolumeChange(volume + 0.05)
      } else if (e.code === 'ArrowDown') {
        e.preventDefault()
        handleVolumeChange(volume - 0.05)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, toggleMute, handleVolumeChange, volume])

  return (
    <div data-is-playing={isPlaying ? "true" : "false"} className="relative w-full h-screen h-[100dvh] overflow-hidden bg-[#060608] text-[#ecebe7] select-none font-sans flex flex-col justify-between">
      {/* Audio Engine - src controlled programmatically to prevent synchronous render stalls */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNext}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* Subtle ambient lighting */}
      <div className="ambient-glow" />

      {/* 3D CD Disc Carousel */}
      <div className="w-full h-full flex-1 relative">
        <DiscCascadeCarousel
          items={carouselItems}
          brand="SIDE // B"
          indexLabel="TRACKLIST"
          index={currentIndex}
          onIndexChange={handleIndexChange}
          onSelect={togglePlay}
          loop={true}
          duration={0.52}
          bounce={0.12}
          spin={18}
          sheen={0.65}
          depth={0.44}
          yaw={24}
          roll={110}
          background="radial-gradient(130% 95% at 50% 45%, #16161a, #060608 85%)"
          color="#ecebe7"
          fontHref="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;800&family=Oswald:wght@600;700&display=swap"
          controls={false}
          discSize="clamp(230px, min(65vmin, 62vw), 500px)"
          hint=""
          ariaLabel="Personal music playlist"
        />
      </div>

      {/* Minimal Player with Progress Bar and Audio Modifier */}
      <MinimalPlayer
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        currentIndex={currentIndex}
        totalTracks={TRACKS.length}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />
    </div>
  )
}
