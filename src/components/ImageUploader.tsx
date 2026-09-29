'use client'

import { useRef, useState } from 'react'
import { validateImageFile } from '@/lib/image-utils'
import { CloudUpload } from 'lucide-react'

interface Props {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
}

export function ImageUploader({ onFilesSelected, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFiles = (files: FileList | null) => {
    if (!files) return
    setError(null)
    const valid: File[] = []
    const errors: string[] = []
    Array.from(files).forEach((f) => {
      const err = validateImageFile(f)
      if (err) errors.push(err)
      else valid.push(f)
    })
    if (errors.length > 0) setError(errors[0])
    if (valid.length > 0) onFilesSelected(valid)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={[
          'relative flex flex-col items-center justify-center gap-3',
          'rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer',
          'py-10 px-6 min-h-[180px]',
          dragging
            ? 'border-violet-400 bg-violet-50 scale-[1.01]'
            : 'border-slate-300 bg-slate-50 hover:border-violet-400/60 hover:bg-slate-100',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <div className={[
          'flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300',
          dragging ? 'bg-violet-100 text-violet-600' : 'bg-slate-200 text-slate-500',
        ].join(' ')}>
          <CloudUpload size={28} />
        </div>

        <div className="text-center">
          <p className="text-slate-700 font-medium text-base">
            {dragging ? 'Relâchez pour importer' : 'Déposez vos photos ici'}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            JPG, PNG, WEBP · Plusieurs fichiers acceptés
          </p>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
          className="mt-1 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500
            text-white text-sm font-medium transition-all duration-200
            hover:shadow-lg hover:shadow-violet-500/30 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sélectionner des photos
        </button>

        <input
          ref={inputRef}
          type="file"
          id="photo-file-input"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => { processFiles(e.target.files); e.target.value = '' }}
        />
      </div>

      {error && (
        <div className="mt-2 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          ⚠ {error}
        </div>
      )}
    </div>
  )
}
