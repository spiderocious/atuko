import { useState, useEffect } from 'react'
import { SiteConfig } from '@shared/types'
import { Button } from '@ui'
import { MSG } from '@shared/constants/messages'
import { AliasEditor } from '../parts/alias-editor'
import { InterceptRules } from '../parts/intercept-rules'

const DEFAULT_CONFIG = (hostname: string): SiteConfig => ({
  id: crypto.randomUUID(),
  hostname,
  name: hostname,
  aliases: [],
  interceptRules: [],
  sharedVariables: {},
  defaultTimeout: 10000,
  defaultRetries: 2,
})

export function SiteConfigScreen() {
  const [hostname, setHostname] = useState<string>('')
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs[0]
      if (!tab?.url) return
      try {
        const h = new URL(tab.url).hostname
        setHostname(h)
        chrome.runtime.sendMessage(
          { type: MSG.GET_SITE_CONFIG, hostname: h },
          (res: { config?: SiteConfig }) => {
            setConfig(res?.config ?? DEFAULT_CONFIG(h))
          }
        )
      } catch {
        // non-http tab
      }
    })
  }, [])

  const save = () => {
    if (!config) return
    chrome.runtime.sendMessage({ type: MSG.SAVE_SITE_CONFIG, config }, () => {
      setIsDirty(false)
    })
  }

  const update = (patch: Partial<SiteConfig>) => {
    setConfig(c => c ? { ...c, ...patch } : c)
    setIsDirty(true)
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-secondary)]">
        Loading…
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--color-border)] flex-shrink-0">
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">Site Config</p>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{hostname || '—'}</p>
        </div>
        <Button variant="primary" size="sm" onClick={save} disabled={!isDirty}>Save</Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        <AliasEditor
          aliases={config.aliases}
          onChange={aliases => update({ aliases })}
        />
        <hr className="border-[var(--color-border)]" />
        <InterceptRules
          rules={config.interceptRules}
          onChange={interceptRules => update({ interceptRules })}
        />
      </div>
    </div>
  )
}
