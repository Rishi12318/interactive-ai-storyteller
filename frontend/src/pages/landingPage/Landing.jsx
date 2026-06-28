import { useRef, useEffect, Suspense, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { TextureLoader } from 'three'
import * as THREE from 'three'

const BG_IMAGE = '/vintage-collage-frame-wallpaper-background-illustration-vector-paper-texture-with-design-space_53876-140661.avif'

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

function Model({ onBoundsReady }) {
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
      const t = clock.getElapsedTime()
      groupRef.current.position.y = Math.sin(t * Math.PI / 3) * 0.02
    }
  })

  return <group ref={groupRef}><primitive object={obj} /></group>
}

function CameraController({ bounds }) {
  const { camera } = useThree()

  useEffect(() => {
    if (!bounds) return
    const fovRad = camera.fov * Math.PI / 180
    const fill = window.innerWidth < 768 ? 5.79 : window.innerWidth < 1024 ? 7.09 : 8.14
    const dist = bounds.height / (fill * 2 * Math.tan(fovRad / 2))
    camera.position.set(0, bounds.height * 0.08, dist)
    camera.lookAt(0, -bounds.height * 0.12, 0)
  }, [bounds, camera])

  const az = 60 * Math.PI / 180
  return (
    <OrbitControls enableZoom={true} enablePan={false}
      minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2}
      minAzimuthAngle={-az} maxAzimuthAngle={az}
      rotateSpeed={0.8} dampingFactor={0.08} enableDamping={true}
      minDistance={0.3} maxDistance={20} />
  )
}

function Scene({ bounds, onBoundsReady }) {
  return (
    <Canvas style={{ width: '100%', height: '100%', background: 'transparent' }} gl={{ alpha: true }}
      onCreated={({ gl, scene }) => { gl.setClearColor(0x000000, 0); scene.background = null }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 4, 5]} intensity={2.2} color="#ffd700" />
      <directionalLight position={[-3, 2, 3]} intensity={1.0} color="#87CEEB" />
      <directionalLight position={[-3, 4, -2]} intensity={1.0} color="#ffe4b5" />
      <hemisphereLight args={['#ffe4b5', '#3e2723', 0.3]} />
      <Suspense fallback={null}>
        <Model onBoundsReady={onBoundsReady} />
        <GroundShadow radius={bounds?.radius} />
      </Suspense>
      <CameraController bounds={bounds} />
    </Canvas>
  )
}

const LEAF_COLORS = ['#d4a017', '#c8962e', '#b8860b', '#daa520', '#ffd700', '#6B8E23', '#8B7355', '#A0822A', '#556B2F', '#8B4513']

const LEAVES = Array.from({ length: 50 }, (_, i) => ({
  id: `leaf-${i}`, left: Math.random() * 100, delay: Math.random() * 20,
  duration: 18 + Math.random() * 25, size: 5 + Math.random() * 16,
  drift: (Math.random() - 0.5) * 350, rotation: (Math.random() * 720).toFixed(0),
  color: LEAF_COLORS[i % LEAF_COLORS.length],
}))

const DUST = Array.from({ length: 30 }, (_, i) => ({
  id: `dust-${i}`, left: Math.random() * 100, top: Math.random() * 100,
  delay: Math.random() * 25, duration: 30 + Math.random() * 35,
  size: 2 + Math.random() * 4,
  color: ['rgba(255,248,200,0.4)', 'rgba(255,235,180,0.3)', 'rgba(255,255,220,0.35)'][i % 3],
}))

function Particles() {
  return (
    <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
      {LEAVES.map((leaf) => (
        <div key={leaf.id} className="absolute top-0" style={{
          left: `${leaf.left}%`, width: `${leaf.size}px`, height: `${leaf.size * 0.6}px`,
          backgroundColor: leaf.color, borderRadius: '2px 50% 2px 50%', opacity: 0,
          animation: `leafFall ${leaf.duration}s ease-in-out ${leaf.delay}s infinite`,
          '--drift': `${leaf.drift}px`, '--rotation': `${leaf.rotation}deg`,
        }} />
      ))}
      {DUST.map((p) => (
        <div key={p.id} className="absolute rounded-full" style={{
          left: `${p.left}%`, top: `${p.top}%`, width: `${p.size}px`, height: `${p.size}px`,
          backgroundColor: p.color,
          animation: `dustFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}
    </div>
  )
}



const STORIES = [
  { title: 'Fairy Tale', image: '/FairyTale_Story.jpg', emoji: '✨' },
  { title: 'Legend', image: '/Legend_Tale.jpg', emoji: '⚔️' },
  { title: 'Princess', image: '/Princess_story.jpg', emoji: '👑' },
  { title: 'Romance', image: '/For%20female%20romance%20story.png', emoji: '🌸' },
  { title: 'Mystery', image: '/mystery.jpg', emoji: '🔮' },
  { title: 'Adventure', image: '/Other.jpg', emoji: '📖' },
]

function StorySection() {
  const navigate = useNavigate()
  return (
    <section className="relative w-full py-24 px-6" style={{ background: '#f5e6c8' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4" style={{ color: '#5a4030' }}>
            Choose Your Story
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#7a623a' }}>
            Every path reveals new mysteries, every shadow hides a secret waiting to be uncovered.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STORIES.map((story) => (
            <button key={story.title} onClick={() => navigate('/signin')}
              className="relative group overflow-hidden rounded-lg text-left transition-all duration-500 hover:scale-[1.03]"
              style={{ height: '280px', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.15))' }}>
              <img src={story.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to top, rgba(50,35,20,0.75) 0%, rgba(50,35,20,0.15) 50%, transparent 80%)',
              }} />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-2xl mb-2 block">{story.emoji}</span>
                <h3 className="text-xl font-serif" style={{ color: '#f5e0b5' }}>{story.title}</h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="relative w-full py-12 px-6" style={{ background: '#e8d5b0' }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm tracking-widest uppercase" style={{ color: '#5a4030' }}>
          Interactive Story AI
        </p>
        <nav className="flex gap-8 text-sm" style={{ color: '#5a4030' }}>
          <a href="#" className="hover:underline hover:text-[#7a623a] transition-colors">About</a>
          <a href="#" className="hover:underline hover:text-[#7a623a] transition-colors">Gallery</a>
          <a href="#" className="hover:underline hover:text-[#7a623a] transition-colors">Credits</a>
          <a href="#" className="hover:underline hover:text-[#7a623a] transition-colors">Contact</a>
        </nav>
        <p className="text-xs" style={{ color: '#7a623a' }}>
          &copy; 2026 Interactive Story AI. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default function Landing() {
  const [bounds, setBounds] = useState(null)

  const onBoundsReady = useCallback((b) => setBounds(b), [])

  return (
    <>
      <section className="relative w-full overflow-hidden" style={{ height: '100vh', minHeight: '900px' }}>
        <img src={BG_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />

        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(255,200,100,0.15) 0%, transparent 50%)',
          zIndex: 1,
        }} />

        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
          <div className="relative" style={{ width: '70vw', height: '80vh', maxWidth: '950px', maxHeight: '750px' }}>
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/60 border-t-transparent rounded-full animate-spin" /></div>}>
              <Scene bounds={bounds} onBoundsReady={onBoundsReady} />
            </Suspense>
          </div>
        </div>

        <Particles />

        <style>{`
          @keyframes leafFall {
            0% { transform: translateY(-8vh) translateX(0) rotate(var(--rotation)); opacity: 0; }
            10% { opacity: 0.6; }
            80% { opacity: 0.4; }
            100% { transform: translateY(108vh) translateX(var(--drift)) rotate(calc(var(--rotation) + 540deg)); opacity: 0; }
          }
          @keyframes dustFloat {
            0% { transform: translate(0, 0) scale(1); opacity: 0; }
            20% { opacity: 0.5; }
            80% { opacity: 0.2; }
            100% { transform: translate(40px, -60px) scale(0.5); opacity: 0; }
          }
        `}</style>
      </section>

      <StorySection />
      <Footer />
    </>
  )
}
