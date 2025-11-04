import { useState, useMemo, type PointerEvent } from 'react'
import { cn } from '@/lib/utils'

type PointerState = {
  x: number
  y: number
}

export function HeroInteractiveScene() {
  const [pointer, setPointer] = useState<PointerState>({ x: 0, y: 0 })

  const mapTransform = useMemo(
    () => `translate3d(${-pointer.x * 15}px, ${-pointer.y * 10}px, 0) scale(1.02)`,
    [pointer]
  )

  const carTransform = useMemo(
    () =>
      `translate3d(${pointer.x * 20}px, ${pointer.y * 15}px, 0) rotate(${pointer.x * 3}deg)`,
    [pointer]
  )

  const shadowTransform = useMemo(
    () => `translate3d(${pointer.x * 10}px, ${pointer.y * 5}px, 0) scale(1.02)`,
    [pointer]
  )

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    setPointer({
      x: Math.min(Math.max((x - 0.5) * 2, -1), 1),
      y: Math.min(Math.max((y - 0.5) * 2, -1), 1),
    })
  }

  const handlePointerLeave = () => {
    setPointer({ x: 0, y: 0 })
  }

  return (
    <div
      className="relative h-[500px] rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden border border-emerald-200 shadow-xl"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: mapTransform,
          background:
            'radial-gradient(circle at 30% 20%, rgba(34,197,94,0.35), transparent 55%), radial-gradient(circle at 70% 40%, rgba(16,185,129,0.35), transparent 60%), radial-gradient(circle at 50% 85%, rgba(5,150,105,0.45), transparent 55%)',
        }}
      />

      <div
        className="absolute left-1/2 top-1/2 h-40 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl bg-emerald-500/30 transition-transform duration-300 ease-out"
        style={{ transform: shadowTransform }}
      />

      <div
        className={cn(
          'absolute left-1/2 top-1/2 h-32 w-48 -translate-x-1/2 -translate-y-1/2 rounded-[32px] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-2xl flex items-center justify-center transition-transform duration-300 ease-out'
        )}
        style={{ transform: carTransform }}
      >
        <div className="absolute top-4 left-6 right-6 h-2 rounded-full bg-white/60" />
        <div className="absolute bottom-6 left-8 flex gap-6">
          <div className="h-5 w-5 rounded-full bg-black border-2 border-gray-700 shadow-inner" />
          <div className="h-5 w-5 rounded-full bg-black border-2 border-gray-700 shadow-inner" />
        </div>
        <div className="absolute bottom-6 right-8 flex gap-6">
          <div className="h-5 w-5 rounded-full bg-black border-2 border-gray-700 shadow-inner" />
          <div className="h-5 w-5 rounded-full bg-black border-2 border-gray-700 shadow-inner" />
        </div>
        <div className="absolute inset-x-10 bottom-10 h-2 rounded-full bg-white/80" />
        <div className="absolute inset-x-12 top-6 h-4 rounded-full bg-white/40" />
        <div className="absolute top-1/2 -left-8 h-3 w-20 rounded-full bg-emerald-400/40 blur-sm" />
        <div className="absolute top-1/2 -right-8 h-3 w-20 rounded-full bg-emerald-400/40 blur-sm" />
        <div className="absolute inset-0 rounded-[32px] border border-white/10" />
      </div>

    </div>
  )
}
