import { useRef, useEffect, useState, useCallback, Suspense, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { TextureLoader } from 'three'
import * as THREE from 'three'
import { gsap } from 'gsap'

const SCENE_IMAGES = [
  'https://i.ibb.co/svyRC0VP/89d3ae3c-a0c7-4911-98a0-ea950b5ab4fc.png',
  'https://i.ibb.co/GfY5j3Wn/7d0a82bb-98b1-48c9-91c5-f2db14470ad5.png',
  'https://i.ibb.co/v6BNbgsY/8946f5aa-16e8-4fb3-8b9e-55062e7e5e47.png',
  'https://i.ibb.co/7Nr0r1t1/0636f183-790d-4e5e-86bf-e071f266e52c.png',
  'https://i.ibb.co/CK1WH2vX/fcbde96a-5638-465d-a280-297b874e6670.png',
  'https://i.ibb.co/fdC7L7KQ/b8d83935-b643-4e4c-b0d0-2c81cdc53ff2.png',
]

const SCENES = [
  { id: 'stairs', start: 0.25, end: 0.38, idx: 0, fog: 'rgba(60,90,40,0.15)', warmth: 0.9 },
  { id: 'palace', start: 0.38, end: 0.52, idx: 1, fog: 'rgba(80,70,50,0.10)', warmth: 1.0 },
  { id: 'mystery', start: 0.52, end: 0.64, idx: 2, fog: 'rgba(30,40,60,0.20)', warmth: 0.5 },
  { id: 'horror', start: 0.64, end: 0.76, idx: 3, fog: 'rgba(10,10,15,0.35)', warmth: 0.2 },
  { id: 'wedding', start: 0.76, end: 0.88, idx: 4, fog: 'rgba(90,60,30,0.12)', warmth: 1.0 },
  { id: 'library', start: 0.88, end: 1.0, idx: 5, fog: 'rgba(40,30,20,0.18)', warmth: 0.6 },
]

function Model3D({ onBoundsReady }) {
  const obj = useLoader(OBJLoader, '/model/model.obj')
  const texture = useLoader(TextureLoader, '/model/diffuse_0.png')
  const groupRef = useRef()
  const applied = useRef(false)

  useEffect(() => {
    if (obj && texture && !applied.current) {
      texture.colorSpace = THREE.SRGBColorSpace
      const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.25, metalness: 0.05 })
      obj.traverse((child) => {
        if (child.isMesh) { child.material = material; child.castShadow = true; child.receiveShadow = true }
      })
      obj.updateMatrixWorld(true)
      const box = new THREE.Box3().setFromObject(obj)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const sphere = box.getBoundingSphere(new THREE.Sphere())
      obj.position.sub(center)
      applied.current = true
      if (onBoundsReady) onBoundsReady({ radius: sphere.radius, height: size.y })
    }
  }, [obj, texture, onBoundsReady])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * Math.PI / 3) * 0.02
    }
  })

  return <group ref={groupRef}><primitive object={obj} /></group>
}

function GroundShadow({ radius }) {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128; c.height = 128
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(0,0,0,0.18)')
    g.addColorStop(0.4, 'rgba(0,0,0,0.10)')
    g.addColorStop(0.7, 'rgba(0,0,0,0.04)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128)
    return c
  }, [])
  const s = radius ? radius * 0.8 : 1.5
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -(radius ? radius * 0.45 : 1.8), 0]}>
      <planeGeometry args={[s * 2.5, s * 1.8]} />
      <meshBasicMaterial transparent opacity={0.85} map={new THREE.CanvasTexture(canvas)} depthWrite={false} />
    </mesh>
  )
}

function CameraController({ bounds, zoomProgress }) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3())

  useEffect(() => {
    if (!bounds) return
    const fovRad = camera.fov * Math.PI / 180
    const fill = window.innerWidth < 768 ? 5.79 : window.innerWidth < 1024 ? 7.09 : 8.14
    const baseDist = bounds.height / (fill * 2 * Math.tan(fovRad / 2))
    const startPos = new THREE.Vector3(0, bounds.height * 0.08, baseDist)
    const endPos = new THREE.Vector3(0, bounds.height * 0.02, baseDist * 0.15)
    targetPos.current.lerpVectors(startPos, endPos, zoomProgress.current / 0.25)
    camera.position.lerp(targetPos.current, 0.05)
    camera.lookAt(0, -bounds.height * 0.06, 0)
  }, [bounds, camera])

  useFrame(() => {
    if (!bounds) return
    const fovRad = camera.fov * Math.PI / 180
    const fill = window.innerWidth < 768 ? 5.79 : window.innerWidth < 1024 ? 7.09 : 8.14
    const baseDist = bounds.height / (fill * 2 * Math.tan(fovRad / 2))
    const t = Math.min(zoomProgress.current / 0.25, 1)
    const startPos = new THREE.Vector3(0, bounds.height * 0.08, baseDist)
    const endPos = new THREE.Vector3(0, bounds.height * 0.02, baseDist * 0.15)
    targetPos.current.lerpVectors(startPos, endPos, t)
    camera.position.lerp(targetPos.current, 0.05)
    camera.lookAt(0, -bounds.height * 0.06, 0)
  })

  const az = 60 * Math.PI / 180
  return (
    <OrbitControls enableZoom={false} enablePan={false} enableRotate={false}
      minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2}
      minAzimuthAngle={-az} maxAzimuthAngle={az}
      rotateSpeed={0} dampingFactor={0.08} enableDamping={true} />
  )
}

function ModelScene({ bounds, onBoundsReady, zoomProgress }) {
  return (
    <Canvas style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'transparent' }}
      gl={{ alpha: true }}
      onCreated={({ gl, scene }) => { gl.setClearColor(0x000000, 0); scene.background = null }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 4, 5]} intensity={2.2} color="#ffd700" />
      <directionalLight position={[-3, 2, 3]} intensity={1.0} color="#87CEEB" />
      <directionalLight position={[-3, 4, -2]} intensity={1.0} color="#ffe4b5" />
      <hemisphereLight args={['#ffe4b5', '#3e2723', 0.3]} />
      <Suspense fallback={null}>
        <Model3D onBoundsReady={onBoundsReady} />
        <GroundShadow radius={bounds?.radius} />
      </Suspense>
      <CameraController bounds={bounds} zoomProgress={zoomProgress} />
    </Canvas>
  )
}

function getActiveScene(progress) {
  for (const s of SCENES) {
    if (progress >= s.start && progress < s.end) return s
  }
  if (progress >= 1) return SCENES[SCENES.length - 1]
  return null
}

function getSceneBlend(progress, scene) {
  if (!scene) return 0
  const range = scene.end - scene.start
  if (range === 0) return 1
  return Math.min((progress - scene.start) / range, 1)
}

const LEAF_COLORS = ['#d4a017', '#c8962e', '#b8860b', '#daa520', '#ffd700', '#6B8E23', '#8B7355', '#A0822A', '#556B2F', '#8B4513']

const LEAVES = Array.from({ length: 30 }, (_, i) => ({
  id: `h-leaf-${i}`, left: Math.random() * 100, delay: Math.random() * 20,
  duration: 18 + Math.random() * 25, size: 5 + Math.random() * 14,
  drift: (Math.random() - 0.5) * 300, rotation: (Math.random() * 720).toFixed(0),
  color: LEAF_COLORS[i % LEAF_COLORS.length],
}))

const DUST = Array.from({ length: 20 }, (_, i) => ({
  id: `h-dust-${i}`, left: Math.random() * 100, top: Math.random() * 100,
  delay: Math.random() * 25, duration: 30 + Math.random() * 35,
  size: 2 + Math.random() * 4,
  color: ['rgba(255,248,200,0.4)', 'rgba(255,235,180,0.3)', 'rgba(255,255,220,0.35)'][i % 3],
}))

function Particles({ progress }) {
  const opacity = progress < 0.25 ? 1 : Math.max(0, 1 - (progress - 0.25) / 0.1)
  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden" style={{ opacity }}>
      {LEAVES.map((leaf) => (
        <div key={leaf.id} className="absolute top-0" style={{
          left: `${leaf.left}%`, width: `${leaf.size}px`, height: `${leaf.size * 0.6}px`,
          backgroundColor: leaf.color, borderRadius: '2px 50% 2px 50%', opacity: 0,
          animation: `hLeafFall ${leaf.duration}s ease-in-out ${leaf.delay}s infinite`,
          '--drift': `${leaf.drift}px`, '--rotation': `${leaf.rotation}deg`,
        }} />
      ))}
      {DUST.map((p) => (
        <div key={p.id} className="absolute rounded-full" style={{
          left: `${p.left}%`, top: `${p.top}%`, width: `${p.size}px`, height: `${p.size}px`,
          backgroundColor: p.color,
          animation: `hDustFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}
    </div>
  )
}

function Atmosphere({ progress }) {
  const scene = getActiveScene(progress)

  const fogOpacity = scene ? (() => {
    const b = getSceneBlend(progress, scene)
    return Math.min(b * 0.8 + 0.1, 0.6)
  })() : 0

  const vignetteOpacity = progress < 0.25 ? 0 : Math.min((progress - 0.25) * 2, 0.5)

  const warmth = scene ? scene.warmth : 0.8
  const warmthOverlay = `rgba(${Math.round(255 * (1 - warmth))}, ${Math.round(200 * (1 - warmth))}, ${Math.round(150 * (1 - warmth))}, ${0.05})`

  const blurIntensity = progress >= 0.15 && progress <= 0.25
    ? Math.sin((progress - 0.15) / 0.1 * Math.PI) * 2
    : 0

  return (
    <>
      <div className="absolute inset-0 z-20 pointer-events-none" style={{
        background: scene ? scene.fog : 'transparent',
        opacity: fogOpacity,
        transition: 'background 0.5s',
      }} />
      <div className="absolute inset-0 z-20 pointer-events-none" style={{
        background: `radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,${vignetteOpacity * 0.6}) 100%)`,
      }} />
      {blurIntensity > 0 && (
        <div className="absolute inset-0 z-20 pointer-events-none" style={{
          backdropFilter: `blur(${blurIntensity}px)`,
          WebkitBackdropFilter: `blur(${blurIntensity}px)`,
        }} />
      )}
      <div className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay" style={{
        background: warmthOverlay,
      }} />
    </>
  )
}

function SceneImage({ src, progress, scene }) {
  if (!scene) return null
  const blend = getSceneBlend(progress, scene)
  const opacity = Math.min(blend * 2, 1) * (1 - Math.max(0, (progress - scene.end + 0.03) / 0.03))

  const parallaxBase = scene.start * 100
  const parallaxOffset = (progress - scene.start) * 200
  const scale = 1 + (1 - scene.warmth) * 0.03

  return (
    <div className="absolute inset-0 z-10" style={{
      opacity: Math.max(0, Math.min(opacity, 1)),
      transition: 'opacity 0.3s ease',
      pointerEvents: 'none',
    }}>
      <img src={src} alt="" className="w-full h-full object-cover" style={{
        transform: `translate3d(0, ${-parallaxOffset * 0.5}px, 0) scale(${scale})`,
        willChange: 'transform',
      }} />
    </div>
  )
}

function LightRays({ progress }) {
  const opacity = progress > 0.2 ? Math.min((progress - 0.2) * 3, 0.15) : 0
  return (
    <div className="absolute inset-0 z-15 pointer-events-none" style={{ opacity }}>
      <div className="absolute top-0 left-1/4 w-1/3 h-full" style={{
        background: 'linear-gradient(180deg, rgba(255,215,100,0.08) 0%, transparent 60%)',
        transform: 'skewX(-10deg)',
      }} />
      <div className="absolute top-0 left-2/4 w-1/4 h-full" style={{
        background: 'linear-gradient(180deg, rgba(255,200,80,0.06) 0%, transparent 50%)',
        transform: 'skewX(8deg)',
      }} />
    </div>
  )
}

export default function HeroCinematic({ onComplete }) {
  const navigate = useNavigate()
  const [bounds, setBounds] = useState(null)
  const zoomRef = useRef(0)
  const targetZoomRef = useRef(0)
  const [displayProgress, setDisplayProgress] = useState(0)
  const [showCTA, setShowCTA] = useState(false)
  const rafRef = useRef(null)
  const containerRef = useRef(null)
  const touchRef = useRef(null)
  const isLocked = useRef(true)

  const onBoundsReady = useCallback((b) => setBounds(b), [])

  useEffect(() => {
    const updateZoom = () => {
      zoomRef.current += (targetZoomRef.current - zoomRef.current) * 0.08
      if (Math.abs(zoomRef.current - targetZoomRef.current) < 0.001) {
        zoomRef.current = targetZoomRef.current
      }
      const display = Math.min(Math.max(zoomRef.current, 0), 1)
      setDisplayProgress(display)
      if (display >= 1) setShowCTA(true)
      rafRef.current = requestAnimationFrame(updateZoom)
    }
    rafRef.current = requestAnimationFrame(updateZoom)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  useEffect(() => {
    const clamp = (v) => Math.min(Math.max(v, 0), 1)
    const container = containerRef.current
    if (!container) return

    const onWheel = (e) => {
      if (!isLocked.current) return
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.015 : -0.015
      targetZoomRef.current = clamp(targetZoomRef.current + delta)
    }

    const onTouchStart = (e) => {
      if (!isLocked.current) return
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        touchRef.current = { dist: Math.sqrt(dx * dx + dy * dy) }
      }
    }

    const onTouchMove = (e) => {
      if (!isLocked.current) return
      if (e.touches.length === 2 && touchRef.current) {
        e.preventDefault()
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const newDist = Math.sqrt(dx * dx + dy * dy)
        const diff = (newDist - touchRef.current.dist) * 0.003
        touchRef.current.dist = newDist
        targetZoomRef.current = clamp(targetZoomRef.current + diff)
      }
    }

    const onKeyDown = (e) => {
      if (e.key === '+' || e.key === '=') targetZoomRef.current = clamp(targetZoomRef.current + 0.05)
      if (e.key === '-') targetZoomRef.current = clamp(targetZoomRef.current - 0.05)
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      } else {
        rafRef.current = requestAnimationFrame(function tick() {
          zoomRef.current += (targetZoomRef.current - zoomRef.current) * 0.08
          if (Math.abs(zoomRef.current - targetZoomRef.current) < 0.001) zoomRef.current = targetZoomRef.current
          const display = Math.min(Math.max(zoomRef.current, 0), 1)
          setDisplayProgress(display)
          if (display >= 1) setShowCTA(true)
          rafRef.current = requestAnimationFrame(tick)
        })
      }
    }

    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (showCTA) {
      const timer = setTimeout(() => { isLocked.current = false }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showCTA])

  const zoomIn = () => { targetZoomRef.current = Math.min(targetZoomRef.current + 0.05, 1) }
  const zoomOut = () => { targetZoomRef.current = Math.max(targetZoomRef.current - 0.05, 0) }

  const activeScene = getActiveScene(displayProgress)
  const show3D = displayProgress < 0.25

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden"
      style={{ height: '100vh', minHeight: '700px', background: '#1a1a2e', cursor: 'grab' }}>

      {show3D && (
        <div className="absolute inset-0 z-0">
          <img
            src={SCENE_IMAGES[0]}
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.3, filter: 'blur(4px) brightness(0.5)' }}
          />
        </div>
      )}

      <div className="absolute inset-0 z-5" style={{ opacity: show3D ? 1 : 0, transition: 'opacity 0.8s ease' }}>
        <ModelScene bounds={bounds} onBoundsReady={onBoundsReady} zoomProgress={zoomRef} />
      </div>

      {SCENES.map((scene) => (
        <SceneImage
          key={scene.id}
          src={SCENE_IMAGES[scene.idx]}
          progress={displayProgress}
          scene={scene}
        />
      ))}

      <Atmosphere progress={displayProgress} />
      <LightRays progress={displayProgress} />
      <Particles progress={displayProgress} />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4"
        style={{ opacity: displayProgress > 0 ? 0.6 : 0, transition: 'opacity 0.5s' }}>
        <button onClick={zoomOut} className="w-10 h-10 rounded-full flex items-center justify-center text-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)' }} aria-label="Zoom out">−</button>
        <div className="w-32 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div className="h-full rounded-full transition-all duration-200" style={{
            width: `${displayProgress * 100}%`,
            background: 'linear-gradient(90deg, #d4a017, #ffd700)',
          }} />
        </div>
        <button onClick={zoomIn} className="w-10 h-10 rounded-full flex items-center justify-center text-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)' }} aria-label="Zoom in">+</button>
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 text-center" style={{
        opacity: displayProgress < 0.25 ? 1 - displayProgress * 4 : 0,
        transition: 'opacity 0.5s',
      }}>
        <p className="text-white/60 text-sm tracking-widest uppercase" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          Scroll forward to explore
        </p>
      </div>

      {showCTA && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{
          animation: 'ctaFadeIn 1.5s ease forwards',
        }}>
          <div className="text-center px-6">
            <div className="mb-8" style={{
              animation: 'ctaGlow 3s ease-in-out infinite',
            }}>
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.3) 0%, transparent 70%)' }}>
                <div className="w-10 h-10" style={{
                  background: 'radial-gradient(circle, #ffd700 0%, #d4a017 100%)',
                  borderRadius: '50%',
                  boxShadow: '0 0 30px rgba(212,160,23,0.5), 0 0 60px rgba(212,160,23,0.2)',
                }} />
              </div>
            </div>
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
        @keyframes hLeafFall {
          0% { transform: translateY(-8vh) translateX(0) rotate(var(--rotation)); opacity: 0; }
          10% { opacity: 0.5; }
          80% { opacity: 0.3; }
          100% { transform: translateY(108vh) translateX(var(--drift)) rotate(calc(var(--rotation) + 540deg)); opacity: 0; }
        }
        @keyframes hDustFloat {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          20% { opacity: 0.4; }
          80% { opacity: 0.15; }
          100% { transform: translate(30px, -40px) scale(0.5); opacity: 0; }
        }
        @keyframes ctaFadeIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes ctaGlow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }
      `}</style>
    </section>
  )
}
