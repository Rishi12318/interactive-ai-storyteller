import { useEffect, useRef } from 'react'

export default function TargetCursor({
  spinDuration = 2,
  hideDefaultCursor = true,
  parallaxOn = true,
  hoverDuration = 0.2,
  cursorColor = '#ffffff',
  cursorColorOnTarget = '#B497CF',
}) {
  const cursorRef = useRef(null)
  const ringRef = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const isHovering = useRef(false)
  const rafRef = useRef(null)

  useEffect(() => {
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none'
    }

    const onMove = (e) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
    }

    const onHover = (e) => {
      if (e.target.closest('.cursor-target')) {
        isHovering.current = true
      }
    }

    const onLeave = (e) => {
      if (e.target.closest('.cursor-target')) {
        isHovering.current = false
      }
    }

    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.15
      pos.current.y += (target.current.y - pos.current.y) * 0.15

      if (cursorRef.current) {
        const x = pos.current.x
        const y = pos.current.y
        cursorRef.current.style.transform = `translate(${x}px, ${y}px)`

        if (isHovering.current) {
          cursorRef.current.style.borderColor = cursorColorOnTarget
          cursorRef.current.style.width = '48px'
          cursorRef.current.style.height = '48px'
          cursorRef.current.style.borderWidth = '1.5px'
          cursorRef.current.style.background = `${cursorColorOnTarget}15`
          cursorRef.current.style.boxShadow = `0 0 20px ${cursorColorOnTarget}20`
        } else {
          cursorRef.current.style.borderColor = cursorColor
          cursorRef.current.style.width = '36px'
          cursorRef.current.style.height = '36px'
          cursorRef.current.style.borderWidth = '1px'
          cursorRef.current.style.background = 'transparent'
          cursorRef.current.style.boxShadow = 'none'
        }
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) rotate(${Date.now() / 1000 * (360 / spinDuration)}deg)`
        if (isHovering.current) {
          ringRef.current.style.opacity = '1'
          ringRef.current.style.borderColor = cursorColorOnTarget
        } else {
          ringRef.current.style.opacity = '0.4'
          ringRef.current.style.borderColor = cursorColor
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onHover)
    document.addEventListener('mouseout', onLeave)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onHover)
      document.removeEventListener('mouseout', onLeave)
      cancelAnimationFrame(rafRef.current)
      document.body.style.cursor = ''
    }
  }, [hideDefaultCursor, spinDuration, cursorColor, cursorColorOnTarget])

  // Parallax elements
  useEffect(() => {
    if (!parallaxOn) return

    const els = document.querySelectorAll('[data-parallax]')
    if (!els.length) return

    const onParallax = (e) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const fx = (e.clientX - cx) / cx
      const fy = (e.clientY - cy) / cy

      els.forEach((el) => {
        const d = parseFloat(el.getAttribute('data-parallax') || '20')
        el.style.transform = `translate(${fx * d}px, ${fy * d}px)`
      })
    }

    window.addEventListener('mousemove', onParallax)
    return () => window.removeEventListener('mousemove', onParallax)
  }, [parallaxOn])

  return (
    <>
      <div ref={ringRef} className="fixed pointer-events-none z-[9999]"
        style={{
          left: -10, top: -10, width: 20, height: 20,
          borderRadius: '50%',
          border: `1px solid ${cursorColor}`,
          opacity: 0.4,
          transition: `border-color ${hoverDuration}s, opacity ${hoverDuration}s`,
        }} />
      <div ref={cursorRef} className="fixed pointer-events-none z-[9999]"
        style={{
          left: -18, top: -18, width: 36, height: 36,
          borderRadius: '50%',
          border: `1px solid ${cursorColor}`,
          transition: `width ${hoverDuration}s, height ${hoverDuration}s, border-color ${hoverDuration}s, background ${hoverDuration}s, box-shadow ${hoverDuration}s`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <div style={{
          width: 2, height: 2,
          borderRadius: '50%',
          background: cursorColor,
          transition: `background ${hoverDuration}s`,
        }} />
      </div>
    </>
  )
}
