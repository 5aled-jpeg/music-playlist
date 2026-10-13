import { useState, useRef, useEffect, useMemo } from 'react'
import DiscCascadeCarousel, { type DiscCascadeItem } from '@/components/ui/disc-cascade-carousel'
import { MinimalPlayer } from '@/components/ui/minimal-player'
import { TRACKS } from '@/data/tracks'

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentTrack = TRACKS[currentIndex]

  // Map tracks to DiscCascadeItems
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

  // Audio source change
  useEffect(() => {
    if (!audioRef.current) return
    const wasPlaying = isPlaying

    audioRef.current.src = currentTrack.audioSrc
    audioRef.current.load()

    if (wasPlaying) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Playback error:", err)
          setIsPlaying(false)
        })
    }
  }, [currentIndex])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Playback error:", err)
        })
    }
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TRACKS.length)
  }

  const handleSeek = (time: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

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

  // Keyboard shortcut: Spacebar to toggle Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying])

  return (
    <div className="relative w-full h-screen h-[100dvh] overflow-hidden bg-[#060608] text-[#ecebe7] select-none font-sans flex flex-col justify-between">
      {/* Audio Engine */}
      <audio
        ref={audioRef}
        src={currentTrack.audioSrc}
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
          onIndexChange={(i) => setCurrentIndex(i)}
          onSelect={() => togglePlay()}
          loop={true}
          spin={isPlaying ? 14 : 26}
          sheen={0.65}
          depth={0.44}
          yaw={24}
          roll={110}
          background="radial-gradient(130% 95% at 50% 45%, #16161a, #060608 85%)"
          color="#ecebe7"
          fontHref="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;800&family=Oswald:wght@600;700&display=swap"
          hint=""
          ariaLabel="Personal music playlist"
        />
      </div>

      {/* Minimal Player with Progress Bar matching user reference */}
      <MinimalPlayer
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
      />
    </div>
  )
}
