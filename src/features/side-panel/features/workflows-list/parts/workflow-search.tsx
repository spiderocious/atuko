import { Input } from '@ui'

interface Props {
  value: string
  onChange: (v: string) => void
}

export function WorkflowSearch({ value, onChange }: Props) {
  return (
    <div className="px-3 pt-3">
      <Input
        label=""
        placeholder="Search workflows…"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}
