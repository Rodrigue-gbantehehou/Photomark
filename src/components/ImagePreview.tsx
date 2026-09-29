'use client'

import { useEffect, useRef, useState } from 'react'
import { ImageFile } from '@/types/image'
import { AppSettings } from '@/types/settings'
import { composeImage } from '@/lib/image-composer'
import { loadImageElement } from '@/lib/image-utils'

interface Props {
  image: ImageFile | null
  settings: AppSettings
}

export function ImagePreview({ image, settings }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!image) {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current)
        prevUrlRef.current = null
      }
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const photo = await loadImageElement(image.url)
        const logo = settings.logo.dataUrl
          ? await loadImageElement(settings.logo.dataUrl)
          : null

        const blob = await composeImage({ photo, logo, settings, preview: true })
        const url = URL.createObjectURL(blob)

        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
        prevUrlRef.current = url
        setPreviewUrl(url)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur de composition')
      } finally {
        setLoading(false)
      }
    }, 220)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [image, settings])

  if (!image) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[280px]
        rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
        <div className="text-5xl mb-3">🖼️</div>
        <p className="text-sm text-center px-4">
          Sélectionnez une photo<br />pour voir l&apos;aperçu
        </p>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 select-none">
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Aperçu de la composition"
          className={`w-full h-auto object-contain transition-opacity duration-300 ${
            loading ? 'opacity-30' : 'opacity-100'
          }`}
        />
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center
          bg-white/90 text-red-500 text-sm p-4 text-center rounded-2xl">
          ⚠ {error}
        </div>
      )}

      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full
        bg-white/80 text-slate-500 text-[10px] font-mono pointer-events-none shadow-sm">
        Aperçu
      </div>
    </div>
  )
}
