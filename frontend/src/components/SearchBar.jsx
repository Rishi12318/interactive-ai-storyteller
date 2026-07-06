import { useState } from 'react'
import { API_BASE_URL } from '../config'

const CATEGORIES = ['romance', 'rivalry', 'revenge', 'dark', 'horror', 'criminal']

export default function SearchBar({ onResults }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ q: query, top_k: '6' })
      if (category) params.append('category', category)
      const res = await fetch(`${API_BASE_URL}/api/search?${params}`)
      const data = await res.json()
      if (!res.ok) { setError(data.detail || 'Search blocked.'); return }
      onResults(data.results)
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto">
      <div className="flex gap-2 mb-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search stories... (e.g. forbidden love, redemption arc)"
          maxLength={300}
          className="flex-1 px-4 py-2.5 rounded-full text-sm focus:outline-none transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(200,180,200,0.2)',
            color: '#3a2a3a',
          }}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-3 py-2.5 rounded-full text-xs focus:outline-none transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(200,180,200,0.2)',
            color: '#5a4a5a',
          }}>
          <option value="">All</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <button type="submit" disabled={loading}
          className="px-5 py-2.5 rounded-full text-xs font-medium tracking-wider transition-all duration-300 disabled:opacity-40"
          style={{
            background: 'rgba(200,180,220,0.3)',
            border: '1px solid rgba(200,180,200,0.2)',
            color: '#5a4a5a',
          }}>
          {loading ? '...' : 'Search'}
        </button>
      </div>
      {error && (
        <p className="text-xs text-center" style={{ color: 'rgba(180,100,100,0.7)' }}>{error}</p>
      )}
    </form>
  )
}
