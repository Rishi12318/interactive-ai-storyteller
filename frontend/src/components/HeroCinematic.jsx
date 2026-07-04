import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BOOK_IMAGE = 'https://i.pinimg.com/736x/f3/e5/8c/f3e58c770155cc14bd469a7c3f03546f.jpg'

const SCENE_IMAGES = [
  'https://i.ibb.co/svyRC0VP/89d3ae3c-a0c7-4911-98a0-ea950b5ab4fc.png',
  'https://i.ibb.co/GfY5j3Wn/7d0a82bb-98b1-48c9-91c5-f2db14470ad5.png',
  'https://i.ibb.co/v6BNbgsY/8946f5aa-16e8-4fb3-8b9e-55062e7e5e47.png',
  'https://i.ibb.co/7Nr0r1t1/0636f183-790d-4e5e-86bf-e071f266e52c.png',
  'https://i.ibb.co/CK1WH2vX/fcbde96a-5638-465d-a280-297b874e6670.png',
  'https://i.ibb.co/fdC7L7KQ/b8d83935-b643-4e4c-b0d0-2c81cdc53ff2.png',
]

const SCENES = [
  { id: 'stairs', start: 0.15, end: 0.33, idx: 0, fog: 'rgba(60,90,40,0.15)', warmth: 0.9 },
  { id: 'palace', start: 0.33, end: 0.50, idx: 1, fog: 'rgba(80,70,50,0.10)', warmth: 1.0 },
  { id: 'mystery', start: 0.50, end: 0.65, idx: 2, fog: 'rgba(30,40,60,0.20)', warmth: 0.5 },
  { id: 'horror', start: 0.65, end: 0.78, idx: 3, fog: 'rgba(10,10,15,0.35)', warmth: 0.2 },
  { id: 'wedding', start: 0.78, end: 0.90, idx: 4, fog: 'rgba(90,60,30,0.12)', warmth: 1.0 },
  { id: 'library', start: 0.90, end: 1.0, idx: 5, fog: 'rgba(40,30,20,0.18)', warmth: 0.6 },
]

function getActiveScene(progress) {
  for (const s of SCENES) {
    if (progress >= s.start && progress < s.end) return s
  }
  if (progress >= 1) return SCENES[SCENES.length - 1]
  return null
}

function getBlend(progress, scene) {
  if (!scene) return 0
  const range = scene.end - scene.start
  if (range === 0) return 1
  return Math.min((progress - scene.start) / range, 1)
}

function SceneLayer({ src, progress, scene }) {
  if (!scene) return null
  const blend = getBlend(progress, scene)
  const fadeIn = Math.min(blend * 3, 1)
  const fadeOut = 1 - Math.max(0, (progress - scene.end + 0.04) / 0.04)
  const opacity = Math.max(0, Math.min(fadeIn, fadeOut))

  return (
    <div className="absolute inset-0" style={{
      opacity,
      transition: 'opacity 0.15s linear',
      pointerEvents: 'none',
    }}>
      <img src={src} alt="" className="w-full h-full object-cover" />
    </div>
  )
}

function Atmosphere({ progress }) {
  const scene = getActiveScene(progress)
  const fogOpacity = scene ? Math.min(getBlend(progress, scene) * 0.6 + 0.1, 0.5) : 0
  const vignette = Math.min(progress * 0.5, 0.4)

  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: scene ? scene.fog : 'transparent',
        opacity: fogOpacity,
        transition: 'background 0.3s',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,${vignette}) 100%)`,
      }} />
    </>
  )
}

export default function HeroCinematic() {
  const navigate = useNavigate()
  const progressRef = useRef(0)
  const targetRef = useRef(0)
  const [display, setDisplay] = useState(0)
  const [showCTA, setShowCTA] = useState(false)
  const rafRef = useRef(null)
  const containerRef = useRef(null)
  const touchRef = useRef(null)
  const isLocked = useRef(true)

  useEffect(() => {
    const tick = () => {
      progressRef.current += (targetRef.current - progressRef.current) * 0.1
      if (Math.abs(progressRef.current - targetRef.current) < 0.001) {
        progressRef.current = targetRef.current
      }
      const val = Math.min(Math.max(progressRef.current, 0), 1)
      setDisplay(val)
      if (val >= 1) setShowCTA(true)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  useEffect(() => {
    const clamp = (v) => Math.min(Math.max(v, 0), 1)
    const el = containerRef.current
    if (!el) return

    const onWheel = (e) => {
      if (!isLocked.current) return
      e.preventDefault()
      targetRef.current = clamp(targetRef.current + (e.deltaY > 0 ? 0.02 : -0.02))
    }

    const onTouchStart = (e) => {
      if (!isLocked.current) return
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        touchRef.current = Math.sqrt(dx * dx + dy * dy)
      }
    }

    const onTouchMove = (e) => {
      if (!isLocked.current) return
      if (e.touches.length === 2 && touchRef.current) {
        e.preventDefault()
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        targetRef.current = clamp(targetRef.current + (dist - touchRef.current) * 0.004)
        touchRef.current = dist
      }
    }

    const onKey = (e) => {
      if (e.key === '+' || e.key === '=') targetRef.current = clamp(targetRef.current + 0.05)
      if (e.key === '-') targetRef.current = clamp(targetRef.current - 0.05)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (showCTA) {
      const t = setTimeout(() => { isLocked.current = false }, 2000)
      return () => clearTimeout(t)
    }
  }, [showCTA])

  const bookOpacity = Math.max(0, 1 - display * 8)
  const showHint = display < 0.05

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden"
      style={{ height: '100vh', minHeight: '700px', background: '#1a1a2e', cursor: 'grab' }}>

      <div className="absolute inset-0" style={{ opacity: bookOpacity, transition: 'opacity 0.3s linear' }}>
        <img src={BOOK_IMAGE} alt="" className="w-full h-full object-cover" />
      </div>

      {SCENES.map((s) => (
        <SceneLayer key={s.id} src={SCENE_IMAGES[s.idx]} progress={display} scene={s} />
      ))}

      <Atmosphere progress={display} />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4"
        style={{ opacity: display > 0 ? 0.6 : 0, transition: 'opacity 0.5s' }}>
        <button onClick={() => { targetRef.current = Math.max(targetRef.current - 0.05, 0) }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)' }} aria-label="Zoom out">−</button>
        <div className="w-32 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div className="h-full rounded-full" style={{ width: `${display * 100}%`, background: 'linear-gradient(90deg, #d4a017, #ffd700)', transition: 'width 0.1s' }} />
        </div>
        <button onClick={() => { targetRef.current = Math.min(targetRef.current + 0.05, 1) }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)' }} aria-label="Zoom in">+</button>
      </div>

      {showHint && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 text-center">
          <p className="text-white/70 text-sm tracking-widest uppercase" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Scroll forward to explore
          </p>
        </div>
      )}

      {showCTA && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ animation: 'ctaIn 1.5s ease forwards' }}>
          <div className="text-center px-6">
            <h2 className="text-4xl md:text-5xl font-serif mb-4" style={{
              color: '#f5e0b5',
              textShadow: '0 4px 20px rgba(0,0,0,0.6)',
            }}>
              Your Story Awaits
            </h2>
            <p className="text-lg mb-8 max-w-md mx-auto" style={{
              color: 'rgba(245,224,181,0.7)',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}>
              Step into a world of magic, mystery, and endless possibilities.
            </p>
            <button onClick={() => navigate('/signin')}
              className="px-10 py-4 rounded-lg text-lg font-medium tracking-wide transition-all duration-500 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #d4a017, #ffd700)',
                color: '#1a1a2e',
                boxShadow: '0 4px 20px rgba(212,160,23,0.3)',
              }}>
              Begin Your Journey
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ctaIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  )
}
