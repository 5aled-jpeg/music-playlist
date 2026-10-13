import React, { useRef } from 'react'
import { Play, Pause } from 'lucide-react'

interface MinimalPlayerProps {
  isPlaying: boolean
  onTogglePlay: () => void
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  currentIndex?: number
  totalTracks?: number
}

export const MinimalPlayer: React.FC<MinimalPlayerProps> = ({
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  currentIndex,
  totalTracks,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null)

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
    <div className="fixed bottom-6 left-0 right-0 z-40 flex items-center justify-center pointer-events-auto px-5 sm:px-6">
      {/* Ultra-minimal floating control: Play/Pause + Progress Line + Track Count + Time */}
      <div className="flex items-center gap-3.5 w-full max-w-sm sm:max-w-md select-none">
        {/* Minimal Play/Pause toggle button */}
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="text-white/70 hover:text-white transition-opacity active:scale-90 p-1 flex-shrink-0 cursor-pointer focus:outline-none"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Minimal Progress Line (exact match to user reference screenshot) */}
        <div
          ref={progressBarRef}
          onClick={handleBarClick}
          className="group relative flex-1 h-5 flex items-center cursor-pointer select-none"
        >
          {/* Subtle background rail */}
          <div className="w-full h-[2.5px] bg-white/20 rounded-full overflow-hidden transition-all group-hover:h-[3.5px]">
            {/* White elapsed progress */}
            <div
              className="h-full bg-white rounded-full transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Whisper-quiet track number & time digits */}
        <div className="flex items-center gap-2 text-[10px] font-mono tabular-nums text-white/40 tracking-wider flex-shrink-0">
          {totalTracks != null && currentIndex != null ? (
            <>
              <span className="text-white/60 font-medium">
                {String(currentIndex + 1).padStart(2, '0')}/{String(totalTracks).padStart(2, '0')}
              </span>
              <span className="opacity-30">•</span>
            </>
          ) : null}
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>
    </div>
  )
}
