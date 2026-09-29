import { AppSettings } from '@/types/settings'

// Draws text with a subtle drop shadow for readability on any background
function drawTextWithShadow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  shadowBlur: number
) {
  ctx.shadowColor = 'rgba(0,0,0,0.65)'
  ctx.shadowBlur = shadowBlur
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = shadowBlur * 0.5
  ctx.fillText(text, x, y)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

export interface ComposeOptions {
  photo: HTMLImageElement
  logo: HTMLImageElement | null
  settings: AppSettings
  /** If true, renders at a reduced resolution for preview (max 800px wide/tall) */
  preview?: boolean
}

export async function composeImage({
  photo,
  logo,
  settings,
  preview = false,
}: ComposeOptions): Promise<Blob> {
  const maxDim = 800
  const scale = preview
    ? Math.min(1, maxDim / Math.max(photo.naturalWidth, photo.naturalHeight))
    : 1

  const canvasW = Math.round(photo.naturalWidth * scale)
  const canvasH = Math.round(photo.naturalHeight * scale)

  // Guard against Safari/mobile canvas limits
  if (canvasW > 16384 || canvasH > 16384) {
    throw new Error('Image trop grande pour être traitée (limite 16384px).')
  }

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context unavailable')

  // 1. Draw base photo
  ctx.drawImage(photo, 0, 0, canvasW, canvasH)

  // 2. Draw logo
  if (logo && settings.logo.dataUrl) {
    const logoW = canvasW * (settings.logo.size / 100)
    const logoH = logoW * (logo.naturalHeight / logo.naturalWidth)
    const marginX = canvasW * (settings.logo.margin / 100)
    const marginY = canvasH * (settings.logo.margin / 100)

    let logoX = marginX
    let logoY = marginY

    const pos = settings.logo.position
    if (pos === 'top-right') logoX = canvasW - logoW - marginX
    if (pos === 'bottom-left') logoY = canvasH - logoH - marginY
    if (pos === 'bottom-right') {
      logoX = canvasW - logoW - marginX
      logoY = canvasH - logoH - marginY
    }
    if (pos === 'center') {
      logoX = (canvasW - logoW) / 2
      logoY = (canvasH - logoH) / 2
    }

    ctx.globalAlpha = settings.logo.opacity
    ctx.drawImage(logo, logoX, logoY, logoW, logoH)
    ctx.globalAlpha = 1
  }

  // 3. Draw text (phone + shop name)
  const { text } = settings
  const hasPhone = text.phone.trim().length > 0
  const hasShop = text.showShopName && text.shopName.trim().length > 0

  if (hasPhone || hasShop) {
    const fontSize = canvasW * (text.fontSize / 100)
    const marginEdge = canvasH * (text.margin / 100)
    const shadowBlur = Math.max(4, fontSize * 0.4)

    ctx.globalAlpha = text.opacity
    ctx.fillStyle = text.color
    ctx.textBaseline = 'alphabetic'

    const getAlign = (): CanvasTextAlign => {
      if (text.position === 'bottom-center' || text.position === 'top-center' || text.position === 'center') return 'center'
      if (text.position === 'bottom-right') return 'right'
      return 'left'
    }

    const getX = (): number => {
      const align = getAlign()
      if (align === 'center') return canvasW / 2
      if (align === 'right') return canvasW - marginEdge
      return marginEdge
    }

    ctx.textAlign = getAlign()

    const isBottom =
      text.position === 'bottom-center' ||
      text.position === 'bottom-left' ||
      text.position === 'bottom-right'

    const isCenter = text.position === 'center'
    const lineHeight = fontSize * 1.35

    if (isCenter) {
      let currentY = canvasH / 2 - (hasShop && hasPhone ? lineHeight / 2 : 0) + (fontSize * 0.3)
      if (hasShop) {
        ctx.font = `${text.fontWeight} ${Math.round(fontSize * 0.78)}px Inter, Arial, sans-serif`
        drawTextWithShadow(ctx, text.shopName, getX(), currentY, shadowBlur)
        currentY += lineHeight
      }
      if (hasPhone) {
        ctx.font = `${text.fontWeight} ${fontSize}px Inter, Arial, sans-serif`
        drawTextWithShadow(ctx, text.phone, getX(), currentY, shadowBlur)
      }
    } else if (isBottom) {
      let currentY = canvasH - marginEdge
      if (hasPhone) {
        ctx.font = `${text.fontWeight} ${fontSize}px Inter, Arial, sans-serif`
        drawTextWithShadow(ctx, text.phone, getX(), currentY, shadowBlur)
        if (hasShop) currentY -= lineHeight
      }
      if (hasShop) {
        ctx.font = `${text.fontWeight} ${Math.round(fontSize * 0.78)}px Inter, Arial, sans-serif`
        drawTextWithShadow(ctx, text.shopName, getX(), currentY, shadowBlur)
      }
    } else {
      // top
      let currentY = marginEdge + fontSize
      if (hasShop) {
        ctx.font = `${text.fontWeight} ${Math.round(fontSize * 0.78)}px Inter, Arial, sans-serif`
        drawTextWithShadow(ctx, text.shopName, getX(), currentY, shadowBlur)
        currentY += lineHeight
      }
      if (hasPhone) {
        ctx.font = `${text.fontWeight} ${fontSize}px Inter, Arial, sans-serif`
        drawTextWithShadow(ctx, text.phone, getX(), currentY, shadowBlur)
      }
    }

    ctx.globalAlpha = 1
  }

  return new Promise((resolve, reject) => {
    const mimeMap: Record<string, string> = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    }
    const mime = preview ? 'image/jpeg' : mimeMap[settings.outputFormat]
    const quality = preview ? 0.82 : settings.jpegQuality

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob a retourné null. Vérifiez la mémoire disponible.'))
      },
      mime,
      quality
    )
  })
}
