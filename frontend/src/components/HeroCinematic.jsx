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
  { id: 'stairs', start: 0.15, end: 0.33, idx: 0, bg: '#d4c9b8' },
  { id: 'palace', start: 0.33, end: 0.50, idx: 1, bg: '#d4c4b0' },
  { id: 'mystery', start: 0.50, end: 0.65, idx: 2, bg: '#c4b8c8' },
  { id: 'horror', start: 0.65, end: 0.78, idx: 3, bg: '#a898a0' },
  { id: 'wedding', start: 0.78, end: 0.90, idx: 4, bg: '#e0c8b8' },
  { id: 'library', start: 0.90, end: 1.0, idx: 5, bg: '#c8b8a8' },
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

  const fadeIn = Math.min(blend * 2.5, 1)
  const fadeOut = 1 - Math.max(0, (progress - scene.end + 0.05) / 0.05)
  const opacity = Math.max(0, Math.min(fadeIn, fadeOut))

  const zoom = 1 + blend * 0.06

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{
      opacity,
      transition: 'opacity 0.1s linear',
      pointerEvents: 'none',
      background: scene.bg,
    }}>
      <img src={src} alt="" className="max-w-full max-h-full" style={{
        transform: `scale(${zoom})`,
        transition: 'transform 0.1s linear',
        objectFit: 'contain',
        filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.15))',
      }} />
    </div>
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
      progressRef.current += (targetRef.current - progressRef.current) * 0.08
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

  const activeScene = getActiveScene(display)
  const sceneBg = activeScene ? activeScene.bg : '#e8ddd0'
  const bookOpacity = Math.max(0, 1 - display * 8)

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden"
      style={{ height: '100vh', minHeight: '700px', background: sceneBg, cursor: 'grab', transition: 'background 0.4s ease' }}>

      <div className="absolute inset-0 flex items-center justify-center" style={{
        background: '#e8ddd0',
        opacity: bookOpacity,
        transition: 'opacity 0.3s linear',
      }}>
        <img src={BOOK_IMAGE} alt="" className="max-w-full max-h-full" style={{
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.12))',
        }} />
      </div>

      {SCENES.map((s) => (
        <SceneLayer key={s.id} src={SCENE_IMAGES[s.idx]} progress={display} scene={s} />
      ))}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4"
        style={{ opacity: display > 0 ? 0.6 : 0, transition: 'opacity 0.5s' }}>
        <button onClick={() => { targetRef.current = Math.max(targetRef.current - 0.05, 0) }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all"
          style={{ background: 'rgba(200,180,160,0.3)', color: '#7a6a5a', backdropFilter: 'blur(4px)' }} aria-label="Zoom out">−</button>
        <div className="w-32 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(200,180,160,0.3)' }}>
          <div className="h-full rounded-full" style={{ width: `${display * 100}%`, background: 'linear-gradient(90deg, #c4a882, #d4b896)', transition: 'width 0.1s' }} />
        </div>
        <button onClick={() => { targetRef.current = Math.min(targetRef.current + 0.05, 1) }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all"
          style={{ background: 'rgba(200,180,160,0.3)', color: '#7a6a5a', backdropFilter: 'blur(4px)' }} aria-label="Zoom in">+</button>
      </div>

      {display < 0.02 && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 text-center">
          <p className="text-sm tracking-widest uppercase" style={{ color: '#8a7a6a' }}>
            Scroll forward
          </p>
        </div>
      )}

      {showCTA && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ animation: 'ctaIn 1.5s ease forwards', background: 'rgba(232,221,208,0.85)' }}>
          <div className="text-center px-6">
            <h2 className="text-4xl md:text-5xl font-serif mb-4" style={{ color: '#6a5a4a' }}>
              Your Story Awaits
            </h2>
            <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: '#8a7a6a' }}>
              Step into a world of magic, mystery, and endless possibilities.
            </p>
            <button onClick={() => navigate('/signin')}
              className="px-10 py-4 rounded-lg text-lg font-medium tracking-wide transition-all duration-500 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #d4c0a8, #c4b098)',
                color: '#5a4a3a',
                boxShadow: '0 4px 16px rgba(180,160,140,0.3)',
              }}>
              Begin Your Journey
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes ctaIn{0%{opacity:0;transform:scale(0.95)}100%{opacity:1;transform:scale(1)}}`}</style>
    </section>
  )
}
