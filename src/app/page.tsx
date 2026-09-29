'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ImageUploader } from '@/components/ImageUploader'
import { ImageGrid } from '@/components/ImageGrid'
import { ImagePreview } from '@/components/ImagePreview'
import { SettingsPanel } from '@/components/SettingsPanel'
import { ProgressBar } from '@/components/ProgressBar'
import { DownloadButton } from '@/components/DownloadButton'
import { ImageFile, ProcessedImage } from '@/types/image'
import { AppSettings, DEFAULT_SETTINGS } from '@/types/settings'
import { fileToImageFile, generateOutputName, loadImageElement } from '@/lib/image-utils'
import { composeImage } from '@/lib/image-composer'
import { downloadAsZip, downloadBlob } from '@/lib/download-utils'
import { loadLogo, loadSettings, saveSettings } from '@/lib/storage'
import { Settings2, X, Lock } from 'lucide-react'

export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const settingsSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load persisted settings & logo on mount ────────────────────────────────
  useEffect(() => {
    const saved = loadSettings()
    loadLogo().then((logoDataUrl) => {
      setSettings({ ...saved, logo: { ...saved.logo, dataUrl: logoDataUrl } })
      setSettingsLoaded(true)
    })
  }, [])

  // ── Auto-save settings (debounced) ────────────────────────────────────────
  useEffect(() => {
    if (!settingsLoaded) return
    if (settingsSaveRef.current) clearTimeout(settingsSaveRef.current)
    settingsSaveRef.current = setTimeout(() => saveSettings(settings), 600)
  }, [settings, settingsLoaded])

  const selectedImage = images.find((img) => img.id === selectedId) ?? null

  // ── Handle new files ───────────────────────────────────────────────────────
  const handleFilesSelected = useCallback(async (files: File[]) => {
    setGlobalError(null)
    const newImages: ImageFile[] = []
    const errors: string[] = []

    for (const file of files) {
      try {
        const imgFile = await fileToImageFile(file)
        newImages.push(imgFile)
      } catch (e) {
        errors.push(e instanceof Error ? e.message : `Erreur: ${file.name}`)
      }
    }

    if (errors.length > 0) setGlobalError(errors[0])

    setImages((prev) => [...prev, ...newImages])

    if (newImages.length > 0) {
      setSelectedId((prev) => prev ?? newImages[0].id)
      setProcessedImages([])
    }
  }, [])

  // ── Remove image ───────────────────────────────────────────────────────────
  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id)
      if (target) URL.revokeObjectURL(target.url)
      const filtered = prev.filter((img) => img.id !== id)
      return filtered
    })
    setSelectedId((prev) => {
      if (prev !== id) return prev
      const remaining = images.filter((img) => img.id !== id)
      return remaining.length > 0 ? remaining[0].id : null
    })
    setProcessedImages((prev) => prev.filter((p) => p.id !== id))
  }, [images])

  // ── Process all images ─────────────────────────────────────────────────────
  const handleProcess = useCallback(async () => {
    if (images.length === 0) return
    setGlobalError(null)
    setProcessing(true)
    setProgress({ current: 0, total: images.length })
    const results: ProcessedImage[] = []

    try {
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        const photo = await loadImageElement(img.url)
        const logo = settings.logo.dataUrl
          ? await loadImageElement(settings.logo.dataUrl)
          : null

        const blob = await composeImage({ photo, logo, settings, preview: false })
        results.push({
          id: img.id,
          blob,
          name: generateOutputName(img.name, settings.outputFormat),
          originalName: img.name,
        })

        setProgress({ current: i + 1, total: images.length })
        // Yield between images to keep UI responsive
        await new Promise<void>((r) => requestAnimationFrame(() => r()))
      }
      setProcessedImages(results)
    } catch (e) {
      setGlobalError(e instanceof Error ? e.message : 'Erreur lors du traitement.')
    } finally {
      setProcessing(false)
    }
  }, [images, settings])

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (processedImages.length === 0) return
    if (processedImages.length === 1) {
      downloadBlob(processedImages[0].blob, processedImages[0].name)
    } else {
      await downloadAsZip(processedImages)
    }
  }, [processedImages])

  // ── Settings change ────────────────────────────────────────────────────────
  const handleSettingsChange = useCallback((s: AppSettings) => {
    setSettings(s)
    setProcessedImages([]) // Invalidate processed images when settings change
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between
        px-4 sm:px-6 h-14 border-b border-slate-200
        bg-white/90 backdrop-blur-xl shadow-sm">

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600
            flex items-center justify-center shadow-lg shadow-violet-600/30 flex-shrink-0">
            <span className="text-white text-[11px] font-black tracking-tight">PM</span>
          </div>
          <div>
            <p className="text-slate-900 font-bold text-sm leading-none">Photomark</p>
            <p className="text-slate-500 text-[10px] leading-none mt-0.5 hidden sm:block">
              Signez vos photos en un clic
            </p>
          </div>
        </div>

        <button
          id="settings-toggle-btn"
          onClick={() => setSettingsOpen(!settingsOpen)}
          aria-label="Ouvrir les paramètres"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium
            transition-all duration-200 lg:hidden
            ${settingsOpen
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
        >
          <Settings2 size={15} />
          <span className="hidden sm:inline">Paramètres</span>
        </button>
      </header>

      {/* ── Main layout ── */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        {/* Left: upload + grid + actions */}
        <div className="flex-1 flex flex-col gap-5 p-4 sm:p-6 min-w-0 overflow-y-auto">

          <ImageUploader onFilesSelected={handleFilesSelected} disabled={processing} />

          {globalError && (
            <div className="px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 text-sm flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5">⚠</span>
              <span>{globalError}</span>
              <button onClick={() => setGlobalError(null)} className="ml-auto text-red-400/60 hover:text-red-400 flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          )}

          {images.length > 0 && (
            <ImageGrid
              images={images}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onRemove={handleRemoveImage}
            />
          )}

          {/* Preview on mobile (below grid) */}
          <div className="lg:hidden">
            {images.length > 0 && (
              <>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-3">
                  Aperçu
                </p>
                <ImagePreview image={selectedImage} settings={settings} />
              </>
            )}
          </div>

          {/* Progress */}
          {processing && (
            <ProgressBar current={progress.current} total={progress.total} />
          )}

          {/* Actions */}
          {images.length > 0 && (
            <div className="mt-auto pt-2">
              <DownloadButton
                imageCount={images.length}
                processing={processing}
                onProcess={handleProcess}
                onDownload={handleDownload}
                hasProcessed={processedImages.length > 0}
              />
              {processedImages.length > 0 && !processing && (
                <p className="text-center text-emerald-600 text-xs mt-2.5 flex items-center justify-center gap-1.5">
                  <span>✓</span>
                  {processedImages.length} photo{processedImages.length > 1 ? 's' : ''} prête{processedImages.length > 1 ? 's' : ''} au téléchargement
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Preview + Settings */}
        <div className={[
          'lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col',
          'border-l border-slate-200 bg-white',
          settingsOpen ? 'fixed lg:relative inset-0 lg:inset-auto z-50 lg:z-auto flex' : 'hidden lg:flex'
        ].join(' ')}>

          {/* Mobile close header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 lg:hidden">
            <p className="text-slate-800 text-sm font-semibold">Paramètres</p>
            <button onClick={() => setSettingsOpen(false)} className="text-slate-500 hover:text-slate-900 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Desktop preview */}
          <div className="hidden lg:flex flex-col p-5 gap-2.5 border-b border-slate-200 flex-shrink-0 bg-slate-50/50">
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">Aperçu en temps réel</p>
            <ImagePreview image={selectedImage} settings={settings} />
          </div>

          {/* Settings area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <SettingsPanel settings={settings} onChange={handleSettingsChange} />
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="px-6 py-2.5 border-t border-slate-200 bg-white flex items-center justify-center gap-2">
        <Lock size={10} className="text-slate-400" />
        <span className="text-[10px] text-slate-500 font-medium">
          Vos photos restent sur votre appareil — aucun envoi serveur
        </span>
      </footer>
    </div>
  )
}
