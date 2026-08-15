import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Tag } from '@/lib/types'

export const TAG_COLORS = [
  { value: 'default', className: 'border-border bg-muted text-muted-foreground' },
  { value: 'blue', className: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { value: 'green', className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { value: 'amber', className: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { value: 'red', className: 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400' },
  { value: 'purple', className: 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { value: 'cyan', className: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
] as const

export type TagColor = (typeof TAG_COLORS)[number]['value']

export function colorClass(color: string): string {
  return TAG_COLORS.find((c) => c.value === color)?.className ?? TAG_COLORS[0].className
}

export function TagBadge({ tag, className }: { tag: Tag; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 w-fit shrink-0 items-center gap-1 rounded-4xl border px-2 text-xs font-medium',
        colorClass(tag.color),
        className,
      )}
    >
      {tag.name}
    </span>
  )
}

export function TagPicker({
  selected,
  onChange,
}: {
  selected: number[]
  onChange: (ids: number[]) => void
}) {
  const { tags, createTag } = useApp()
  const [name, setName] = useState('')
  const [color, setColor] = useState<TagColor>('default')
  const [adding, setAdding] = useState(false)

  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  const addTag = async () => {
    if (!name.trim()) return
    const tag = await createTag(name.trim(), color)
    toggle(tag.id)
    setName('')
    setColor('default')
    setAdding(false)
  }

  return (
    <div className="flex flex-col gap-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className={cn(
                'rounded-4xl border px-2 py-0.5 text-xs font-medium transition-all',
                selected.includes(tag.id)
                  ? colorClass(tag.color) + ' ring-2 ring-ring/50'
                  : 'border-input text-muted-foreground opacity-60 hover:opacity-100',
              )}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {adding ? (
        <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-2">
          <div className="flex gap-2">
            <Input
              placeholder="Nombre del tag"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              autoFocus
              className="h-7 text-xs"
            />
            <Button type="button" size="sm" variant="outline" onClick={addTag} disabled={!name.trim()}>
              <Plus /> Agregar
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            {TAG_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.value}
                onClick={() => setColor(c.value)}
                className={cn(
                  'size-5 rounded-full border transition-transform',
                  c.className,
                  color === c.value ? 'scale-110 ring-2 ring-ring' : 'opacity-60 hover:opacity-100',
                )}
              />
            ))}
          </div>
        </div>
      ) : (
        <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => setAdding(true)}>
          <Plus /> Nuevo tag
        </Button>
      )}
    </div>
  )
}

export function TagManager() {
  const { tags, deleteTag } = useApp()
  const [name, setName] = useState('')
  const [color, setColor] = useState<TagColor>('default')
  const { createTag } = useApp()

  const addTag = async () => {
    if (!name.trim()) return
    await createTag(name.trim(), color)
    setName('')
    setColor('default')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          placeholder="Nombre del tag"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTag()}
        />
        <Button onClick={addTag} disabled={!name.trim()}>
          <Plus /> Agregar
        </Button>
      </div>
      <div className="flex items-center gap-1.5">
        {TAG_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.value}
            onClick={() => setColor(c.value)}
            className={cn(
              'size-5 rounded-full border transition-transform',
              c.className,
              color === c.value ? 'scale-110 ring-2 ring-ring' : 'opacity-60 hover:opacity-100',
            )}
          />
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {tags.map((tag) => (
          <div key={tag.id} className="flex items-center justify-between rounded-lg border px-2.5 py-1.5">
            <TagBadge tag={tag} />
            <button
              onClick={() => deleteTag(tag.id)}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
              title={`Eliminar tag ${tag.name}`}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {tags.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay tags en este proyecto.</p>
        )}
      </div>
    </div>
  )
}