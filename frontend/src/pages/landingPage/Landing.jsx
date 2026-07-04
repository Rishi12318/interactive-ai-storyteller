import { useNavigate } from 'react-router-dom'
import HeroCinematic from '../../components/HeroCinematic'

const STORIES = [
  { title: 'Fairy Tale', image: '/FairyTale_Story.jpg', emoji: '✨' },
  { title: 'Princess', image: '/Princess_story.jpg', emoji: '👑' },
  { title: 'Mystery', image: '/mystery.jpg', emoji: '🔮' },
]

function StorySection() {
  const navigate = useNavigate()
  return (
    <section className="relative w-full py-24 px-6" style={{ background: '#efe4d4' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4" style={{ color: '#6a5a4a' }}>
            Choose Your Story
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#8a7a6a' }}>
            Every path reveals new mysteries, every shadow hides a secret waiting to be uncovered.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STORIES.map((story) => (
            <button key={story.title} onClick={() => navigate('/signin')}
              className="relative group overflow-hidden rounded-xl text-left transition-all duration-500 hover:scale-[1.03]"
              style={{ height: '280px', boxShadow: '0 4px 20px rgba(160,140,120,0.2)' }}>
              <img src={story.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to top, rgba(90,70,50,0.6) 0%, rgba(90,70,50,0.1) 50%, transparent 80%)',
              }} />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-2xl mb-2 block">{story.emoji}</span>
                <h3 className="text-xl font-serif" style={{ color: '#f0e4d0' }}>{story.title}</h3>
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
    <footer className="relative w-full py-12 px-6" style={{ background: '#e0d4c4' }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm tracking-widest uppercase" style={{ color: '#6a5a4a' }}>
          Interactive Story AI
        </p>
        <nav className="flex gap-8 text-sm" style={{ color: '#6a5a4a' }}>
          <a href="#" className="hover:underline hover:text-[#8a7a6a] transition-colors">About</a>
          <a href="#" className="hover:underline hover:text-[#8a7a6a] transition-colors">Gallery</a>
          <a href="#" className="hover:underline hover:text-[#8a7a6a] transition-colors">Credits</a>
          <a href="#" className="hover:underline hover:text-[#8a7a6a] transition-colors">Contact</a>
        </nav>
        <p className="text-xs" style={{ color: '#8a7a6a' }}>
          &copy; 2026 Interactive Story AI. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <>
      <HeroCinematic />
      <StorySection />
      <Footer />
    </>
  )
}
