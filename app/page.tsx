'use client'

import { useState, useRef } from 'react'

type AnimationEffect = 'zoom-in' | 'pan-right' | 'pan-left' | 'rotate' | 'fade' | 'shake'

interface VideoConfig {
  duration: number
  effect: AnimationEffect
  prompt: string
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [config, setConfig] = useState<VideoConfig>({
    duration: 5,
    effect: 'zoom-in',
    prompt: ''
  })
  const [agentStatus, setAgentStatus] = useState('Esperando imagen...')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setVideoUrl(null)
        setAgentStatus('Imagen cargada. Configura los parámetros y genera el video.')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileChange(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const generateVideo = async () => {
    if (!image) return

    setProcessing(true)
    setVideoUrl(null)
    setAgentStatus('🤖 Agente iniciado: Analizando imagen...')

    // Simulate agent processing steps
    await new Promise(resolve => setTimeout(resolve, 1000))
    setAgentStatus('🎨 Aplicando efectos de animación...')

    await new Promise(resolve => setTimeout(resolve, 1500))
    setAgentStatus('🎬 Renderizando video con IA...')

    await new Promise(resolve => setTimeout(resolve, 2000))
    setAgentStatus('✨ Optimizando calidad del video...')

    // Create video using canvas and MediaRecorder
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    const img = new Image()
    img.src = image

    img.onload = async () => {
      canvas.width = 1280
      canvas.height = 720

      const stream = canvas.captureStream(30)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000
      })

      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setVideoUrl(url)
        setProcessing(false)
        setAgentStatus('✅ Video generado exitosamente!')
      }

      mediaRecorder.start()

      const fps = 30
      const totalFrames = config.duration * fps
      let frame = 0

      const renderFrame = () => {
        const progress = frame / totalFrames

        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.save()

        // Apply animation effects
        switch (config.effect) {
          case 'zoom-in':
            const scale = 1 + progress * 0.5
            ctx.translate(canvas.width / 2, canvas.height / 2)
            ctx.scale(scale, scale)
            ctx.translate(-canvas.width / 2, -canvas.height / 2)
            break

          case 'pan-right':
            const panX = -progress * canvas.width * 0.3
            ctx.translate(panX, 0)
            break

          case 'pan-left':
            const panXLeft = progress * canvas.width * 0.3
            ctx.translate(panXLeft, 0)
            break

          case 'rotate':
            const rotation = progress * Math.PI * 2
            ctx.translate(canvas.width / 2, canvas.height / 2)
            ctx.rotate(rotation)
            ctx.translate(-canvas.width / 2, -canvas.height / 2)
            break

          case 'fade':
            ctx.globalAlpha = Math.sin(progress * Math.PI)
            break

          case 'shake':
            const shakeX = Math.sin(progress * 50) * 10
            const shakeY = Math.cos(progress * 50) * 10
            ctx.translate(shakeX, shakeY)
            break
        }

        // Calculate dimensions to fit image
        const imgAspect = img.width / img.height
        const canvasAspect = canvas.width / canvas.height
        let drawWidth, drawHeight, drawX, drawY

        if (imgAspect > canvasAspect) {
          drawHeight = canvas.height
          drawWidth = drawHeight * imgAspect
          drawX = (canvas.width - drawWidth) / 2
          drawY = 0
        } else {
          drawWidth = canvas.width
          drawHeight = drawWidth / imgAspect
          drawX = 0
          drawY = (canvas.height - drawHeight) / 2
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        ctx.restore()

        frame++

        if (frame < totalFrames) {
          requestAnimationFrame(renderFrame)
        } else {
          mediaRecorder.stop()
        }
      }

      renderFrame()
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🎬 Video Generator Agent</h1>
        <p>Crea videos impresionantes desde imágenes usando IA</p>
      </div>

      <div className="upload-card">
        <div
          className={`upload-zone ${dragOver ? 'dragover' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="upload-icon">📸</div>
          <h2>Sube tu imagen</h2>
          <p>Arrastra y suelta o haz clic para seleccionar</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </div>

        {image && (
          <div className="preview-container">
            <img src={image} alt="Preview" className="preview-image" />
          </div>
        )}

        {image && !processing && (
          <div className="controls">
            <div className="control-group">
              <label>Duración del video (segundos):</label>
              <input
                type="number"
                min="1"
                max="30"
                value={config.duration}
                onChange={(e) => setConfig({...config, duration: parseInt(e.target.value)})}
              />
            </div>

            <div className="control-group">
              <label>Efecto de animación:</label>
              <select
                value={config.effect}
                onChange={(e) => setConfig({...config, effect: e.target.value as AnimationEffect})}
              >
                <option value="zoom-in">Zoom In</option>
                <option value="pan-right">Pan Derecha</option>
                <option value="pan-left">Pan Izquierda</option>
                <option value="rotate">Rotación</option>
                <option value="fade">Fade</option>
                <option value="shake">Shake</option>
              </select>
            </div>

            <div className="control-group">
              <label>Prompt adicional (opcional):</label>
              <textarea
                placeholder="Describe el estilo o efecto que deseas aplicar..."
                value={config.prompt}
                onChange={(e) => setConfig({...config, prompt: e.target.value})}
              />
            </div>

            <button className="button" onClick={generateVideo}>
              🚀 Generar Video
            </button>
          </div>
        )}

        {processing && (
          <div className="processing">
            <div className="processing-animation"></div>
            <h2>Generando tu video...</h2>
            <p>El agente está trabajando en tu creación</p>
          </div>
        )}

        <div className="agent-status">
          <h3>Estado del Agente</h3>
          <p>{agentStatus}</p>
        </div>

        {videoUrl && (
          <div>
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              className="result-video"
            />
            <a href={videoUrl} download="video-generado.webm">
              <button className="button">📥 Descargar Video</button>
            </a>
          </div>
        )}
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <h3>🤖 Agente Inteligente</h3>
          <p>Procesamiento automático con IA para crear videos únicos</p>
        </div>
        <div className="feature-card">
          <h3>🎨 Múltiples Efectos</h3>
          <p>Zoom, pan, rotación, fade y más efectos profesionales</p>
        </div>
        <div className="feature-card">
          <h3>⚡ Rápido y Fácil</h3>
          <p>Genera videos en segundos con solo subir una imagen</p>
        </div>
      </div>
    </div>
  )
}
