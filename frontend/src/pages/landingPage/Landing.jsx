import { useNavigate } from 'react-router-dom'
import TargetCursor from '../../components/TargetCursor'

function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    s: 2 + Math.random() * 4,
    d: 6 + Math.random() * 10,
    delay: Math.random() * 8,
    hue: 280 + Math.random() * 60,
    alpha: 0.1 + Math.random() * 0.2,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {particles.map((p) => (
        <div key={p.id} className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
            background: `hsla(${p.hue}, 50%, 70%, ${p.alpha})`,
            boxShadow: `0 0 ${p.s * 2}px hsla(${p.hue}, 50%, 70%, ${p.alpha * 0.5})`,
            animation: `dreamFloat ${p.d}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }} />
      ))}
    </div>
  )
}

function AmbientBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute rounded-full opacity-20"
        style={{
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(220,200,240,0.25) 0%, transparent 70%)',
          top: '-10%', right: '-10%',
          animation: 'blobFloat 30s ease-in-out infinite',
        }} />
      <div className="absolute rounded-full opacity-15"
        style={{
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(240,210,220,0.2) 0%, transparent 70%)',
          bottom: '-5%', left: '-5%',
          animation: 'blobFloat 25s ease-in-out infinite reverse',
        }} />
      <div className="absolute rounded-full opacity-10"
        style={{
          width: '350px', height: '350px',
          background: 'radial-gradient(circle, rgba(210,230,220,0.15) 0%, transparent 70%)',
          top: '40%', left: '50%',
          animation: 'blobFloat 35s ease-in-out infinite',
          animationDelay: '-10s',
        }} />
    </div>
  )
}

function Sparkles() {
  const sparkles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    s: 1 + Math.random() * 2,
    d: 3 + Math.random() * 4,
    delay: Math.random() * 5,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-1">
      {sparkles.map((s) => (
        <div key={s.id} className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.s,
            height: s.s * 2.5,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
            borderRadius: '50%',
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: `sparkle ${s.d}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }} />
      ))}
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #faf5f0 0%, #f0ecf5 40%, #eaf0f0 70%, #f5f0f0 100%)' }}>

      <TargetCursor
        spinDuration={2}
        hideDefaultCursor
        parallaxOn
        hoverDuration={0.2}
        cursorColor="#c4a0b8"
        cursorColorOnTarget="#B497CF"
      />

      <FloatingParticles />
      <AmbientBlobs />
      <Sparkles />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-3">
          <span className="text-[10px] tracking-[0.5em] uppercase"
            style={{ color: 'rgba(160,140,160,0.5)', letterSpacing: '0.6em' }}>
            Interactive Storytelling
          </span>
        </div>

        <h1 data-parallax="15" className="text-7xl md:text-9xl font-serif mb-3"
          style={{
            color: '#3a2a3a',
            fontWeight: 300,
            letterSpacing: '-0.03em',
          }}>
          Story
          <span style={{
            color: '#c4a0b8',
            fontStyle: 'italic',
            fontWeight: 200,
          }}>AI</span>
        </h1>

        <div className="h-px w-16 my-5" style={{
          background: 'linear-gradient(90deg, transparent, rgba(180,160,180,0.3), transparent)',
        }} />

        <p className="text-base md:text-lg mb-10 max-w-md"
          style={{ color: 'rgba(120,100,120,0.6)', fontWeight: 300, lineHeight: 1.8 }}>
          Where every choice writes a new chapter
        </p>

        <button onClick={() => navigate('/signin')}
          className="relative group cursor-target px-9 py-3 rounded-full text-sm font-medium tracking-wider transition-all duration-700"
          style={{
            color: 'rgba(80,60,80,0.7)',
            background: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(200,180,200,0.3)',
            backdropFilter: 'blur(12px)',
          }}>
          <span className="relative z-10">Begin Your Journey</span>
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: 'linear-gradient(135deg, rgba(220,200,220,0.3), rgba(200,180,200,0.1))',
              backdropFilter: 'blur(12px)',
            }} />
        </button>

        <div className="absolute bottom-8 flex flex-col items-center gap-2"
          style={{ animation: 'fadeIn 1.5s ease 1.5s forwards', opacity: 0 }}>
          <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: 'rgba(160,140,160,0.3)' }}>
            Explore
          </span>
          <div style={{ animation: 'gentleBounce 3s ease-in-out infinite' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3 }}>
              <path d="M12 5v14M5 12l7 7 7-7" stroke="rgba(120,100,120,0.5)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <footer className="relative z-10 w-full py-10 px-6"
        style={{ borderTop: '1px solid rgba(200,180,200,0.08)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(160,140,160,0.25)' }}>
            Interactive Story AI
          </p>
          <nav className="flex gap-8 text-[10px] tracking-wider" style={{ color: 'rgba(160,140,160,0.25)' }}>
            <span className="hover:opacity-60 transition-opacity duration-300 cursor-default">About</span>
            <span className="hover:opacity-60 transition-opacity duration-300 cursor-default">Gallery</span>
            <span className="hover:opacity-60 transition-opacity duration-300 cursor-default">Credits</span>
          </nav>
          <p className="text-[9px]" style={{ color: 'rgba(160,140,160,0.15)' }}>
            &copy; 2026
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes dreamFloat{0%,100%{transform:translateY(0) scale(1);opacity:0.4}25%{transform:translateY(-20px) scale(1.1);opacity:0.7}50%{transform:translateY(-10px) scale(0.9);opacity:0.5}75%{transform:translateY(-25px) scale(1.05);opacity:0.6}}
        @keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-40px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}}
        @keyframes sparkle{0%,100%{opacity:0;transform:scale(1) rotate(var(--r,0deg))}50%{opacity:0.8;transform:scale(1.5) rotate(var(--r,0deg))}}
        @keyframes gentleBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes fadeIn{0%{opacity:0}100%{opacity:1}}
      `}</style>
    </div>
  )
}
