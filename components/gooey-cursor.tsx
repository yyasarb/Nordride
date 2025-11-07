'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

interface CursorOptions {
  color: string
  glowStrength: number
  thickness: number
  trailLength: number
  threshold: number
  maxTailLength: number
  renderScale: number
}

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform vec2 u_points[64];
  uniform int u_pointCount;
  uniform vec3 u_color;
  uniform float u_glowStrength;
  uniform float u_thickness;
  uniform float u_threshold;
  uniform float u_time;
  uniform sampler2D u_prevFrame;
  uniform float u_decay;

  float metaball(vec2 p, vec2 center, float radius) {
    float dist = length(p - center);
    return radius / (dist * dist + 0.0001);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 p = gl_FragCoord.xy;

    // Sample previous frame with decay
    vec4 prevColor = texture2D(u_prevFrame, uv);
    prevColor.rgb *= u_decay;

    // Calculate metaball field
    float field = 0.0;
    float maxGlow = 0.0;

    for(int i = 0; i < 64; i++) {
      if(i >= u_pointCount) break;

      vec2 point = u_points[i];
      float age = float(u_pointCount - i) / float(u_pointCount);
      float radius = u_thickness * (0.5 + age * 0.5);
      float glow = u_glowStrength * (1.0 - age * 0.6);

      float contribution = metaball(p, point, radius);
      field += contribution;
      maxGlow = max(maxGlow, contribution * glow);
    }

    // Apply threshold for cohesion
    float intensity = smoothstep(u_threshold - 0.1, u_threshold + 0.1, field);

    // Additive glow
    vec3 finalColor = u_color * intensity;
    finalColor += u_color * maxGlow * 0.3;

    // Blend with previous frame
    finalColor = max(finalColor, prevColor.rgb);

    // Soft edges with distance falloff
    float alpha = intensity * 0.9;

    gl_FragColor = vec4(finalColor, alpha);
  }
`

export function GooeyCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const frameBuffersRef = useRef<WebGLFramebuffer[]>([])
  const texturesRef = useRef<WebGLTexture[]>([])
  const currentFrameRef = useRef(0)

  const pointsRef = useRef<{ x: number; y: number }[]>([])
  const lastPosRef = useRef({ x: 0, y: 0 })
  const lastTimeRef = useRef(Date.now())
  const velocityRef = useRef(0)

  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isWebGLAvailable, setIsWebGLAvailable] = useState(true)

  const { theme, systemTheme } = useTheme()
  const activeTheme = theme === 'system' ? systemTheme : theme

  // Theme-aware colors (hex to RGB)
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
        ]
      : [0, 0, 0]
  }

  const cursorColor = activeTheme === 'dark' ? '#E76F51' : '#5F7161'
  const colorRgb = hexToRgb(cursorColor)

  const optionsRef = useRef<CursorOptions>({
    color: cursorColor,
    glowStrength: 0.8,
    thickness: 20,
    trailLength: 0.94, // decay factor (higher = longer trail)
    threshold: 1.5,
    maxTailLength: 48,
    renderScale: Math.min(window.devicePixelRatio, 2),
  })

  useEffect(() => {
    setMounted(true)

    // Check mobile
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0)
      setIsMobile(mobile)
    }

    // Check reduced motion
    const checkReducedMotion = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)

      mediaQuery.addEventListener('change', (e) => {
        setPrefersReducedMotion(e.matches)
      })
    }

    checkMobile()
    checkReducedMotion()
  }, [])

  useEffect(() => {
    if (!mounted || isMobile || prefersReducedMotion || !canvasRef.current) {
      return
    }

    const canvas = canvasRef.current
    const dpr = optionsRef.current.renderScale

    // Setup canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize WebGL
    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    })

    if (!gl) {
      console.warn('WebGL not available, gooey cursor disabled')
      setIsWebGLAvailable(false)
      return
    }

    glRef.current = gl

    // Compile shaders
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }

      return shader
    }

    const vertexShader = compileShader(VERTEX_SHADER, gl.VERTEX_SHADER)
    const fragmentShader = compileShader(FRAGMENT_SHADER, gl.FRAGMENT_SHADER)

    if (!vertexShader || !fragmentShader) {
      setIsWebGLAvailable(false)
      return
    }

    // Link program
    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      setIsWebGLAvailable(false)
      return
    }

    programRef.current = program
    gl.useProgram(program)

    // Setup geometry (fullscreen quad)
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    // Setup ping-pong buffers for temporal feedback
    const createFramebuffer = () => {
      const texture = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

      const framebuffer = gl.createFramebuffer()!
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)

      return { framebuffer, texture }
    }

    const fb1 = createFramebuffer()
    const fb2 = createFramebuffer()

    frameBuffersRef.current = [fb1.framebuffer, fb2.framebuffer]
    texturesRef.current = [fb1.texture, fb2.texture]

    // Get uniform locations
    const uniforms = {
      resolution: gl.getUniformLocation(program, 'u_resolution')!,
      points: gl.getUniformLocation(program, 'u_points')!,
      pointCount: gl.getUniformLocation(program, 'u_pointCount')!,
      color: gl.getUniformLocation(program, 'u_color')!,
      glowStrength: gl.getUniformLocation(program, 'u_glowStrength')!,
      thickness: gl.getUniformLocation(program, 'u_thickness')!,
      threshold: gl.getUniformLocation(program, 'u_threshold')!,
      time: gl.getUniformLocation(program, 'u_time')!,
      prevFrame: gl.getUniformLocation(program, 'u_prevFrame')!,
      decay: gl.getUniformLocation(program, 'u_decay')!,
    }

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) * dpr
      const y = (canvas.height - (e.clientY - rect.top) * dpr) // Flip Y

      // Calculate velocity
      const now = Date.now()
      const dt = (now - lastTimeRef.current) / 1000
      const dx = x - lastPosRef.current.x
      const dy = y - lastPosRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      velocityRef.current = distance / dt

      lastPosRef.current = { x, y }
      lastTimeRef.current = now

      // Add point with speed-adaptive spacing
      const minSpacing = 2 + Math.min(velocityRef.current / 100, 10)
      const lastPoint = pointsRef.current[pointsRef.current.length - 1]

      if (!lastPoint || distance > minSpacing) {
        pointsRef.current.push({ x, y })

        // Limit points based on speed
        const maxPoints = Math.min(
          Math.floor(16 + velocityRef.current / 50),
          optionsRef.current.maxTailLength
        )

        if (pointsRef.current.length > maxPoints) {
          pointsRef.current.shift()
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Render loop
    let rafId: number
    const render = () => {
      if (!gl || !programRef.current) return

      // Ping-pong: read from one buffer, write to the other
      const readIdx = currentFrameRef.current % 2
      const writeIdx = 1 - readIdx

      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffersRef.current[writeIdx])
      gl.viewport(0, 0, canvas.width, canvas.height)

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(programRef.current)

      // Set uniforms
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)
      gl.uniform1i(uniforms.pointCount, pointsRef.current.length)
      gl.uniform3f(uniforms.color, colorRgb[0], colorRgb[1], colorRgb[2])
      gl.uniform1f(uniforms.glowStrength, optionsRef.current.glowStrength)
      gl.uniform1f(uniforms.thickness, optionsRef.current.thickness * dpr)
      gl.uniform1f(uniforms.threshold, optionsRef.current.threshold)
      gl.uniform1f(uniforms.time, Date.now() / 1000)
      gl.uniform1f(uniforms.decay, optionsRef.current.trailLength)

      // Upload points
      const pointsArray = new Float32Array(128)
      pointsRef.current.forEach((p, i) => {
        pointsArray[i * 2] = p.x
        pointsArray[i * 2 + 1] = p.y
      })
      gl.uniform2fv(uniforms.points, pointsArray)

      // Bind previous frame texture
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texturesRef.current[readIdx])
      gl.uniform1i(uniforms.prevFrame, 0)

      // Enable blending
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      // Render to screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texturesRef.current[writeIdx])
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      currentFrameRef.current++

      // Decay points gradually
      if (pointsRef.current.length > 0 && velocityRef.current < 10) {
        const decayRate = 0.98
        if (Math.random() > decayRate) {
          pointsRef.current.shift()
        }
      }

      rafId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafId)

      // Cleanup WebGL resources
      if (gl) {
        frameBuffersRef.current.forEach(fb => gl.deleteFramebuffer(fb))
        texturesRef.current.forEach(tex => gl.deleteTexture(tex))
        if (programRef.current) gl.deleteProgram(programRef.current)
      }
    }
  }, [mounted, isMobile, prefersReducedMotion, activeTheme])

  // Don't render on mobile, reduced motion, or if WebGL unavailable
  if (!mounted || isMobile || prefersReducedMotion || !isWebGLAvailable) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9998]"
      style={{
        mixBlendMode: 'screen',
      }}
    />
  )
}
