export interface SelectorAlias {
  name: string   // e.g. 'login-btn'
  selector: string // e.g. "[data-testid='login-button']"
}

export interface InterceptRule {
  id: string
  name: string
  enabled: boolean
  urlPattern: string
  methods: string[]
  action: 'read' | 'modify'

  // read action
  saveAs?: string
  saveTo?: 'run' | 'global'

  // modify action
  responseBody?: Record<string, unknown>
  responseHeaders?: {
    status?: number
    statusText?: string
    'Content-Type'?: string
    [key: string]: string | number | undefined
  }
}

export interface SiteConfig {
  id: string
  hostname: string
  name: string
  baseUrl?: string
  aliases: SelectorAlias[]
  interceptRules: InterceptRule[]
  sharedVariables: Record<string, string>
  defaultTimeout: number
  defaultRetries: number
}
