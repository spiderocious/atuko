import { useState, useEffect } from 'react'
import { ExtensionSettings } from '@shared/types'
import { Button } from '@ui'
import { getSettings, saveSettings } from '@shared/services/storage.service'

export function OptionsScreen() {
  const [settings, setSettings] = useState<ExtensionSettings | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const update = <K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K]) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev)
    setIsDirty(true)
    setSaved(false)
  }

  const save = async () => {
    if (!settings) return
    await saveSettings(settings)
    setIsDirty(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-[var(--color-text-secondary)]">
        Loading…
      </div>
    )
  }

  const inputCls = 'text-sm border border-[var(--color-border)] rounded px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text-primary)] w-full max-w-xs focus:outline-none focus:border-[var(--color-brand)] transition-colors'

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Settings</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Configure Atuko extension preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-[var(--color-success)]">✓ Saved</span>}
          <Button variant="primary" onClick={save} disabled={!isDirty}>Save changes</Button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Selector Strategy */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
            Selector Strategy
          </h2>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">Default selector strategy</label>
            <select
              className={inputCls}
              value={settings.selectorStrategy}
              onChange={e => update('selectorStrategy', e.target.value as ExtensionSettings['selectorStrategy'])}
            >
              <option value="auto">Auto (recommended) — try CSS first, fallback to XPath</option>
              <option value="css-first">CSS only</option>
              <option value="xpath-first">XPath only</option>
            </select>
          </div>
        </section>

        {/* Timing */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
            Timing
          </h2>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">Default step timeout</label>
            <div className="flex items-center gap-2">
              <input
                className={inputCls}
                type="number"
                min={1000}
                max={120000}
                step={1000}
                value={settings.defaultTimeoutMs}
                onChange={e => update('defaultTimeoutMs', Number(e.target.value))}
              />
              <span className="text-sm text-[var(--color-text-secondary)]">ms</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">Default retries on failure</label>
            <input
              className={inputCls}
              type="number"
              min={0}
              max={10}
              value={settings.defaultRetries}
              onChange={e => update('defaultRetries', Number(e.target.value))}
            />
          </div>
        </section>

        {/* Notifications */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
            Notifications & Logging
          </h2>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 accent-[var(--color-brand)]"
              checked={settings.notificationsEnabled}
              onChange={e => update('notificationsEnabled', e.target.checked)}
            />
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Completion notifications</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Show a system notification when a workflow run completes or fails
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 accent-[var(--color-brand)]"
              checked={settings.consoleLogCaptureEnabled}
              onChange={e => update('consoleLogCaptureEnabled', e.target.checked)}
            />
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Console log capture</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Record page console.log / warn / error output in run history
              </p>
            </div>
          </label>
        </section>

        {/* Theme */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
            Appearance
          </h2>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">Theme</label>
            <select
              className={inputCls}
              value={settings.theme}
              onChange={e => update('theme', e.target.value as ExtensionSettings['theme'])}
            >
              <option value="system">System default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </section>
      </div>
    </div>
  )
}
