import { useRef, useState, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import { useNavigate } from 'react-router-dom'

const SCENES = [
  { id: 1, name: 'The Village', image: 'https://i.ibb.co/6ZSKhXLV/scene1.jpg' },
  { id: 2, name: 'The Forest Path', image: 'https://i.ibb.co/VcgHBjbB/scene2.jpg' },
  { id: 3, name: 'The Settlement', image: 'https://i.ibb.co/7Q9jLYvm/scene3.jpg' },
  { id: 4, name: 'The Pass', image: 'https://i.ibb.co/VQSz7ZbR/scene4.jpg' },
  { id: 5, name: 'The Crossing', image: 'https://i.ibb.co/H4y9051/scene5.jpg' },
  { id: 6, name: 'The Camp', image: 'https://i.ibb.co/d0L9nhZ3/scene6.jpg' },
  { id: 7, name: 'The Ravine', image: 'https://i.ibb.co/V0KG13Bz/scene7.jpg' },
  { id: 8, name: 'The Summit', image: 'https://i.ibb.co/vwXPhTz0/scene8.jpg' },
  { id: 9, name: 'The Sanctum', image: 'https://i.ibb.co/LhZG8kPq/scene9.jpg' },
]

const STORY_TEMPLATES = [
  'The wind carries whispers of an ancient tale as you step into {name}. Shadows dance at the edge of your vision, and the ground beneath feels alive with memory.',
  'A strange silence hangs over {name}. The air is thick with stories untold, each corner holding a secret waiting to be uncovered by the brave.',
  '{name} greets you with an eerie calm. Yet beneath the surface, something stirs. The path ahead is uncertain, but the call of adventure is undeniable.',
  'As you arrive at {name}, a sense of wonder washes over you. This place has witnessed ages pass, and now it awaits your story.',
  'The journey brings you to {name}. Here, the boundary between worlds feels thin. Every step resonates with the footsteps of those who came before.',
]

const INTERACT_TEMPLATES = [
  { label: 'Examine the surroundings', outcome: 'You notice intricate markings etched into the stone, glowing faintly in the dim light.' },
  { label: 'Listen to the wind', outcome: 'The wind carries fragmented voices, speaking in a tongue older than the mountains.' },
  { label: 'Search for a path forward', outcome: 'You find a narrow trail veiled by overgrowth, leading deeper into the unknown.' },
  { label: 'Call out into the silence', outcome: 'Your voice echoes, answered by a distant, melodic sound that fades as quickly as it came.' },
  { label: 'Touch the ancient stone', outcome: 'A warm pulse reverberates through your fingertips. The stone remembers.' },
]

const CARD_VARIANTS = [
  { border: 'rgba(200,180,160,0.3)', bg: 'rgba(232,221,208,0.92)', accent: '#b8a48c' },
  { border: 'rgba(180,200,180,0.3)', bg: 'rgba(220,230,215,0.92)', accent: '#8ca88c' },
  { border: 'rgba(200,180,200,0.3)', bg: 'rgba(230,220,230,0.92)', accent: '#a88ca8' },
]

function FilmGrain() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    let frame
    const draw = () => {
      c.width = window.innerWidth
      c.height = window.innerHeight
      const imageData = ctx.createImageData(c.width, c.height)
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 35
        imageData.data[i] = v
        imageData.data[i + 1] = v
        imageData.data[i + 2] = v
        imageData.data[i + 3] = 6
      }
      ctx.putImageData(imageData, 0, 0)
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-40 mix-blend-overlay" />
}

function Vignette() {
  return (
    <div className="absolute inset-0 pointer-events-none z-25" style={{
      background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)',
    }} />
  )
}

export default function HeroCinematic() {
  const navigate = useNavigate()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [nextIdx, setNextIdx] = useState(null)
  const [showCard, setShowCard] = useState(false)
  const [activePanel, setActivePanel] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [branches, setBranches] = useState([])
  const [narrativeText, setNarrativeText] = useState('')
  const [showCTA, setShowCTA] = useState(false)

  const containerRef = useRef(null)
  const cardRef = useRef(null)
  const letterTopRef = useRef(null)
  const letterBottomRef = useRef(null)

  const currentScene = SCENES[currentIdx]

  const generateBranches = useCallback((idx) => {
    const scene = SCENES[idx]
    const shuffled = [...INTERACT_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 2)
    return shuffled.map(t => ({
      ...t,
      label: t.label.replace('{name}', scene.name),
      outcome: t.outcome.replace('{name}', scene.name),
    }))
  }, [])

  const generateStory = useCallback((idx) => {
    const scene = SCENES[idx]
    const template = STORY_TEMPLATES[idx % STORY_TEMPLATES.length]
    return template.replace(/{name}/g, scene.name)
  }, [])

  const transitionToScene = useCallback((next) => {
    if (isTransitioning || next === currentIdx) return
    setActivePanel(null)
    setShowCard(false)
    setIsTransitioning(true)
    setNextIdx(next)

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentIdx(next)
        setNextIdx(null)
        setIsTransitioning(false)
        setBranches(generateBranches(next))
        setNarrativeText(generateStory(next))
        setTimeout(() => setShowCard(true), 100)
      }
    })

    tl.to(letterTopRef.current, { height: '6vh', duration: 0.35, ease: 'power2.in' })
    tl.to(letterBottomRef.current, { height: '6vh', duration: 0.35, ease: 'power2.in' }, '<')
    tl.to(containerRef.current, { scale: 1.02, filter: 'brightness(0.6)', duration: 0.35, ease: 'power2.in' }, '<')
    tl.to('#current-bg', { scale: 1.1, opacity: 0, duration: 0.4, ease: 'power2.in' }, '-=0.15')
    tl.fromTo('#next-bg', { opacity: 0, scale: 1.2, filter: 'blur(8px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }, '-=0.1')
    tl.to(letterTopRef.current, { height: '0vh', duration: 0.4, ease: 'power2.out' })
    tl.to(letterBottomRef.current, { height: '0vh', duration: 0.4, ease: 'power2.out' }, '<')
    tl.to(containerRef.current, { scale: 1, filter: 'brightness(1)', duration: 0.4, ease: 'power2.out' }, '<')
  }, [currentIdx, isTransitioning, generateBranches, generateStory])

  const handleCardClick = useCallback(() => {
    if (!showCard && !isTransitioning) {
      setBranches(generateBranches(currentIdx))
      setNarrativeText(generateStory(currentIdx))
      setShowCard(true)
    }
  }, [showCard, isTransitioning, currentIdx, generateBranches, generateStory])

  const handleMove = useCallback(() => {
    if (currentIdx < SCENES.length - 1) {
      transitionToScene(currentIdx + 1)
    } else {
      setShowCTA(true)
      gsap.to('#cta-overlay', { opacity: 1, duration: 1, ease: 'power2.out' })
    }
  }, [currentIdx, transitionToScene])

  const handleStory = useCallback(() => {
    setActivePanel(activePanel === 'story' ? null : 'story')
  }, [activePanel])

  const handleInteract = useCallback(() => {
    setActivePanel(activePanel === 'interact' ? null : 'interact')
  }, [activePanel])

  useEffect(() => {
    if (cardRef.current && showCard) {
      gsap.fromTo(cardRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      )
    }
  }, [showCard])

  useEffect(() => {
    setBranches(generateBranches(0))
    setNarrativeText(generateStory(0))
    const timer = setTimeout(() => setShowCard(true), 800)
    return () => clearTimeout(timer)
  }, [generateBranches, generateStory])

  const variant = CARD_VARIANTS[currentIdx % CARD_VARIANTS.length]
  const isLast = currentIdx === SCENES.length - 1

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden"
      style={{ height: '100vh', minHeight: '700px', background: '#1a1410', cursor: showCard ? 'default' : 'pointer' }}
      onClick={!showCard && !isTransitioning ? handleCardClick : undefined}>

      {SCENES.map((scene, i) => (
        <div key={scene.id} id={i === currentIdx ? 'current-bg' : i === nextIdx ? 'next-bg' : undefined}
          className="absolute inset-0 z-0" style={{ opacity: i === currentIdx ? 1 : 0, zIndex: i === currentIdx ? 1 : 0 }}>
          <img src={scene.image} alt="" className="w-full h-full object-cover" draggable={false}
            style={{ filter: i === currentIdx ? 'none' : 'blur(8px)' }} />
        </div>
      ))}

      <div className="absolute inset-0 z-2" style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)',
      }} />

      <Vignette />
      <FilmGrain />

      <div ref={letterTopRef} className="absolute top-0 left-0 right-0 pointer-events-none z-50" style={{ height: '0vh', background: '#000' }} />
      <div ref={letterBottomRef} className="absolute bottom-0 left-0 right-0 pointer-events-none z-50" style={{ height: '0vh', background: '#000' }} />

      <div className="absolute top-6 left-6 z-30 flex items-center gap-3">
        <div className="flex gap-1.5">
          {SCENES.map((_, i) => (
            <div key={i} className="w-8 h-0.5 rounded-full transition-all duration-500"
              style={{
                background: i <= currentIdx ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
                width: i === currentIdx ? '20px' : '8px',
              }} />
          ))}
        </div>
        <span className="text-xs tracking-widest ml-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {String(currentIdx + 1).padStart(2, '0')}/{String(SCENES.length).padStart(2, '0')}
        </span>
      </div>

      <div className="absolute bottom-[25vh] left-0 right-0 z-30 flex flex-col items-center pointer-events-none"
        style={{ opacity: showCard ? 0 : 0.6, transition: 'opacity 0.8s ease' }}>
        <p className="text-xs tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Click to explore
        </p>
        <div className="mt-3 w-4 h-4 border-r-2 border-b-2 rotate-45"
          style={{ borderColor: 'rgba(255,255,255,0.3)', animation: 'walkBounce 2s ease-in-out infinite' }} />
      </div>

      <div ref={cardRef} className="absolute left-0 right-0 z-30 px-6"
        style={{ bottom: showCard ? '5vh' : '-40vh', opacity: 0, transition: 'none', pointerEvents: showCard ? 'auto' : 'none' }}>
        <div className="max-w-lg mx-auto rounded-2xl overflow-hidden backdrop-blur-sm"
          style={{
            background: variant.bg,
            border: `1px solid ${variant.border}`,
            boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}>
          <div className="px-7 pt-7 pb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: variant.accent }}>
                Chapter {currentIdx + 1}
              </span>
              <div className="flex-1 h-px" style={{ background: variant.border }} />
            </div>
            <h2 className="text-2xl font-serif mb-2" style={{ color: '#4a3a2a' }}>
              {currentScene.name}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#7a6a5a' }}>
              {narrativeText}
            </p>
          </div>

          <div className="flex border-t" style={{ borderColor: variant.border }}>
            <button onClick={handleStory}
              className="flex-1 py-3.5 text-sm font-medium tracking-wide transition-all duration-300 hover:brightness-95"
              style={{ color: variant.accent, background: activePanel === 'story' ? 'rgba(0,0,0,0.04)' : 'transparent' }}>
              Story
            </button>
            <button onClick={handleInteract}
              className="flex-1 py-3.5 text-sm font-medium tracking-wide transition-all duration-300 hover:brightness-95"
              style={{ color: variant.accent, borderLeft: `1px solid ${variant.border}`, borderRight: `1px solid ${variant.border}`, background: activePanel === 'interact' ? 'rgba(0,0,0,0.04)' : 'transparent' }}>
              Interact
            </button>
            <button onClick={handleMove}
              className="flex-1 py-3.5 text-sm font-medium tracking-wide transition-all duration-300"
              style={{ color: '#fff', background: isLast ? 'linear-gradient(135deg, #c4a88a, #b89878)' : 'linear-gradient(135deg, #8a7a6a, #6a5a4a)' }}>
              {isLast ? 'Complete' : 'Move'}
            </button>
          </div>
        </div>
      </div>

      <div className="absolute left-0 right-0 z-20 px-6 pointer-events-none"
        style={{ bottom: 'calc(5vh + 180px)' }}>
        {activePanel === 'story' && (
          <div className="max-w-lg mx-auto rounded-xl p-5 backdrop-blur-md"
            style={{ background: 'rgba(232,221,208,0.93)', border: '1px solid rgba(200,180,160,0.3)', animation: 'panelSlide 0.4s ease' }}>
            <p className="text-sm leading-relaxed" style={{ color: '#5a4a3a' }}>
              {narrativeText}
            </p>
            <p className="text-xs mt-4 italic" style={{ color: '#9a8a7a' }}>
              The story unfolds with every step you take...
            </p>
          </div>
        )}

        {activePanel === 'interact' && (
          <div className="max-w-lg mx-auto rounded-xl overflow-hidden"
            style={{ background: 'rgba(220,230,215,0.93)', border: '1px solid rgba(180,200,180,0.3)', animation: 'panelSlide 0.4s ease' }}>
            {branches.map((branch, i) => (
              <button key={i} onClick={() => {
                gsap.to(`#branch-${i}-outcome`, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
              }}
                className="w-full text-left px-5 py-4 text-sm transition-all duration-300 hover:brightness-95"
                style={{ borderBottom: i < branches.length - 1 ? '1px solid rgba(180,200,180,0.3)' : 'none', color: '#4a5a3a' }}>
                <span className="block font-medium">{branch.label}</span>
                <span id={`branch-${i}-outcome`} className="block text-xs mt-1" style={{ color: '#7a9a7a', opacity: 0, transform: 'translateY(8px)' }}>
                  {branch.outcome}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {showCTA && (
        <div id="cta-overlay" className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ opacity: 0, background: 'rgba(26,20,16,0.85)' }}>
          <div className="text-center px-6">
            <h2 className="text-4xl md:text-5xl font-serif mb-3" style={{ color: '#e8ddd0', opacity: 0, animation: 'fadeUp 1s ease 0.5s forwards' }}>
              The Journey Ends...
            </h2>
            <p className="text-base mb-8 max-w-md mx-auto" style={{ color: '#a89880', opacity: 0, animation: 'fadeUp 1s ease 0.8s forwards' }}>
              A new story awaits. What will your next adventure be?
            </p>
            <button onClick={() => navigate('/signin')}
              className="px-10 py-3.5 rounded-xl text-base font-medium tracking-wide transition-all duration-500 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #8a7a6a, #6a5a4a)', color: '#f0e4d0', opacity: 0, animation: 'fadeUp 1s ease 1.1s forwards' }}>
              Begin Again
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes walkBounce{0%,100%{transform:rotate(45deg) translateY(0)}50%{transform:rotate(45deg) translateY(-6px)}}
        @keyframes panelSlide{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
      `}</style>
    </section>
  )
}
