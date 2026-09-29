'use client'

import { useRef } from 'react'
import { AppSettings, LogoPosition, TextPosition, OutputFormat } from '@/types/settings'
import { validateImageFile } from '@/lib/image-utils'
import { saveLogo } from '@/lib/storage'
import { Upload, Phone, Store, Image as ImageIcon, Settings2 } from 'lucide-react'

interface Props {
  settings: AppSettings
  onChange: (settings: AppSettings) => void
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Slider({
  label, value, min, max, step = 1, unit = '', onChange,
}: {
  label: string; value: number; min: number; max: number
  step?: number; unit?: string; onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-slate-600 text-xs">{label}</span>
        <span className="text-slate-400 text-xs font-mono tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full cursor-pointer"
        style={{ accentColor: '#7c3aed' }}
      />
    </div>
  )
}

function Section({ title, icon, children }: {
  title: string; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-violet-500">{icon}</span>
        <h3 className="text-slate-800 text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0
        ${value ? 'bg-violet-600' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow
        transition-all duration-300 ${value ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SettingsPanel({ settings, onChange }: Props) {
  const logoInputRef = useRef<HTMLInputElement>(null)

  const updateLogo = (patch: Partial<typeof settings.logo>) =>
    onChange({ ...settings, logo: { ...settings.logo, ...patch } })

  const updateText = (patch: Partial<typeof settings.text>) =>
    onChange({ ...settings, text: { ...settings.text, ...patch } })

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) { alert(err); return }
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      await saveLogo(dataUrl)
      updateLogo({ dataUrl })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const logoPositions: { value: LogoPosition; label: string }[] = [
    { value: 'top-left',     label: '↖ Haut gauche' },
    { value: 'top-right',    label: '↗ Haut droite' },
    { value: 'center',       label: '• Au centre' },
    { value: 'bottom-left',  label: '↙ Bas gauche' },
    { value: 'bottom-right', label: '↘ Bas droite' },
  ]

  const textPositions: { value: TextPosition; label: string }[] = [
    { value: 'top-center',    label: '↑ Haut' },
    { value: 'center',        label: '• Au centre' },
    { value: 'bottom-left',   label: '↙ Bas gauche' },
    { value: 'bottom-right',  label: '↘ Bas droite' },
    { value: 'bottom-center', label: '↓ Bas centre' },
  ]

  const outputFormats: { value: OutputFormat; label: string }[] = [
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png',  label: 'PNG' },
    { value: 'webp', label: 'WEBP' },
  ]

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* ── Logo ── */}
      <Section title="Logo" icon={<ImageIcon size={15} />}>
        {/* Logo preview + import */}
        <div className="flex items-center gap-3 flex-wrap">
          {settings.logo.dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logo.dataUrl}
              alt="Logo importé"
              className="w-12 h-12 object-contain rounded-lg bg-slate-50 p-1 border border-slate-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200
              flex items-center justify-center text-slate-300">
              <ImageIcon size={20} />
            </div>
          )}
          <button
            id="logo-import-btn"
            onClick={() => logoInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg
              bg-violet-50 border border-violet-200 text-violet-600 text-xs font-medium
              hover:bg-violet-100 transition-all duration-200"
          >
            <Upload size={12} />
            {settings.logo.dataUrl ? 'Changer' : 'Importer le logo'}
          </button>
          {settings.logo.dataUrl && (
            <button
              onClick={async () => { await saveLogo(null); updateLogo({ dataUrl: null }) }}
              className="text-slate-400 hover:text-red-500 text-xs transition-colors"
            >
              Supprimer
            </button>
          )}
          <input ref={logoInputRef} type="file" id="logo-file-input"
            accept="image/*" className="hidden" onChange={handleLogoFile} />
        </div>

        {/* Sliders */}
        <div className="flex flex-col gap-3">
          <Slider label="Taille" value={settings.logo.size} min={5} max={50} unit="%"
            onChange={(v) => updateLogo({ size: v })} />
          <Slider label="Opacité" value={Math.round(settings.logo.opacity * 100)} min={10} max={100} unit="%"
            onChange={(v) => updateLogo({ opacity: v / 100 })} />
          <Slider label="Marge" value={settings.logo.margin} min={0} max={15} unit="%"
            onChange={(v) => updateLogo({ margin: v })} />
        </div>

        {/* Position */}
        <div className="flex flex-col gap-1.5">
          <span className="text-slate-600 text-xs">Position</span>
          <div className="grid grid-cols-2 gap-1.5">
            {logoPositions.map(({ value, label }) => (
              <button key={value} onClick={() => updateLogo({ position: value })}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  value === 'center' ? 'col-span-2' : ''
                } ${
                  settings.logo.position === value
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Téléphone ── */}
      <Section title="Téléphone" icon={<Phone size={15} />}>
        <input
          id="phone-input"
          type="tel"
          placeholder="+229 97 00 00 00"
          value={settings.text.phone}
          onChange={(e) => updateText({ phone: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200
            text-slate-800 text-sm placeholder:text-slate-400
            focus:outline-none focus:border-violet-400 focus:bg-white
            transition-all duration-200"
        />
        <div className="flex flex-col gap-3">
          <Slider label="Taille du texte" value={settings.text.fontSize} min={1} max={8} step={0.5} unit="%"
            onChange={(v) => updateText({ fontSize: v })} />
          <Slider label="Opacité" value={Math.round(settings.text.opacity * 100)} min={10} max={100} unit="%"
            onChange={(v) => updateText({ opacity: v / 100 })} />
          <Slider label="Marge" value={settings.text.margin} min={1} max={20} unit="%"
            onChange={(v) => updateText({ margin: v })} />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-slate-600 text-xs">Couleur</span>
            <div className="flex items-center gap-2">
              <input
                id="text-color-input"
                type="color"
                value={settings.text.color}
                onChange={(e) => updateText({ color: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                style={{ padding: 0 }}
              />
              <span className="text-slate-500 text-xs font-mono">{settings.text.color}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-600 text-xs">Graisse</span>
            <div className="flex gap-1">
              {(['normal', 'bold'] as const).map((w) => (
                <button key={w} onClick={() => updateText({ fontWeight: w })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    settings.text.fontWeight === w
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}>
                  {w === 'bold' ? 'Gras' : 'Normal'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-slate-600 text-xs">Position</span>
          <div className="grid grid-cols-2 gap-1.5">
            {textPositions.map(({ value, label }) => (
              <button key={value} onClick={() => updateText({ position: value })}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  value === 'bottom-center' ? 'col-span-2' : ''
                } ${
                  settings.text.position === value
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Nom boutique ── */}
      <Section title="Nom de la boutique" icon={<Store size={15} />}>
        <div className="flex items-center gap-3">
          <Toggle value={settings.text.showShopName} onChange={(v) => updateText({ showShopName: v })} />
          <span className="text-slate-600 text-xs">
            {settings.text.showShopName ? 'Affiché sur la photo' : 'Masqué'}
          </span>
        </div>
        {settings.text.showShopName && (
          <input
            id="shopname-input"
            type="text"
            placeholder="Léo Market"
            value={settings.text.shopName}
            onChange={(e) => updateText({ shopName: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200
              text-slate-800 text-sm placeholder:text-slate-400
              focus:outline-none focus:border-violet-400 focus:bg-white
              transition-all duration-200"
          />
        )}
      </Section>

      {/* ── Export ── */}
      <Section title="Export" icon={<Settings2 size={15} />}>
        <div className="flex flex-col gap-1.5">
          <span className="text-slate-600 text-xs">Format de sortie</span>
          <div className="flex gap-1.5">
            {outputFormats.map(({ value, label }) => (
              <button key={value} onClick={() => onChange({ ...settings, outputFormat: value })}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-mono font-medium uppercase transition-all ${
                  settings.outputFormat === value
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {settings.outputFormat === 'jpeg' && (
          <Slider
            label="Qualité JPEG"
            value={Math.round(settings.jpegQuality * 100)}
            min={50} max={100} unit="%"
            onChange={(v) => onChange({ ...settings, jpegQuality: v / 100 })}
          />
        )}
      </Section>
    </div>
  )
}
