
Atuko (Driver in Yoruba)
Browser Workflow Automation Extension
Feature Specification  ·  MVP  ·  v0.1

A Chrome extension for building, recording, and running
personal browser automation workflows — without writing code.

Philosophy
Flōw is a personal browser automation tool built for engineers who are tired of doing the same thing in the browser every day. Not a testing framework. Not a no-code platform for non-technical users. A power tool — fast to set up, transparent in what it's doing, and designed to get out of the way.

Every workflow compiles to JSON. The visual builder writes JSON. Record mode writes JSON. The config editor is JSON. The runner only knows JSON. This is the single architectural decision that makes everything else work.
The runtime UI is not an afterthought — it lives in the browser as a toast, a popup, or a side panel depending on what the moment demands. When a workflow is running, the user is always informed, always in control.

Table of Contents
1.   Architecture Overview
2.   The Workflow JSON Schema
3.   Workflow Steps — Full Reference
4.   Network Interception
5.   Logic & Control Flow
6.   Triggers
7.   Variables & State
8.   Runtime UI — Toast, Popup & Side Panel
9.   Runtime Prompts & Multi-Value Inputs
10.  Developer & Debug Tools
11.  Workflow Management
12.  Storage & Sync
13.  Site Configuration
14.  Extension Permissions
15.  MVP Scope & V2 Backlog

1. Architecture Overview
Flōw is a Chrome Manifest V3 extension with four distinct layers: the builder (side panel), the runner (content script + service worker), the runtime UI (toast/popup), and the storage layer. These layers communicate via Chrome's messaging API.

Extension Surfaces
Surface
Role
Side Panel
Full workspace. Build workflows, edit configs, view run history, manage site settings. Only opens on demand.
Popup
Runtime dashboard. Shows live workflow status, controls (pause/stop/restart), step progress, and runtime prompts. Appears automatically when a workflow activates.
Toast (injected)
Non-intrusive in-page overlay. Appears at the corner of the active tab to show what's happening step by step. Does not block page interaction.
Options Page
Extension-wide settings: sync config, default timeouts, selector strategy preferences, notification settings.

Internal Communication
From → To
Method & Purpose
Side Panel → Service Worker
chrome.runtime.sendMessage — save workflow, trigger run, fetch history
Service Worker → Content Script
chrome.tabs.sendMessage — execute step, inject recorder, read DOM
Content Script → Service Worker
chrome.runtime.sendMessage — step result, recorded action, element data
Service Worker → Popup
chrome.runtime.sendMessage — live status updates, step progress, prompt requests
Content Script → Toast
Direct DOM manipulation — toast is injected and controlled by the content script

Execution Flow
1. Trigger fires (URL match, manual click, or chained from another workflow).
2. Service worker loads the workflow JSON from storage.
3. Service worker sends steps one at a time to the content script on the active tab.
4. Content script executes each step, resolves selectors, performs the action, and returns a result object.
5. Service worker evaluates the result: advance to next step, branch, retry, or abort.
6. Toast and popup receive status updates throughout and render them live.
7. On completion (or failure), the run record is written to storage and a notification is fired.

2. The Workflow JSON Schema
Every workflow is a single JSON object. This is the contract between the builder, the recorder, and the runner. All three read and write the same format.

Top-Level Structure
{
  "id": "uuid-v4",
  "name": "Login to Dashboard",
  "description": "Logs in with selected credentials and navigates to analytics",
  "site": "app.example.com",
  "version": 1,
  "enabled": true,
  "triggers": [ ...trigger objects ],
  "steps": [ ...step objects ],
  "variables": { "username": "", "last_run_result": "" },
  "siteConfig": "site-config-id",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}

Step Object Structure
{
  "id": "step-uuid",
  "type": "click",
  "label": "Click the submit button",    // shown in visual builder + runtime toast
  "selector": {
    "primary": "[data-testid='submit-btn']",
    "fallbacks": ["button[type='submit']", "//button[text()='Submit']"],
    "stabilityScore": 0.95               // 0-1, set by recorder
  },
  "options": { ...step-specific options },
  "onError": "stop" | "skip" | "branch",
  "onErrorBranchId": "step-uuid",        // if onError is branch
  "retries": 2,
  "retryDelay": 1000,                    // ms between retries
  "note": "Optional comment visible in builder"
}

3. Workflow Steps — Full Reference
Every action a workflow can perform is a step. Steps are executed in sequence unless a branch or jump redirects flow. All steps share the common onError, retries, and note fields defined in the schema above.

click
Clicks an element on the page. Resolves the selector, waits for the element to be present and visible, then dispatches a click event.

Option
Type
Description
selector
SelectorObject
Target element. Required.
button
"left" | "right" | "middle"
Mouse button to use. Default: left.
doubleClick
boolean
Whether to double-click. Default: false.
waitBefore
number
ms to wait before clicking. Default: 0.
scrollIntoView
boolean
Scroll element into viewport before clicking. Default: true.
force
boolean
Click even if element is obscured. Default: false.

fill
Types a value into an input, textarea, or contenteditable element. Clears the existing value first unless append is set. Supports static values, variables, and multi-value prompted inputs.

Option
Type
Description
selector
SelectorObject
Target input element. Required.
value
string | MultiValue
Value to type. Use {{variable}} syntax to reference a variable. Use MultiValue config for prompted selection.
append
boolean
Append to existing value instead of clearing first. Default: false.
simulateTyping
boolean
Type character by character. Default: false.
typingDelay
number
ms between characters when simulateTyping is true. Default: 50.
clearMethod
"select-all" | "triple-click" | "ctrl-a"
How to clear the field before filling. Default: select-all.
pressEnter
boolean
Press Enter after filling. Default: false.

wait
Pauses execution. Can wait for a fixed duration, for an element to appear or disappear, for an element to contain specific text, or for a network request to complete.

Option
Type
Description
type
"duration" | "element" | "element-gone" | "text" | "network"
What to wait for. Required.
duration
number
ms to wait. Used when type is duration.
selector
SelectorObject
Element to watch. Used when type is element, element-gone, or text.
text
string
Text content to wait for inside the element. Used when type is text.
networkPattern
string
URL pattern (string or regex) of the request to wait for. Used when type is network.
timeout
number
Maximum ms to wait before triggering onError. Default: 10000.
onTimeout
"stop" | "skip" | "branch"
What to do if timeout is reached. Default: stop.

scroll
Scrolls the page or a scrollable container. Can scroll to a position, by an amount, or to bring a specific element into view.

Option
Type
Description
target
"page" | SelectorObject
What to scroll. Default: page.
type
"to" | "by" | "element" | "top" | "bottom"
Scroll behaviour. Required.
x
number
Horizontal position or delta in px.
y
number
Vertical position or delta in px.
selector
SelectorObject
Element to scroll into view. Used when type is element.
behavior
"smooth" | "instant"
CSS scroll behaviour. Default: smooth.

navigate
Navigates the current tab to a URL or relative path. Supports {{variable}} interpolation in the URL. Waits for the page to finish loading before advancing to the next step.

Option
Type
Description
url
string
Full URL or relative path. Supports {{variable}} syntax. Required.
waitUntil
"load" | "domcontentloaded" | "networkidle"
When to consider navigation complete. Default: load.
timeout
number
Max ms to wait for load. Default: 15000.

submit
Triggers form submission on a target form element. Dispatches a submit event natively rather than clicking a button, ensuring form validation runs.

Option
Type
Description
selector
SelectorObject
The <form> element to submit. Required.
waitForNavigation
boolean
Wait for a page navigation after submit. Default: true.
navigationTimeout
number
Max ms to wait for navigation. Default: 10000.

select
Chooses a value from a <select> dropdown element by value, label, or index.

Option
Type
Description
selector
SelectorObject
The <select> element. Required.
by
"value" | "label" | "index"
How to identify the option. Default: value.
value
string | number
The value, visible text, or 0-based index to select. Supports {{variable}}.

hover
Moves the cursor over an element and holds. Useful for triggering dropdown menus, tooltips, or hover-state reveals before the next action.

Option
Type
Description
selector
SelectorObject
Element to hover. Required.
duration
number
ms to hold the hover before continuing. Default: 500.

keypress
Dispatches keyboard events to the page or a focused element. Supports single keys and modifier combinations.

Option
Type
Description
key
string
Key name (e.g. Enter, Tab, Escape, ArrowDown) or combo (e.g. Control+a). Required.
target
"page" | SelectorObject
Where to dispatch the event. Default: page.
repeat
number
How many times to press. Default: 1.
delay
number
ms between repeats. Default: 50.

extract
Reads a value from a DOM element and stores it as a named variable for use in subsequent steps. Can extract text content, an attribute value, inner HTML, or a computed style.

Option
Type
Description
selector
SelectorObject
Element to read from. Required.
property
"text" | "html" | "value" | "attribute" | "style"
What to extract. Default: text.
attribute
string
Attribute name when property is attribute (e.g. href, data-id).
styleProperty
string
CSS property name when property is style.
saveAs
string
Variable name to store the result. Required.
transform
"trim" | "lowercase" | "uppercase" | "number" | "none"
Optional transformation on the extracted value. Default: trim.

screenshot
Captures the current visible page or a specific element and saves it to the run output. Screenshots are accessible from run history in the side panel.

Option
Type
Description
target
"page" | "viewport" | SelectorObject
What to capture. Default: viewport.
filename
string
Output filename. Supports {{variable}} and {{timestamp}}. Default: screenshot-{{timestamp}}.png.
saveAs
string
Variable name to store the image data URI for use in later steps.

tab
Opens, closes, or switches between browser tabs. Supports passing variables to new tabs and waiting for new tabs to finish loading before continuing.

Option
Type
Description
action
"open" | "close" | "switch" | "close-others"
Tab operation to perform. Required.
url
string
URL for open action. Supports {{variable}}.
switchTo
"new" | "previous" | "index" | "match"
Which tab to switch to after open, or for switch action.
tabIndex
number
0-based tab index for switchTo: index.
urlPattern
string
URL pattern to match for switchTo: match.
waitUntil
"load" | "domcontentloaded"
Load state to wait for after open or switch. Default: load.
saveTabId
string
Variable name to store the new tab ID for later reference.

clipboard
Reads from or writes to the system clipboard. Requires the clipboardRead / clipboardWrite extension permissions.

Option
Type
Description
action
"read" | "write"
Clipboard operation. Required.
value
string
Value to write. Supports {{variable}}. Used when action is write.
saveAs
string
Variable name to store the read value. Used when action is read.

storage
Reads from or writes to the page's localStorage or sessionStorage, via an injected content script that runs in the page's execution context.

Option
Type
Description
action
"get" | "set" | "remove" | "clear"
Storage operation. Required.
store
"local" | "session"
Which storage to target. Default: local.
key
string
Storage key. Supports {{variable}}.
value
string
Value to set. Supports {{variable}}. Used when action is set.
saveAs
string
Variable name to store the retrieved value. Used when action is get.

log
Writes a message to the run log. Supports variable interpolation. Useful for debugging and tracking progress through complex flows.

Option
Type
Description
message
string
Log message. Supports {{variable}} syntax. Required.
level
"info" | "warn" | "error"
Log level. Affects colour in the run log. Default: info.

prompt
Pauses the workflow and shows a runtime prompt in the popup, asking the user to type a value or choose from options. See Section 9 for the full prompt system.

Option
Type
Description
type
"text" | "password" | "select"
Prompt type. Required.
message
string
Prompt message shown to user. Required.
options
string[]
Array of choices. Used when type is select.
countdown
number
Seconds before auto-selecting first option. 0 disables countdown. Default: 10.
saveAs
string
Variable name to store the user's input. Required.

4. Network Interception
Flōw can intercept fetch and XHR requests made by the page. Interception rules are defined at the site config level and apply to all workflows on that site. Individual workflow steps can also reference intercepted data via variables.

⚠ Manifest V3 limits response body modification. Full response body override is implemented via a service worker fetch handler injected into the page context, not via declarativeNetRequest. Headers (status, content-type etc) can be modified via declarativeNetRequest rules.

Intercept Rule Object
{
  "id": "rule-uuid",
  "name": "Mock /api/user endpoint",
  "enabled": true,
  "urlPattern": "/api/user",           // string or regex
  "methods": ["GET", "POST"],          // empty = all methods
  "action": "read" | "modify",

  // read action — save to variable
  "saveAs": "user_response",
  "saveTo": "run" | "global",          // run = this run only, global = persists

  // modify action — full override
  "responseBody": { ...replacement JSON },
  "responseHeaders": {
    "status": 200,
    "statusText": "OK",
    "Content-Type": "application/json"
  }
}

Intercept Behaviour
Behaviour
Detail
Read-only capture
The original request completes normally. The response body, status, and headers are captured and stored to the specified variable or global store.
Full response override
The page's fetch/XHR call is intercepted before it reaches the network. The configured replacement body and headers are returned instead. The original request is never sent.
Header-only override
responseBody is omitted. Only status code and headers are modified. The original response body passes through.
Conditional override
Override only fires when a condition is true (e.g. a variable equals a value). Same condition system as branching.
Logging
All intercepted requests are logged to the run output with timestamp, URL, method, status, and body size.

5. Logic & Control Flow
Workflows are not always linear. Flōw supports conditional branching, loops, and explicit flow control to handle real-world page variability.

Branch (if/else)
A branch step evaluates a condition and routes to one of two step sequences: the 'then' path or the 'else' path. Both paths eventually converge back to the main flow at a configured merge point.

{
  "type": "branch",
  "condition": { ...condition object },
  "then": ["step-id-a", "step-id-b"],   // step IDs to run if true
  "else": ["step-id-c"],                // step IDs to run if false
  "mergeAt": "step-id-d"               // step to continue at after either path
}

Condition Object
type
Checks...
Required fields
element-exists
Whether a selector resolves to at least one element
selector
element-missing
Whether a selector resolves to zero elements
selector
element-text
Whether an element's text matches a value
selector, operator, value
element-value
Whether an input's value matches
selector, operator, value
url-matches
Whether the current URL matches a pattern
pattern
variable
Whether a named variable matches a value
variable, operator, value
response-contains
Whether a saved API response body contains a key/value
responseVar, key, operator, value

Operators
Operator
Meaning
equals
Strict equality
not-equals
Not equal
contains
String contains substring
not-contains
String does not contain substring
starts-with
String starts with value
ends-with
String ends with value
greater-than
Numeric greater than
less-than
Numeric less than
is-empty
Value is empty string, null, or undefined
is-not-empty
Value is not empty

Loop
Repeats a sequence of steps either a fixed number of times or while a condition holds. Loop variables ($index, $iteration) are available inside the loop body.

Option
Type
Description
type
"count" | "while" | "for-each"
Loop type. Required.
count
number
Number of iterations. Used when type is count.
condition
ConditionObject
Continue while this is true. Used when type is while.
items
string
Variable name holding an array to iterate over. Used when type is for-each.
itemAs
string
Variable name for the current item inside the loop. Default: $item.
steps
string[]
Step IDs that form the loop body.
maxIterations
number
Safety cap. Loop aborts after this many iterations regardless. Default: 100.
breakOn
ConditionObject
Exit the loop early if this condition becomes true.

Stop
Explicitly ends the workflow run. Can be placed at any point in the flow, including inside branches or loops.

Option
Type
Description
reason
string
Human-readable reason written to the run log. Supports {{variable}}.
status
"success" | "failure" | "cancelled"
How the run is recorded. Default: success.

Jump
Unconditionally moves execution to a specific step by ID. Useful for implementing manual goto logic or skipping sections.

Option
Type
Description
stepId
string
ID of the step to jump to. Required.
condition
ConditionObject
Only jump if this condition is true. If omitted, always jumps.

6. Triggers
A workflow can have one or more triggers. When any trigger fires, the workflow starts. Multiple triggers on the same workflow mean the same steps run regardless of how it was started.

Trigger Types
Type
Description
manual
User clicks the Run button in the popup or side panel. Always available on every workflow regardless of other triggers.
url-match
Fires automatically when a tab navigates to a URL matching the configured pattern. Pattern can be exact, prefix, glob, or regex.
chain
Fires when a specified workflow completes successfully. The triggering workflow's output variables are passed in as inputs.

URL Match Trigger Options
Option
Type
Description
pattern
string
URL pattern to match. Required.
matchType
"exact" | "prefix" | "glob" | "regex"
How to apply the pattern. Default: glob.
matchOn
"load" | "domcontentloaded" | "urlchange"
When in the page lifecycle to fire. Default: load.
once
boolean
Only fire once per tab session, not on every reload. Default: false.
delay
number
ms to wait after the match event before starting the workflow. Default: 0.

Chain Trigger Options
Option
Type
Description
workflowId
string
ID of the workflow to listen for. Required.
onStatus
"success" | "any"
Only trigger if the source workflow finished with this status. Default: success.
passVariables
string[]
List of variable names from the source run to import. Empty = import all.

7. Variables & State
Variables are named values that flow through a workflow. They can be set from step outputs, user prompts, extracted DOM content, API responses, or prior run state. Reference them anywhere with {{variable_name}} syntax.

Variable Scopes
Scope
Lifetime & Access
Run
Lives for the duration of one workflow run. Created from step outputs, prompts, or extractions. Discarded when the run ends.
Workflow
Persists between runs of the same workflow. Set explicitly with a setVariable step or by configuring a step's saveAs with workflow scope. Useful for tracking last run state.
Global
Persists across all workflows and all runs. Accessible from any workflow on any site. Useful for shared credentials, counters, or flags.
Site
Scoped to all workflows on a specific site config. Shared between workflows on the same domain.

Built-in Variables
Variable
Value
{{$url}}
Current tab URL at the time of the step.
{{$title}}
Current page title.
{{$timestamp}}
ISO timestamp of the current step execution.
{{$date}}
Current date in YYYY-MM-DD format.
{{$time}}
Current time in HH:mm:ss format.
{{$runId}}
Unique ID for the current run.
{{$stepIndex}}
0-based index of the current step.
{{$iteration}}
Current loop iteration index (inside loops only).
{{$item}}
Current loop item (inside for-each loops only).

setVariable Step
A utility step for explicitly creating or updating a variable at a specific point in the flow.

Option
Type
Description
name
string
Variable name. Required.
value
string
Value to set. Supports {{variable}} interpolation. Required.
scope
"run" | "workflow" | "global" | "site"
Variable scope. Default: run.
transform
"trim" | "lowercase" | "uppercase" | "number" | "json-parse" | "none"
Optional transformation on the value. Default: none.

Multi-Value Inputs
Any fill step can be configured with multiple saved values instead of a single string. When the step is reached, the user is prompted to choose, with an optional countdown to auto-select.

{
  "type": "fill",
  "selector": { ... },
  "value": {
    "type": "multi",
    "prompt": "Choose login account",
    "countdown": 10,
    "options": [
      { "label": "Work account", "value": "work@example.com" },
      { "label": "Personal account", "value": "personal@example.com" }
    ]
  }
}

8. Runtime UI — Toast, Popup & Side Panel
The runtime UI is the user's window into a running workflow. It is non-blocking, always dismissible, and always gives the user control. Three surfaces serve different moments.

Toast (In-Page)
A small overlay injected into the active tab's DOM. Appears automatically when any workflow on that site activates. Positioned at the bottom-right by default (configurable per workflow).

Element
Description
Workflow name
Name of the running workflow shown at the top.
Current step
Label of the step currently executing, updating in real time.
Step counter
Progress indicator e.g. 'Step 3 of 8'.
Status indicator
Colour-coded dot: grey (idle), blue (running), amber (waiting/paused), green (success), red (error).
Pause button
Pauses after the current step completes. Workflow holds state until resumed.
Stop button
Aborts the workflow immediately. Prompts for confirmation if mid-flow.
Expand arrow
Expands toast to show last 5 step logs inline.
Dismiss button
Hides the toast. Workflow continues running in background.

Popup
Opens from the toolbar icon. Serves as the runtime dashboard — shows all currently active workflows, their status, and allows control. Also surfaces runtime prompts (see Section 9) when the workflow needs user input.

Section
Description
Active runs panel
Lists all workflows currently running or paused, with live step progress.
Run controls
Pause, resume, stop, restart buttons per active workflow.
Quick override
Inject a 'wait N seconds' pause into the current step without editing the workflow. Useful when a page is slow.
Prompt area
When a workflow hits a prompt step, the popup surfaces the input UI here. Workflow is paused until the user responds.
Recent runs
Last 5 completed runs with status, workflow name, and timestamp. Click to open full run details in side panel.
Jump to side panel
Button to open the full side panel from the popup.

Side Panel
The full workspace. Opens via the toolbar or from the popup. Used for building, recording, editing, and reviewing — not typically open during a run, but can be used to monitor longer workflows.

Tab
Description
Workflows
List of all workflows with enable/disable toggle, run button, edit button, and last run status.
Builder
Visual flow editor for the selected workflow. Drag-and-drop nodes, connect steps, configure options in side inspector.
Config
Raw JSON editor for the selected workflow. Live sync with the visual builder.
Run History
Full run log for the selected workflow. Each run shows all steps, timing, outputs, screenshots, and errors.
Site Config
Shared configuration for the current site: selector aliases, intercept rules, shared variables.
Settings
Extension-wide settings: selector strategy, default timeouts, sync options, notification preferences.

9. Runtime Prompts & Multi-Value Inputs
Some workflows need user input at run time that cannot or should not be stored — passwords, OTPs, dynamic choices. Flōw pauses the workflow and surfaces a prompt in the popup, then continues with the user's response.

Prompt Types
Type
Description
text
Free text input. User types any value. The value is stored to the configured variable and is not persisted after the run.
password
Same as text but masked. Value is never written to run logs or history.
select
Shows a list of options. User selects one. Supports countdown auto-select. Options can be static or pulled from a variable holding an array.

Countdown Behaviour
When a select prompt has a countdown configured, a timer appears in the popup counting down from N seconds. When it reaches zero, the first option is automatically selected and the workflow resumes.
The user can: pick an option at any time to skip the countdown, press 'More time' to reset the countdown, or press 'Skip' to extend indefinitely.

Ask-at-Runtime Fields
Any fill step's value can be marked as ask-at-runtime instead of providing a stored value. The step configuration looks like this:

"value": {
  "type": "ask",
  "prompt": "Enter your OTP",
  "inputType": "text" | "password",
  "saveAs": "otp_value",              // optional — save to variable for reuse
  "persist": false                    // never save this to history
}

10. Developer & Debug Tools
Flōw is built by an engineer for engineers. Debugging a broken workflow should be fast and obvious.

Dry Run Mode
Executes the workflow without performing any real actions. Instead of clicking, filling, or navigating, each step highlights the target element on the page and logs what it would have done. Branches evaluate normally.
Dry run mode is the safest way to verify a new workflow before trusting it on a real form or live dashboard.

Dry Run Output
Description
Element highlight
A blue outline appears around the resolved target element for each step.
Would-do log
Each step writes 'Would click [selector]' / 'Would fill [selector] with [value]' etc to the run log.
Selector stability
Selector stability scores are shown next to each resolved element.
Unresolved selectors
Steps where the selector resolves to nothing are flagged in red.

Step-by-Step Execution
Pause between steps mode. The workflow executes one step, then pauses and waits for the user to press 'Next' in the popup before continuing. Useful for diagnosing exactly where a flow breaks.
In this mode the popup shows the full step config, resolved selector, and the element it's about to act on.

Selector Inspector
Accessible from the side panel builder and as a standalone overlay in the tab. Hover over any element on the page to see the selector Flōw would generate for it, its stability score, and all fallback selectors.

Stability Score
Meaning
0.9 – 1.0
High confidence. Uses data-testid, aria-label, or unique ID.
0.7 – 0.89
Good. Uses visible text, role, or specific attribute.
0.5 – 0.69
Moderate. Uses class names that may not be unique or stable.
0.0 – 0.49
Fragile. Falls back to positional selectors (nth-child etc). Flagged with a warning.

Console Log Capture
Optionally capture console.log, console.warn, and console.error output from the page during a run. Captured logs are appended to the run output, timestamped to the step that was executing when they fired.

Error Handling Per Step
onError value
Behaviour
stop
Abort the workflow immediately. Write the error to the run log. Mark the run as failed.
skip
Log the error and move to the next step as if this one succeeded.
branch
Jump to a specific fallback step defined by onErrorBranchId. Useful for building recovery paths.
retry
Retry the step up to the configured retries count with retryDelay ms between attempts. If still failing after all retries, fall through to onError behaviour.

11. Workflow Management
Managing a growing library of workflows should be as frictionless as the workflows themselves.

Workflow List Features
Feature
Description
Enable / disable toggle
Turn a workflow's auto-triggers on or off without deleting it. Manual trigger always works regardless of this toggle.
Duplicate
Creates a copy of any workflow as a new draft. All steps, options, and site config reference are copied.
Export as JSON
Downloads the workflow JSON as a file. Portable — can be imported into any Flōw installation.
Import from JSON
Load a workflow from a JSON file. Validates the schema before importing.
Search and filter
Filter workflows by name, site, tag, or status (enabled, disabled, last failed).
Tags
Assign freeform tags to workflows for organisation. Filter by tag in the list view.
Run now
Manually trigger any workflow from the list, regardless of trigger config.
Last run status
Each workflow shows its last run: timestamp, status (success/failure), and step count.

Run History
Field
Description
Run ID
Unique identifier for the run.
Trigger type
How it was started: manual, url-match, chain.
Start / end time
Timestamps for when the run began and completed.
Status
success, failed, cancelled, or paused.
Steps completed
Count of steps completed vs total.
Failed step
If failed, which step caused it and the error message.
Output
All extracted variables, screenshots, and captured API responses from the run.
Console logs
Page console output if capture was enabled.
Replay
Re-run with the same inputs as this run (uses saved variable values from the run).

12. Storage & Sync
Workflows live locally by default. Cloud sync is optional and additive — it never changes how local-only usage works.

Local Storage
All workflows, site configs, run history, and global variables are stored in Chrome's chrome.storage.local API. No network required for local-only usage. Data persists across browser restarts.

Stored item
Location
Workflow definitions
chrome.storage.local — keyed by workflow ID
Site configs
chrome.storage.local — keyed by hostname
Global variables
chrome.storage.local — single 'globalVars' key
Run history
chrome.storage.local — keyed by workflow ID, last 50 runs per workflow
Screenshots
chrome.storage.local — stored as data URIs, purged after 7 days
Extension settings
chrome.storage.sync — small settings object synced automatically by Chrome across devices

Cloud Sync (Optional)
When enabled, workflows are synced to a configured endpoint. Sync is bidirectional — changes on any device propagate to others. Conflict resolution is last-write-wins per workflow.

Sync Feature
Description
Export all
One-click export of all workflows and site configs as a single JSON bundle.
Import bundle
Load a full JSON bundle to restore all workflows on a new device or installation.
Share workflow
Generate a shareable link or JSON snippet for a single workflow.
Sync endpoint config
Users can point sync to their own server, a GitHub Gist, or a future Flōw cloud service.

13. Site Configuration
Site config is a shared configuration object attached to a domain. All workflows for that domain inherit and can reference it. Define things once, use them everywhere on that site.

Site Config Object
Field
Description
hostname
Domain this config applies to (e.g. app.example.com). Required.
name
Human-readable site name.
baseUrl
Base URL prepended to relative paths in navigate steps.
aliases
Named selector aliases: { 'submit-btn': "[data-testid='submit']" }. Reference in steps as @submit-btn.
interceptRules
Array of intercept rule objects that apply to all workflows on this site.
sharedVariables
Site-scoped variables shared across all workflows on this domain.
defaultTimeout
Default wait timeout in ms for all steps on this site. Overridable per step.
defaultRetries
Default retry count for all steps on this site. Overridable per step.

Selector Aliases
Instead of repeating a complex selector across 10 workflows, define it once in site config and reference it by name. When the site updates its DOM, fix the alias once.

"aliases": {
  "login-btn":    "[data-testid='login-button']",
  "username-field": "#email-input",
  "nav-dashboard": "nav a[href='/dashboard']"
}

In a step selector, reference as: "@login-btn" — Flōw resolves it from the site config at runtime.

14. Extension Permissions
Flōw requests the minimum permissions necessary for each feature. Some permissions are optional and only requested when the user first uses a feature that requires them.

Permission
Required for
tabs
Detecting URL changes, switching tabs, reading current tab URL.
activeTab
Injecting content scripts into the current tab on demand.
scripting
Injecting content scripts and the page-context fetch interceptor.
storage
Storing workflows, run history, and variables locally.
webRequest (optional)
Header-level network interception. Requested on first use of an intercept modify rule.
notifications
Completion notifications. Requested on first use.
clipboardRead (optional)
Reading from the clipboard in clipboard steps. Requested on first use.
clipboardWrite (optional)
Writing to the clipboard in clipboard steps. Requested on first use.
sidePanel
Opening the side panel UI.
host_permissions: <all_urls>
Running workflows on any site the user configures. Could be scoped to specific sites but all_urls gives the broadest flexibility for a personal tool.

15. MVP Scope & V2 Backlog
MVP ships everything needed to run real daily workflows reliably. V2 adds sophistication, sharing, and ecosystem features.

MVP — In Scope
Feature
Notes
All step types
click, fill, wait, scroll, navigate, submit, select, hover, keypress, extract, screenshot, tab, clipboard, storage, log, prompt, setVariable
Branch + loop + stop + jump
Full control flow
All condition types
element-exists/missing, element-text/value, url-matches, variable, response-contains
URL-match trigger + manual trigger
Chain trigger deferred to V2
Fetch read + full response override
Including status and header overrides
Record mode
Smart selector inference, stability scoring, basic action capture
Visual flow builder
Node-based, full step configuration in inspector
JSON config editor
Live sync with visual builder
Toast runtime UI
Live step progress, pause/stop/dismiss
Popup runtime UI
Active runs, controls, quick wait override, recent runs
Side panel
Workflows list, builder, config, history, site config, settings
Runtime prompts
text, password, select with countdown
Multi-value inputs
ask-at-runtime and saved multi-option
Dry run mode
Element highlight + would-do logging
Step-by-step mode
Manual advance between steps
Selector inspector
Hover overlay with stability scores
Per-step error handling
stop, skip, branch, retry
Conditional wait with timeout
Element, duration, network, text
Variables — run + workflow + global + site scope
{{variable}} interpolation everywhere
Site config with aliases + shared intercept rules

Workflow enable/disable, duplicate, export, import

Search/filter workflows
By name, site, tag, status
Run history
Last 50 runs per workflow, full output
Completion notifications
System notification on finish
Local-only storage
No account required

V2 Backlog
Feature
Reason deferred
Chain trigger
Requires inter-workflow messaging bus. Solid V2 foundation needed first.
Cloud sync
Needs auth system. Local-first is sufficient for MVP.
Schedule trigger (cron)
Requires a background keep-alive mechanism constrained by MV3.
Workflow sharing / marketplace
Needs cloud infrastructure.
AI-assisted selector repair
When a selector breaks, Claude suggests a fix based on page context.
AI-assisted workflow generation
Describe what you want to automate in English, get a workflow.
iframe support
Cross-origin iframes require additional permission model work.
Mobile (Firefox Android)
Different extension API surface.
Team/shared workspaces
Multi-user access control.
Webhook trigger
Trigger workflows from external services.
For-each loop over API data
Iterate a loop using a fetched array. Needs solid variable system first.

End of Specification
Flōw MVP v0.1 — Subject to revision during implementation
