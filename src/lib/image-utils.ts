import { ImageFile } from '@/types/image'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `Format non supporté : "${file.name}". Utilisez JPG, PNG ou WEBP.`
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `"${file.name}" est trop volumineuse (max 50 Mo).`
  }
  return null
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Impossible de charger l'image : ${src.slice(0, 60)}`))
    img.src = src
  })
}

export async function fileToImageFile(file: File): Promise<ImageFile> {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImageElement(url)
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      url,
      width: img.naturalWidth,
      height: img.naturalHeight,
      name: file.name,
    }
  } catch (e) {
    URL.revokeObjectURL(url)
    throw e
  }
}

export function generateOutputName(
  originalName: string,
  format: 'jpeg' | 'png' | 'webp'
): string {
  const base = originalName.replace(/\.[^.]+$/, '')
  const ext = format === 'jpeg' ? 'jpg' : format
  return `${base}-marque.${ext}`
}
