import React, { useRef, useState, useCallback } from 'react'
import { Play, Pause, Volume2, Volume1, VolumeX } from 'lucide-react'

interface MinimalPlayerProps {
  isPlaying: boolean
  onTogglePlay: () => void
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  currentIndex?: number
  totalTracks?: number
  volume: number
  onVolumeChange: (vol: number) => void
  isMuted: boolean
  onToggleMute: () => void
}

export const MinimalPlayer: React.FC<MinimalPlayerProps> = ({
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  currentIndex,
  totalTracks,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const volumeBarRef = useRef<HTMLDivElement>(null)
  const [isDraggingVol, setIsDraggingVol] = useState(false)
  const [showVolTooltip, setShowVolTooltip] = useState(false)

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const effectiveVolume = isMuted ? 0 : volume
  const volumePercent = effectiveVolume * 100

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newPercent = Math.max(0, Math.min(1, clickX / rect.width))
    onSeek(newPercent * duration)
  }

  // Calculate volume from pointer position
  const updateVolumeFromPointer = useCallback(
    (clientX: number) => {
      if (!volumeBarRef.current) return
      const rect = volumeBarRef.current.getBoundingClientRect()
      const relativeX = clientX - rect.left
      const newVol = Math.max(0, Math.min(1, relativeX / rect.width))
      onVolumeChange(newVol)
    },
    [onVolumeChange]
  )

  const handleVolPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingVol(true)
    setShowVolTooltip(true)
    volumeBarRef.current?.setPointerCapture(e.pointerId)
    updateVolumeFromPointer(e.clientX)
  }

  const handleVolPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingVol) return
    updateVolumeFromPointer(e.clientX)
  }

  const handleVolPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingVol) return
    setIsDraggingVol(false)
    setShowVolTooltip(false)
    try {
      volumeBarRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      // Ignore if pointer capture release throws
    }
  }

  const handleVolWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const delta = e.deltaY < 0 ? 0.05 : -0.05
    onVolumeChange(Math.max(0, Math.min(1, effectiveVolume + delta)))
  }

  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.5 ? Volume1 : Volume2

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex items-center justify-center pointer-events-auto px-4 sm:px-6">
      {/* Ultra-minimal floating control: Play/Pause + Progress Line + Track Count/Time + Audio Modifier */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 w-full max-w-sm sm:max-w-md select-none">
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
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] font-mono tabular-nums text-white/40 tracking-wider flex-shrink-0">
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

        {/* Audio Modifier: Sleek Volume Control */}
        <div
          className="relative flex items-center gap-1 sm:gap-1.5 flex-shrink-0 group/vol"
          onMouseEnter={() => setShowVolTooltip(true)}
          onMouseLeave={() => !isDraggingVol && setShowVolTooltip(false)}
          onWheel={handleVolWheel}
        >
          {/* Volume Mute/Unmute Toggle Button */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="text-white/50 hover:text-white transition-colors active:scale-90 p-0.5 cursor-pointer focus:outline-none"
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          >
            <VolumeIcon className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Minimal Volume Slider Rail */}
          <div
            ref={volumeBarRef}
            onPointerDown={handleVolPointerDown}
            onPointerMove={handleVolPointerMove}
            onPointerUp={handleVolPointerUp}
            onPointerCancel={handleVolPointerUp}
            className="group/rail relative h-5 w-10 sm:w-14 flex items-center cursor-pointer touch-none"
            title="Adjust volume (Scroll or drag)"
          >
            {/* Rail Background */}
            <div className="w-full h-[2.5px] bg-white/20 rounded-full overflow-hidden transition-all group-hover/rail:h-[3.5px]">
              {/* White Volume Level Fill */}
              <div
                className="h-full bg-white/70 group-hover/vol:bg-white rounded-full transition-all duration-75"
                style={{ width: `${volumePercent}%` }}
              />
            </div>
          </div>

          {/* Minimal Vol Percentage Tooltip on Hover / Drag */}
          {showVolTooltip ? (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#16161a]/95 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white/80 tabular-nums shadow-lg pointer-events-none whitespace-nowrap">
              {Math.round(volumePercent)}%
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
