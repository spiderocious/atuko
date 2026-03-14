# Atuko MVP — Implementation Todo

Full implementation plan from scaffold to MVP completion.
Commit and push after every section using: `ggg "commit message" main`
After commit, always ensure you come back to this file to check off completed tasks and move on to the next section.

---

## Phase 1 — Project Scaffold & Extension Setup

- [x] Initialise project with Vite + React + TypeScript
- [x] Install and configure `@crxjs/vite-plugin` for Chrome extension support
- [x] Write `manifest.json` (MV3) with all required permissions: tabs, activeTab, scripting, storage, sidePanel, notifications, clipboardRead, clipboardWrite, webRequest, host_permissions: `<all_urls>`
- [x] Configure Vite multi-entry: popup, side-panel, options (HTML), service-worker, content-script (JS)
- [x] Configure TypeScript strict mode and path aliases (`@app`, `@features`, `@shared`, `@ui`)
- [x] Set up `tsconfig.json` and `tsconfig.app.json`
- [x] Install Tailwind CSS v4 and configure `tailwind.config.ts`
- [x] Install core dependencies: React 18, TanStack Query, Lucide React, MeemawJS
- [x] Create `src/` folder structure following FSD: `features/`, `shared/`, `ui/`
- [x] Create `shared/constants/feature-flags.ts` with all feature flags (all default `true`)
- [x] Create `shared/ui/icons/index.ts` as Lucide proxy barrel export
- [x] Create placeholder entry files for all surfaces (popup, side-panel, options, service-worker, content-script) so extension loads unpacked without errors
- [ ] Verify extension loads in Chrome via `chrome://extensions` → Load unpacked → `dist/`
- [x] **Commit and push using the ggg command only with message** — `feat: scaffold Chrome MV3 extension with Vite, React, and TypeScript`

---

## Phase 2 — Design System & Shared UI Components

- [x] Define all CSS custom properties in `src/index.css`: brand, neutral (light + dark), semantic, status indicator colors, spacing, radius, shadow, duration, easing tokens
- [x] Configure Tailwind to map CSS tokens so all token names are usable as Tailwind classes
- [x] Import Inter and JetBrains Mono fonts (via Google Fonts CDN or local bundling)
- [x] Build `ui/button.tsx` — primary, secondary, ghost variants; sm, md, lg sizes
- [x] Build `ui/input.tsx` — with label above, focus ring, error state
- [x] Build `ui/badge.tsx` — semantic color pairs, pill shape
- [x] Build `ui/status-dot.tsx` — 8px circle with idle/running/waiting/success/failed/dry-run states
- [x] Build `ui/card.tsx` — shadow-sm, radius-lg, standard padding variants
- [x] Build `ui/skeleton.tsx` — for loading states (never use spinners on data)
- [x] Build `ui/empty-state.tsx` — icon + headline + body + optional CTA anatomy
- [x] Build `ui/modal.tsx` — floating, radius-xl, shadow-lg, backdrop
- [x] Build `ui/dropdown.tsx` — shadow-md, radius-lg, keyboard navigable
- [x] Barrel export all from `ui/index.ts`
- [x] **Commit and push using the ggg command only with message** — `feat: implement design system tokens and shared UI component library`

---

## Phase 3 — Type System & Storage Layer

- [ ] Create `shared/types/workflow.types.ts` — full Workflow JSON schema types: Workflow, StepObject, SelectorObject, TriggerObject, ConditionObject, LoopObject, BranchObject
- [ ] Create `shared/types/step-types.ts` — typed options interface per step type (ClickOptions, FillOptions, WaitOptions, etc.)
- [ ] Create `shared/types/run.types.ts` — RunRecord, StepResult, RunStatus
- [ ] Create `shared/types/site-config.types.ts` — SiteConfig, InterceptRule, SelectorAlias
- [ ] Create `shared/types/variable.types.ts` — VariableScope enum, VariableStore
- [ ] Create `shared/constants/storage-keys.ts` — all chrome.storage key strings as constants
- [ ] Create `shared/services/storage.service.ts` — typed CRUD wrapper over `chrome.storage.local` and `chrome.storage.sync` for: workflows, site configs, global variables, run history, screenshots, settings
- [ ] Add screenshot purge logic in storage service (remove entries older than 7 days)
- [ ] **Commit and push using the ggg command only with message** — `feat: define full type system and typed storage layer`

---

## Phase 4 — Runtime Engine (Service Worker)

- [ ] Set up `src/service-worker.ts` message router — handles all `chrome.runtime.onMessage` events
- [ ] Create `src/runtime/variable-resolver.ts` — resolves `{{variable}}` interpolation, built-in variables (`$url`, `$timestamp`, `$runId`, `$stepIndex`, `$iteration`, `$item`, etc.)
- [ ] Create `src/runtime/condition-evaluator.ts` — evaluates all condition types: `element-exists`, `element-missing`, `element-text`, `element-value`, `url-matches`, `variable`, `response-contains` with all operators
- [ ] Create `src/runtime/step-executor.ts` — sends step to content script via `chrome.tabs.sendMessage`, handles timeout and retry logic
- [ ] Create `src/runtime/workflow-runner.ts` — main orchestration loop: load workflow, iterate steps, handle branch/loop/stop/jump, evaluate conditions, handle `onError` (stop/skip/branch/retry)
- [ ] Create `src/runtime/run-recorder.ts` — writes RunRecord to storage on completion or failure, fires system notification
- [ ] Implement message handlers in service worker: `TRIGGER_WORKFLOW`, `STEP_RESULT`, `PAUSE_RUN`, `RESUME_RUN`, `STOP_RUN`, `GET_RUN_STATUS`, `PROMPT_RESPONSE`, `SAVE_WORKFLOW`, `GET_WORKFLOWS`, `DELETE_WORKFLOW`, `GET_RUN_HISTORY`
- [ ] Implement status broadcast to popup and toast on each step change
- [ ] **Commit and push using the ggg command only with message** — `feat: implement service worker runtime engine with full workflow orchestration`

---

## Phase 5 — Content Script (Step Executor)

- [ ] Set up `src/content-script.ts` message listener — receives steps from service worker
- [ ] Create `src/executor/selector-resolver.ts` — resolves primary selector, fallback chain, `@alias` resolution from site config; returns resolved element + stability score
- [ ] Create `src/executor/steps/click.ts` — click with button/doubleClick/waitBefore/scrollIntoView/force options
- [ ] Create `src/executor/steps/fill.ts` — fill with clearMethod/append/simulateTyping/typingDelay/pressEnter, supports `{{variable}}` and multi-value
- [ ] Create `src/executor/steps/wait.ts` — wait by duration/element/element-gone/text/network with timeout + onTimeout
- [ ] Create `src/executor/steps/scroll.ts` — scroll page or element by to/by/element/top/bottom with smooth/instant behaviour
- [ ] Create `src/executor/steps/navigate.ts` — navigate with waitUntil and timeout
- [ ] Create `src/executor/steps/submit.ts` — form submit with waitForNavigation
- [ ] Create `src/executor/steps/select.ts` — select by value/label/index
- [ ] Create `src/executor/steps/hover.ts` — hover with duration
- [ ] Create `src/executor/steps/keypress.ts` — keyboard events with modifier combos, repeat, delay
- [ ] Create `src/executor/steps/extract.ts` — extract text/html/value/attribute/style, save to variable with transform
- [ ] Create `src/executor/steps/screenshot.ts` — capture viewport/page/element, save as data URI, optional saveAs variable
- [ ] Create `src/executor/steps/tab.ts` — open/close/switch/close-others with switchTo/urlPattern/tabIndex/waitUntil/saveTabId
- [ ] Create `src/executor/steps/clipboard.ts` — read/write clipboard
- [ ] Create `src/executor/steps/storage-step.ts` — get/set/remove/clear localStorage or sessionStorage
- [ ] Create `src/executor/steps/log.ts` — write to run log with info/warn/error level
- [ ] Create `src/executor/steps/prompt.ts` — pause execution, send PROMPT_REQUEST to popup, wait for PROMPT_RESPONSE
- [ ] Create `src/executor/steps/set-variable.ts` — set variable with scope and transform
- [ ] Create `src/executor/toast-bridge.ts` — injects/updates/removes toast React root in shadow DOM
- [ ] **Commit and push using the ggg command only with message** — `feat: implement content script with all 18 step type executors and selector resolver`

---

## Phase 6 — Toast UI Surface

- [ ] Create `src/toast/main.tsx` — React root mounted inside shadow DOM injected by content script
- [ ] Create `src/features/toast/screen/toast-screen.tsx` — main component, receives run status via message port
- [ ] Create `src/features/toast/parts/step-label.tsx` — current step label updating in real time
- [ ] Create `src/features/toast/parts/step-counter.tsx` — "Step 3 of 8" progress display
- [ ] Create `src/features/toast/parts/status-dot.tsx` — 8px colour-coded status indicator with transitions
- [ ] Create `src/features/toast/parts/control-buttons.tsx` — pause, stop, expand, dismiss ghost buttons (sm size)
- [ ] Create `src/features/toast/parts/step-log-expander.tsx` — last 5 step logs shown on expand
- [ ] Create `src/features/toast/hooks/use-run-status.ts` — subscribes to service worker status broadcasts
- [ ] Implement toast animation: slide up + fade in (200ms ease-spring), slide down + fade out (150ms ease-in)
- [ ] Style: 300px wide, bottom-right 16px, radius-2xl, shadow-lg, backdrop blur
- [ ] Verify shadow DOM isolation (toast styles do not bleed into host page and vice versa)
- [ ] **Commit and push using the ggg command only with message** — `feat: implement runtime toast UI with shadow DOM isolation and spring animations`

---

## Phase 7 — Popup UI Surface

- [ ] Create `src/popup/main.tsx` — popup React root
- [ ] Create `src/features/popup/screen/popup-screen.tsx` — popup shell
- [ ] Create `src/features/popup/parts/active-runs-panel.tsx` — list of all running/paused workflows with step progress
- [ ] Create `src/features/popup/parts/run-controls.tsx` — pause/resume/stop/restart per active workflow
- [ ] Create `src/features/popup/parts/quick-override.tsx` — inject "wait N seconds" pause into current step
- [ ] Create `src/features/popup/parts/prompt-area.tsx` — surfaces prompt UI (text/password/select with countdown) when workflow hits a prompt step
- [ ] Create `src/features/popup/parts/recent-runs.tsx` — last 5 completed runs with status, name, timestamp
- [ ] Create `src/features/popup/hooks/use-active-runs.ts` — subscribes to service worker status, returns all active runs
- [ ] Create `src/features/popup/hooks/use-runtime-prompts.ts` — handles prompt request/response lifecycle
- [ ] Implement select prompt countdown: timer display, auto-select on 0, "More time" reset, "Skip" to extend indefinitely
- [ ] Add "Jump to side panel" button
- [ ] Style: 360px wide, max 600px tall
- [ ] **Commit and push using the ggg command only with message** — `feat: implement popup runtime dashboard with active runs, controls, and prompt UI`

---

## Phase 8 — Side Panel: Workflows List Tab

- [ ] Create `src/side-panel/main.tsx` — side panel React root with tab navigation
- [ ] Create `src/features/side-panel/screen/side-panel-screen.tsx` — tab host (Workflows, Builder, Config, History, Site Config, Settings)
- [ ] Create `src/features/side-panel/features/workflows-list/screen/workflows-list-screen.tsx`
- [ ] Create `src/features/side-panel/features/workflows-list/parts/workflow-item.tsx` — name, site, last run status badge, enable toggle, run/edit/duplicate/delete actions
- [ ] Create `src/features/side-panel/features/workflows-list/parts/workflow-search.tsx` — search input with live filter
- [ ] Create `src/features/side-panel/features/workflows-list/parts/workflow-filters.tsx` — filter by site, tag, status (enabled/disabled/last failed)
- [ ] Create `src/features/side-panel/features/workflows-list/hooks/use-workflows.ts` — TanStack Query wrapper over storage service
- [ ] Implement duplicate workflow action (copies with new ID)
- [ ] Implement export as JSON file download
- [ ] Implement import from JSON file (schema validation before save)
- [ ] Implement enable/disable toggle (auto-triggers off, manual always available)
- [ ] Implement tags — assign and filter by freeform tags
- [ ] Implement empty state: "No workflows yet — record one to get started" with CTA
- [ ] **Commit and push using the ggg command only with message** — `feat: implement workflows list tab with full management actions (enable, duplicate, export, import, tags)`

---

## Phase 9 — Side Panel: Visual Builder Tab

- [ ] Create `src/features/side-panel/features/builder/screen/builder-screen.tsx` — canvas + inspector layout
- [ ] Create `src/features/side-panel/features/builder/parts/flow-canvas.tsx` — node-based visual flow, drag-to-reorder steps
- [ ] Create `src/features/side-panel/features/builder/parts/step-node.tsx` — node card showing step type, label, status badge
- [ ] Create `src/features/side-panel/features/builder/parts/step-connector.tsx` — visual line connector between nodes with branch forks
- [ ] Create `src/features/side-panel/features/builder/parts/step-inspector.tsx` — right panel showing selected step full config with all options per step type
- [ ] Create `src/features/side-panel/features/builder/parts/record-toolbar.tsx` — record/stop record controls
- [ ] Create `src/features/side-panel/features/builder/hooks/use-builder-state.ts` — manages selected step, dirty state, add/remove/reorder steps
- [ ] Implement step add panel — browse and add any of the 18 step types + control flow nodes
- [ ] Implement per-step config forms in inspector for all 18 step types
- [ ] Implement branch node — shows then/else paths and mergeAt connector
- [ ] Implement loop node — shows count/while/for-each config and loop body steps
- [ ] Implement stop and jump nodes
- [ ] Implement trigger config panel — manual, url-match trigger options
- [ ] Live sync builder state → JSON editor (both directions)
- [ ] **Commit and push using the ggg command only with message** — `feat: implement visual builder tab with node canvas, step inspector, and all step type forms`

---

## Phase 10 — Side Panel: JSON Config, Run History, Site Config, Settings Tabs

- [ ] Create `src/features/side-panel/features/json-config/screen/json-config-screen.tsx` — raw JSON textarea with syntax highlighting (monospace), live sync with builder
- [ ] Create `src/features/side-panel/features/json-config/hooks/use-json-sync.ts` — bidirectional sync, parse error display
- [ ] Create `src/features/side-panel/features/run-history/screen/run-history-screen.tsx` — list of runs for selected workflow
- [ ] Create `src/features/side-panel/features/run-history/parts/run-item.tsx` — run row: ID, trigger type, timestamps, status badge, step count
- [ ] Create `src/features/side-panel/features/run-history/parts/run-detail.tsx` — full run output: steps, variable outputs, screenshots, error details, console logs
- [ ] Create `src/features/side-panel/features/run-history/hooks/use-run-history.ts`
- [ ] Implement replay run — re-runs with same variable inputs as that run
- [ ] Create `src/features/side-panel/features/site-config/screen/site-config-screen.tsx`
- [ ] Create `src/features/side-panel/features/site-config/parts/alias-editor.tsx` — add/edit/delete `@alias → selector` pairs
- [ ] Create `src/features/side-panel/features/site-config/parts/intercept-rules.tsx` — add/edit/delete intercept rules with read/modify action config
- [ ] Create `src/features/side-panel/features/settings/screen/settings-screen.tsx` — selector strategy preference, default timeouts, default retries, notification preferences
- [ ] **Commit and push using the ggg command only with message** — `feat: implement JSON config, run history, site config, and settings tabs`

---

## Phase 11 — Record Mode

- [ ] Create `src/recorder/action-capture.ts` — DOM event listeners for click, input change, form submit, navigation
- [ ] Create `src/recorder/selector-generator.ts` — generates primary CSS/XPath selector + fallback list from clicked element
- [ ] Create `src/recorder/stability-scorer.ts` — scores each selector: data-testid/aria/id → 0.9+, text/role → 0.8+, class → 0.6+, positional → 0.3
- [ ] Create `src/recorder/recorder.ts` — main recorder that wires up capture, generates step objects, sends to service worker for appending to workflow
- [ ] Wire record start/stop to content script toggle
- [ ] Wire record-toolbar buttons in builder to send START_RECORD / STOP_RECORD messages
- [ ] Display stability score on each captured step in builder
- [ ] Flag steps with stability < 0.5 with a warning icon in the node
- [ ] **Commit and push using the ggg command only with message** — `feat: implement record mode with smart selector generation and stability scoring`

---

## Phase 12 — Network Interception

- [ ] Create `src/runtime/network-interceptor.ts` — registers/removes intercept rules keyed to active site config
- [ ] Create `src/executor/page-fetch-proxy.ts` — injected into page context via `scripting.executeScript`, intercepts `window.fetch` and `XMLHttpRequest` before network
- [ ] Implement read-only capture — intercept response, capture body/status/headers, save to run variable or global store
- [ ] Implement full response override — return replacement body + headers, never send original request
- [ ] Implement header-only override — pass original body through, modify status + content-type
- [ ] Implement conditional override — evaluate condition before deciding to override
- [ ] Log all intercepted requests to run output: timestamp, URL, method, status, body size
- [ ] Wire intercept rules from site config to runtime on workflow start
- [ ] **Commit and push using the ggg command only with message** — `feat: implement network interception with read capture and full response override`

---

## Phase 13 — Debug Tools

- [ ] Create `src/runtime/dry-run-mode.ts` — run workflow without real actions; each step highlights target element and logs "Would [action] [selector]"
- [ ] Create `src/executor/element-highlighter.ts` — injects blue 2px outline over resolved element, removes after step advances
- [ ] Implement step-by-step mode — workflow pauses after each step and waits for "Next" from popup before continuing
- [ ] Create `src/features/popup/parts/step-by-step-controls.tsx` — "Next step" button shown in popup when step-by-step mode active; shows full step config + resolved selector
- [ ] Create `src/features/side-panel/features/builder/parts/selector-inspector.tsx` — hover overlay on any page element showing generated selector, stability score, all fallback selectors
- [ ] Implement console log capture — optionally capture `console.log/warn/error` during run and append timestamped to run output
- [ ] **Commit and push using the ggg command only with message** — `feat: implement debug tools (dry run, step-by-step mode, selector inspector, console capture)`

---

## Phase 14 — Variables & State System

- [ ] Ensure variable resolver handles all 4 scopes: run (per-run), workflow (persists between runs of same workflow), global (all workflows), site (all workflows on same domain)
- [ ] Implement `setVariable` step with scope and transform options
- [ ] Implement all built-in variables: `$url`, `$title`, `$timestamp`, `$date`, `$time`, `$runId`, `$stepIndex`, `$iteration`, `$item`
- [ ] Ensure `{{variable}}` interpolation works in all step option fields that accept strings
- [ ] Implement multi-value fill config — prompt user to select from saved options list with countdown
- [ ] Implement ask-at-runtime fill config — pause workflow, prompt in popup, store to optional variable, never persist
- [ ] Wire workflow-scope and site-scope variable persistence to storage service
- [ ] **Commit and push using the ggg command only with message** — `feat: implement full variable system with all scopes, interpolation, and multi-value inputs`

---

## Phase 15 — URL-Match Trigger & Manual Trigger

- [ ] Implement URL-match trigger in service worker — listen to `chrome.tabs.onUpdated` for navigation events
- [ ] Match tab URLs against all enabled workflows' url-match trigger patterns (exact/prefix/glob/regex)
- [ ] Respect `matchOn` setting: load / domcontentloaded / urlchange
- [ ] Respect `once` setting: fire only once per tab session
- [ ] Respect `delay` setting: wait N ms after match before starting
- [ ] Implement manual trigger — side panel run button and popup run button both send TRIGGER_WORKFLOW
- [ ] **Commit and push using the ggg command only with message** — `feat: implement URL-match trigger with pattern matching and manual trigger`

---

## Phase 16 — Options Page & Completion Notifications

- [ ] Create `src/options/main.tsx` — options page React root
- [ ] Create `src/features/options/screen/options-screen.tsx` — extension-wide settings: selector strategy preference, default timeouts, sync config, notification settings
- [ ] Wire options settings to `chrome.storage.sync`
- [ ] Implement system notification on workflow completion/failure using `chrome.notifications`
- [ ] Request notifications permission on first use
- [ ] **Commit and push using the ggg command only with message** — `feat: implement options page and completion notifications`

---

## Phase 17 — Polish, QA & Store Readiness

- [ ] Audit all UI surfaces at their hard size constraints: popup 360px, toast 300px, side panel 400px+
- [ ] Verify dark mode tokens render correctly across all surfaces
- [ ] Verify all animations respect `prefers-reduced-motion`
- [ ] Add extension icons: 16px, 32px, 48px, 128px (required for store listing)
- [ ] Write `src/popup/popup.html`, `src/side-panel/side-panel.html`, `src/options/options.html` with correct meta tags and CSP headers
- [ ] Set correct Content Security Policy in manifest.json (no `unsafe-eval`, no `unsafe-inline`)
- [ ] Test full install flow: clone repo → `pnpm build` → Chrome → Load unpacked → `dist/`
- [ ] Test one full end-to-end workflow: record → build → run → view history → export JSON → import JSON
- [ ] Verify no console errors in service worker, content script, popup, side panel, toast
- [ ] Verify extension works across multiple tabs simultaneously
- [ ] Ensure `dist/` builds cleanly in CI (no local machine dependencies)
- [ ] **Commit and push using the ggg command only with message** — `feat: MVP complete — polish, icon assets, CSP, and Chrome store readiness`

---

## Done

All phases complete. Extension is loadable unpacked and ready for Chrome Web Store submission.
