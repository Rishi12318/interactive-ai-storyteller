import { useNavigate } from 'react-router-dom'

const BG_IMAGE = '/vintage-collage-frame-wallpaper-background-illustration-vector-paper-texture-with-design-space_53876-140661.avif'

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
  return (
    <>
      <section className="relative w-full overflow-hidden" style={{ height: '100vh', minHeight: '900px' }}>
        <img src={BG_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />

        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(255,200,100,0.15) 0%, transparent 50%)',
          zIndex: 1,
        }} />

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
