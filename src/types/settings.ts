export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
export type TextPosition = 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'center'
export type OutputFormat = 'jpeg' | 'png' | 'webp'

export interface LogoSettings {
  dataUrl: string | null
  size: number        // % of image width, e.g. 20
  opacity: number     // 0–1
  margin: number      // % of image width
  position: LogoPosition
}

export interface TextSettings {
  phone: string
  shopName: string
  showShopName: boolean
  fontSize: number    // % of image width, e.g. 4
  color: string       // hex
  opacity: number     // 0–1
  margin: number      // % of image height from edge
  position: TextPosition
  fontWeight: 'normal' | 'bold'
}

export interface AppSettings {
  logo: LogoSettings
  text: TextSettings
  outputFormat: OutputFormat
  jpegQuality: number // 0.1–1.0
}

export const DEFAULT_SETTINGS: AppSettings = {
  logo: {
    dataUrl: null,
    size: 22,
    opacity: 1,
    margin: 3,
    position: 'top-left',
  },
  text: {
    phone: '',
    shopName: '',
    showShopName: false,
    fontSize: 3.5,
    color: '#ffffff',
    opacity: 1,
    margin: 4,
    position: 'bottom-center',
    fontWeight: 'bold',
  },
  outputFormat: 'jpeg',
  jpegQuality: 0.92,
}
