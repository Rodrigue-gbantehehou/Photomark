import JSZip from 'jszip'
import { ProcessedImage } from '@/types/image'

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export async function downloadAsZip(
  images: ProcessedImage[],
  zipName = 'photos-marquees.zip'
): Promise<void> {
  const zip = new JSZip()
  for (const img of images) {
    zip.file(img.name, img.blob)
  }
  const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  downloadBlob(content, zipName)
}
