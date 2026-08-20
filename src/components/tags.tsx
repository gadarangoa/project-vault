import { useState } from 'react'
import { Plus, Tag as TagIcon, Trash2, X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import type { Tag } from '@/lib/types'

export const TAG_COLORS = [
  { value: 'default', className: 'border-border! bg-muted text-muted-foreground' },
  { value: 'blue', className: 'border-blue-500/30! bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { value: 'green', className: 'border-emerald-500/30! bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { value: 'amber', className: 'border-amber-500/30! bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { value: 'red', className: 'border-red-500/30! bg-red-500/10 text-red-600 dark:text-red-400' },
  { value: 'purple', className: 'border-purple-500/30! bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { value: 'cyan', className: 'border-cyan-500/30! bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
] as const

export type TagColor = (typeof TAG_COLORS)[number]['value']

export function colorClass(color: string): string {
  return TAG_COLORS.find((c) => c.value === color)?.className ?? TAG_COLORS[0].className
}

export function TagBadge({ tag, className, onRemove }: { tag: Tag; className?: string; onRemove?: () => void }) {
  if (onRemove) return <Badge className={cn(colorClass(tag.color), 'gap-1 pr-1', className)}>{tag.name}<button type="button" aria-label={`Quitar ${tag.name}`} title={`Quitar ${tag.name}`} className="inline-flex size-3.5 items-center justify-center rounded-full hover:bg-foreground/10" onClick={(event) => { event.stopPropagation(); onRemove() }}><X className="size-2.5" /></button></Badge>
  return (
    <Badge className={cn(colorClass(tag.color), className)}>{tag.name}</Badge>
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
              aria-pressed={selected.includes(tag.id)}
              onClick={() => toggle(tag.id)}
              className={cn(
                'inline-flex items-center justify-center rounded-4xl border px-2 py-0.5 text-xs font-medium transition-all',
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
                aria-label={`Color ${c.value}`}
                aria-pressed={color === c.value}
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

export function TagPopover({ selected, onChange }: { selected: number[]; onChange: (ids: number[]) => void }) {
  const { tags, createTag, deleteTag } = useApp()
  const [name, setName] = useState('')
  const [color, setColor] = useState<TagColor>('default')
  const [deleting, setDeleting] = useState<Tag | null>(null)

  const toggle = (id: number) => onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id])
  const addTag = async () => {
    if (!name.trim()) return
    const tag = await createTag(name.trim(), color)
    onChange([...selected, tag.id])
    setName('')
    setColor('default')
  }

  return <><DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon-sm" title="Etiquetas" aria-label="Etiquetas"><TagIcon /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-64 p-2"><p className="px-1 py-1 text-xs font-medium text-muted-foreground">Etiquetas</p><div className="flex min-h-6 flex-wrap gap-1.5">{selected.map((id) => { const tag = tags.find((item) => item.id === id); return tag ? <TagBadge key={tag.id} tag={tag} onRemove={() => toggle(tag.id)} /> : null })}</div><div className="mt-2 flex gap-2"><Input className="h-8 text-xs" placeholder="Nueva etiqueta..." value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void addTag() } }} /><Button type="button" size="sm" disabled={!name.trim()} onClick={() => void addTag()}>Añadir</Button></div><div className="mt-2 flex items-center gap-1.5">{TAG_COLORS.map((item) => <button key={item.value} type="button" aria-label={`Color ${item.value}`} aria-pressed={color === item.value} className={cn('size-4 rounded-full border', item.className, color === item.value ? 'ring-2 ring-ring' : 'opacity-60')} onClick={() => setColor(item.value)} />)}</div><DropdownMenuSeparator /><p className="px-1 py-1 text-xs text-muted-foreground">Existentes</p><div className="flex flex-col gap-1">{tags.length ? tags.map((tag) => <div key={tag.id} className="flex items-center gap-1"><button type="button" className="min-w-0 flex-1 text-left" aria-pressed={selected.includes(tag.id)} onClick={() => toggle(tag.id)}><TagBadge tag={tag} className={selected.includes(tag.id) ? 'ring-2 ring-ring/50' : 'opacity-60 hover:opacity-100'} /></button><button type="button" className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive" aria-label={`Eliminar etiqueta ${tag.name}`} title={`Eliminar etiqueta ${tag.name}`} onClick={() => setDeleting(tag)}><Trash2 className="size-3.5" /></button></div>) : <span className="px-1 text-xs text-muted-foreground">No hay etiquetas todavía.</span>}</div></DropdownMenuContent></DropdownMenu><AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar esta etiqueta?</AlertDialogTitle><AlertDialogDescription>Se quitará de todas las notas y secretos de este proyecto. Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={async () => { if (deleting) { await deleteTag(deleting.id); onChange(selected.filter((id) => id !== deleting.id)) } setDeleting(null) }}>Eliminar etiqueta</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>
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
            aria-label={`Color ${c.value}`}
            aria-pressed={color === c.value}
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
              type="button"
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
