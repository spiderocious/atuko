import { useState, useEffect } from 'react'
import { ExtensionSettings } from '@shared/types'
import { Button } from '@ui'
import { getSettings, saveSettings } from '@shared/services/storage.service'

export function SettingsScreen() {
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
      <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-secondary)]">
        Loading…
      </div>
    )
  }

  const inputCls = 'text-sm border border-[var(--color-border)] rounded px-2 py-1.5 bg-[var(--color-surface)] text-[var(--color-text-primary)] w-full focus:outline-none focus:border-[var(--color-brand)] transition-colors'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--color-border)] flex-shrink-0">
        <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">Settings</span>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-[var(--color-success)]">Saved</span>}
          <Button variant="primary" size="sm" onClick={save} disabled={!isDirty}>Save</Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
            Selector Strategy
          </label>
          <select
            className={inputCls}
            value={settings.selectorStrategy}
            onChange={e => update('selectorStrategy', e.target.value as ExtensionSettings['selectorStrategy'])}
          >
            <option value="auto">Auto (recommended)</option>
            <option value="css-first">CSS first</option>
            <option value="xpath-first">XPath first</option>
          </select>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Auto tries CSS selectors first, falls back to XPath.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
            Default Timeout (ms)
          </label>
          <input
            className={inputCls}
            type="number"
            min={1000}
            max={120000}
            step={1000}
            value={settings.defaultTimeoutMs}
            onChange={e => update('defaultTimeoutMs', Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
            Default Retries
          </label>
          <input
            className={inputCls}
            type="number"
            min={0}
            max={10}
            value={settings.defaultRetries}
            onChange={e => update('defaultRetries', Number(e.target.value))}
          />
        </div>

        <hr className="border-[var(--color-border)]" />

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-[var(--color-brand)] cursor-pointer"
            checked={settings.notificationsEnabled}
            onChange={e => update('notificationsEnabled', e.target.checked)}
          />
          <div>
            <p className="text-sm text-[var(--color-text-primary)]">Completion notifications</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Show a system notification when a run finishes</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-[var(--color-brand)] cursor-pointer"
            checked={settings.consoleLogCaptureEnabled}
            onChange={e => update('consoleLogCaptureEnabled', e.target.checked)}
          />
          <div>
            <p className="text-sm text-[var(--color-text-primary)]">Capture console logs</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Record page console.log/warn/error during runs</p>
          </div>
        </label>

        <hr className="border-[var(--color-border)]" />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Theme</label>
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
      </div>
    </div>
  )
}
