export interface ImageFile {
  id: string
  file: File
  url: string
  width: number
  height: number
  name: string
}

export interface ProcessedImage {
  id: string
  blob: Blob
  name: string
  originalName: string
}
