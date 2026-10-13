import { useState, useRef, useEffect, useMemo } from 'react'
import DiscCascadeCarousel, { type DiscCascadeItem } from '@/components/ui/disc-cascade-carousel'
import { MinimalPlayer } from '@/components/ui/minimal-player'
import { LuxuryCursor } from '@/components/ui/luxury-cursor'
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
        { label: t.side || "Track", value: t.year || "Archive" },
        { label: "Perspective", value: t.message },
      ],
      reviews: [
        {
          source: "Our Memory",
          quote: t.quote,
          stars: 5,
        },
      ],
    }))
  }, [])

  // Update audio source when current track changes
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
          console.warn("Autoplay prevented:", err)
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

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : TRACKS.length - 1))
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

  const handleTrackEnded = () => {
    // Automatically play next track
    handleNext()
  }

  return (
    <div className="relative w-full h-screen h-[100dvh] overflow-hidden bg-[#060608] text-[#ecebe7] select-none font-sans flex flex-col justify-between">
      {/* Sleek luxury custom cursor */}
      <LuxuryCursor />

      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* Ambient background glow */}
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
          spin={isPlaying ? 16 : 0}
          sheen={0.65}
          depth={0.44}
          yaw={24}
          roll={110}
          background="radial-gradient(130% 95% at 50% 45%, #18181c, #060608 85%)"
          color="#ecebe7"
          fontHref="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;800&family=Oswald:wght@600;700&display=swap"
          hint="Click disc to play · Drag to browse"
          ariaLabel="Personal music playlist"
        />
      </div>

      {/* Minimal Player with Progress Bar matching user design */}
      <MinimalPlayer
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onPrev={handlePrev}
        onNext={handleNext}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        trackTitle={currentTrack.title}
        trackArtist={currentTrack.artist}
      />
    </div>
  )
}
