import { useEffect, useRef } from 'react'

export default function DotField({
  dotRadius = 1.5,
  dotSpacing = 14,
  bulgeStrength = 67,
  glowRadius = 160,
  cursorRadius = 500,
  cursorForce = 0.1,
  glowColor = '#2563eb',
  className = '',
}) {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let dots = []

    const isDark = () => document.documentElement.classList.contains('dark')

    const buildDots = () => {
      dots = []
      const w = canvas.width
      const h = canvas.height
      for (let x = dotSpacing; x < w; x += dotSpacing) {
        for (let y = dotSpacing; y < h; y += dotSpacing) {
          dots.push({ ox: x, oy: y, x, y })
        }
      }
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      buildDots()
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mouse.current.x
      const my = mouse.current.y
      const dark = isDark()
      const baseColor = dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.13)'

      for (const d of dots) {
        const dx = d.ox - mx
        const dy = d.oy - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        // Bulge displacement
        if (dist < cursorRadius) {
          const force = (1 - dist / cursorRadius) * bulgeStrength * cursorForce
          d.x = d.ox + (dx / dist) * force * -1
          d.y = d.oy + (dy / dist) * force * -1
        } else {
          d.x += (d.ox - d.x) * 0.12
          d.y += (d.oy - d.y) * 0.12
        }

        // Glow proximity
        const glowDist = Math.sqrt((d.x - mx) ** 2 + (d.y - my) ** 2)
        const glowT = Math.max(0, 1 - glowDist / glowRadius)

        if (glowT > 0) {
          // Parse glowColor to rgba with alpha
          ctx.beginPath()
          ctx.arc(d.x, d.y, dotRadius + glowT * 1.2, 0, Math.PI * 2)
          ctx.fillStyle = hexToRgba(glowColor, 0.15 + glowT * 0.75)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(d.x, d.y, dotRadius, 0, Math.PI * 2)
          ctx.fillStyle = baseColor
          ctx.fill()
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      mouse.current = { x: clientX - rect.left, y: clientY - rect.top }
    }

    const onLeave = () => { mouse.current = { x: -9999, y: -9999 } }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    draw()

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('touchmove', onMove, { passive: true })
    canvas.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('touchmove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [dotRadius, dotSpacing, bulgeStrength, glowRadius, cursorRadius, cursorForce, glowColor])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ display: 'block' }}
    />
  )
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
