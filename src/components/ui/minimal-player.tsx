import React, { useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'

interface MinimalPlayerProps {
  isPlaying: boolean
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  trackTitle: string
  trackArtist: string
}

export const MinimalPlayer: React.FC<MinimalPlayerProps> = ({
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  currentTime,
  duration,
  onSeek,
  trackTitle,
  trackArtist,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isMuted, setIsMuted] = React.useState(false)

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newPercent = Math.max(0, Math.min(1, clickX / rect.width))
    onSeek(newPercent * duration)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4 md:py-6 flex flex-col items-center pointer-events-auto">
      {/* Container with deep glassmorphism */}
      <div className="w-full max-w-2xl px-6 py-3.5 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col gap-3">
        {/* Top line: Track info + controls */}
        <div className="flex items-center justify-between text-xs tracking-wider">
          {/* Track title & artist */}
          <div className="flex flex-col truncate max-w-[180px] sm:max-w-xs">
            <span className="font-semibold text-white/90 truncate uppercase text-[11px] tracking-widest">
              {trackTitle}
            </span>
            <span className="text-[10px] text-white/40 tracking-wider truncate">
              {trackArtist}
            </span>
          </div>

          {/* Minimal Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous track"
              className="p-1 text-white/60 hover:text-white transition-opacity active:scale-95"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-black hover:bg-white/90 active:scale-90 transition-all shadow-md"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={onNext}
              aria-label="Next track"
              className="p-1 text-white/60 hover:text-white transition-opacity active:scale-95"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Time digits */}
          <div className="text-[10px] font-mono tabular-nums text-white/50 tracking-wider hidden sm:block">
            {formatTime(currentTime)} <span className="text-white/20">/</span> {formatTime(duration)}
          </div>
        </div>

        {/* Minimal Progress Bar matching user's screenshot */}
        <div
          ref={progressBarRef}
          onClick={handleBarClick}
          className="group relative w-full h-3 flex items-center cursor-pointer select-none"
        >
          {/* Track background */}
          <div className="w-full h-[3px] bg-white/15 rounded-full overflow-hidden transition-all group-hover:h-[4px]">
            {/* White active progress line */}
            <div
              className="h-full bg-white rounded-full transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
