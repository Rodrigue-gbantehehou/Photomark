'use client'

import { Download, Loader2, Sparkles } from 'lucide-react'

interface Props {
  imageCount: number
  processing: boolean
  onProcess: () => void
  onDownload: () => void
  hasProcessed: boolean
}

export function DownloadButton({
  imageCount,
  processing,
  onProcess,
  onDownload,
  hasProcessed,
}: Props) {
  const isMultiple = imageCount > 1
  const disabled = imageCount === 0 || processing

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Apply button */}
      <button
        id="apply-btn"
        onClick={onProcess}
        disabled={disabled}
        className="flex-1 flex items-center justify-center gap-2
          px-6 py-3 rounded-xl font-semibold text-sm
          bg-gradient-to-r from-violet-700 to-violet-500
          text-white shadow-lg shadow-violet-600/25
          hover:from-violet-600 hover:to-violet-400
          hover:shadow-violet-500/40 hover:scale-[1.02]
          active:scale-[0.98]
          transition-all duration-200
          disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
      >
        {processing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Traitement...
          </>
        ) : (
          <>
            <Sparkles size={15} />
            Appliquer{imageCount > 1 ? ` les ${imageCount} photos` : ''}
          </>
        )}
      </button>

      {/* Download button */}
      {hasProcessed && (
        <button
          id="download-btn"
          onClick={onDownload}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-2
            px-6 py-3 rounded-xl font-semibold text-sm
            bg-white border border-slate-200 text-slate-700 shadow-sm
            hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900
            hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          {isMultiple ? `Télécharger (${imageCount} photos)` : 'Télécharger'}
        </button>
      )}
    </div>
  )
}
