'use client'

import { ImageFile } from '@/types/image'
import { CheckCircle, X } from 'lucide-react'

interface Props {
  images: ImageFile[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}

export function ImageGrid({ images, selectedId, onSelect, onRemove }: Props) {
  if (images.length === 0) return null

  return (
    <div className="w-full">
      <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-3">
        {images.length} photo{images.length > 1 ? 's' : ''} importée{images.length > 1 ? 's' : ''}
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {images.map((img) => {
          const isSelected = img.id === selectedId
          return (
            <div
              key={img.id}
              onClick={() => onSelect(img.id)}
              className={[
                'relative aspect-square rounded-xl overflow-hidden cursor-pointer',
                'transition-all duration-200 ring-2 group bg-slate-100',
                isSelected
                  ? 'ring-violet-500 scale-[0.97]'
                  : 'ring-transparent hover:ring-slate-300 hover:scale-[0.98]',
              ].join(' ')}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-full object-cover"
              />

              {/* Selected overlay */}
              {isSelected && (
                <div className="absolute inset-0 bg-violet-500/25 flex items-center justify-center">
                  <CheckCircle size={22} className="text-white drop-shadow-md" />
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                aria-label={`Supprimer ${img.name}`}
                onClick={(e) => { e.stopPropagation(); onRemove(img.id) }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full
                  bg-black/60 text-white/80 flex items-center justify-center
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                  hover:bg-red-500 hover:text-white"
              >
                <X size={11} />
              </button>

              {/* Image name tooltip */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent
                px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-white/80 text-[9px] truncate leading-tight">{img.name}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
