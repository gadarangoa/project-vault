import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Download, Files, Layers3, MoreHorizontal, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { VariableGroup, VariableGroupInput, VariableGroupVariableInput } from '@/lib/types'

function emptyVariable(): VariableGroupVariableInput { return { key: '', value: '' } }

function exportContent(group: VariableGroup): string {
  return group.variables.map(({ key, value }) => `${key}=${value.replaceAll('\\', '\\\\').replace(/\r?\n/g, '\\n')}`).join('\n')
}

function downloadGroup(group: VariableGroup) {
  const blob = new Blob([exportContent(group)], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  const slug = group.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  anchor.download = `.env.${slug || 'variables'}`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 100)
}

function GroupEditor({ open, onOpenChange, group }: { open: boolean; onOpenChange: (open: boolean) => void; group?: VariableGroup | null }) {
  const { selectedProject, createVariableGroup, updateVariableGroup } = useApp()
  const editing = Boolean(group)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [variables, setVariables] = useState<VariableGroupVariableInput[]>([emptyVariable()])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setName(group?.name ?? '')
    setDescription(group?.description ?? '')
    setVariables(group?.variables.map(({ key, value }) => ({ key, value })) || [emptyVariable()])
    setError('')
  }
  useEffect(() => {
    if (!open) return
    setName(group?.name ?? '')
    setDescription(group?.description ?? '')
    setVariables(group?.variables.map(({ key, value }) => ({ key, value })) || [emptyVariable()])
    setError('')
  }, [open, group])
  const updateRow = (index: number, field: keyof VariableGroupVariableInput, value: string) => setVariables((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  const submit = async () => {
    if (!selectedProject || !name.trim()) { setError('El nombre del grupo es obligatorio.'); return }
    const cleaned = variables.filter((item) => item.key.trim() || item.value)
    if (cleaned.some((item) => !item.key.trim())) { setError('Cada variable con valor debe tener una clave.'); return }
    const keys = cleaned.map((item) => item.key.trim())
    if (new Set(keys).size !== keys.length) { setError('No puede haber claves repetidas dentro del grupo.'); return }
    setSaving(true); setError('')
    const input: VariableGroupInput = { projectId: selectedProject.id, name: name.trim(), description: description.trim(), variables: cleaned.map((item) => ({ key: item.key.trim(), value: item.value })) }
    try { if (group) await updateVariableGroup(group.id, input); else await createVariableGroup(input); onOpenChange(false) } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar el grupo.') } finally { setSaving(false) }
  }

  return <Dialog open={open} onOpenChange={(next) => { if (next) reset(); onOpenChange(next) }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>{editing ? 'Editar grupo de variables' : 'Nuevo grupo de variables'}</DialogTitle><DialogDescription>Organiza las variables de un entorno en un solo lugar y expórtalas cuando las necesites.</DialogDescription></DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-2"><Label htmlFor="group-name">Nombre</Label><Input id="group-name" placeholder="Ej: dev, qa, demos" value={name} onChange={(event) => setName(event.target.value)} autoFocus /></div>
        <div className="grid gap-2"><Label htmlFor="group-description">Descripción (opcional)</Label><Textarea id="group-description" placeholder="Qué contiene este entorno..." value={description} onChange={(event) => setDescription(event.target.value)} rows={2} /></div>
        <div className="grid gap-2"><div className="flex items-center justify-between"><Label>Variables</Label><span className="text-xs text-muted-foreground">Las claves deben ser únicas</span></div><div className="grid gap-2">
          {variables.map((item, index) => <div key={index} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto] gap-2 rounded-lg border bg-muted/20 p-2 sm:border-0 sm:bg-transparent sm:p-0"><Input aria-label={`Clave ${index + 1}`} className="font-mono" placeholder="API_URL" value={item.key} onChange={(event) => updateRow(index, 'key', event.target.value)} /><Input aria-label={`Valor ${index + 1}`} className="font-mono" placeholder="https://..." value={item.value} onChange={(event) => updateRow(index, 'value', event.target.value)} /><Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => setVariables((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Eliminar variable ${index + 1}`}><X /></Button></div>)}
        </div><Button type="button" variant="outline" size="sm" className="mt-1 w-fit" onClick={() => setVariables((current) => [...current, emptyVariable()])}><Plus data-icon="inline-start" /> Agregar variable</Button></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </div>
      <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={() => void submit()} disabled={saving}>{saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear grupo'}</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}

export function ProjectPlaceholderPage() {
  return <VariableGroupsPage />
}

function VariableGroupsPage() {
  const { variableGroups, selectedProject, duplicateVariableGroup, deleteVariableGroup } = useApp()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<VariableGroup | null>(null)
  const [deleting, setDeleting] = useState<VariableGroup | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const openNew = () => { setEditing(null); setEditorOpen(true) }
  const openEdit = (group: VariableGroup) => { setEditing(group); setEditorOpen(true) }
  const copyGroup = async (group: VariableGroup) => { await navigator.clipboard.writeText(exportContent(group)); setCopiedId(group.id); window.setTimeout(() => setCopiedId((current) => current === group.id ? null : current), 1800) }
  const countLabel = useMemo(() => `${variableGroups.length} ${variableGroups.length === 1 ? 'grupo' : 'grupos'}`, [variableGroups.length])

  return <>
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4"><div><h2 className="text-lg font-semibold tracking-tight">Grupos de variables</h2><p className="text-sm text-muted-foreground">Configura entornos completos para {selectedProject?.name ?? 'este proyecto'}.</p></div><Button size="sm" onClick={openNew}><Plus data-icon="inline-start" /> Nuevo grupo</Button></div>
      <div className="flex items-center gap-2"><span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{countLabel}</span><span className="text-xs text-muted-foreground">Variables agrupadas por entorno</span></div>
      {variableGroups.length === 0 ? <Empty className="min-h-64 animate-rise-in"><EmptyHeader><EmptyMedia variant="icon"><Layers3 /></EmptyMedia><EmptyTitle>No hay grupos todavía</EmptyTitle><EmptyDescription>Crea un grupo para guardar las variables de dev, qa, demos o cualquier entorno.</EmptyDescription></EmptyHeader><Button onClick={openNew}><Plus data-icon="inline-start" /> Crear primer grupo</Button></Empty> : <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {variableGroups.map((group, index) => <div key={group.id} className="glass-panel futuristic-card animate-rise-in rounded-xl border bg-card p-4 shadow-none" style={{ animationDelay: `${Math.min(index, 8) * 75}ms` }}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-semibold">{group.name}</h3><p className="mt-1 line-clamp-2 min-h-5 text-xs text-muted-foreground">{group.description}</p></div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Acciones de ${group.name}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => openEdit(group)}><Pencil data-icon="inline-start" /> Editar</DropdownMenuItem><DropdownMenuItem onClick={() => void duplicateVariableGroup(group.id)}><Files data-icon="inline-start" /> Duplicar</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => setDeleting(group)}><Trash2 data-icon="inline-start" /> Eliminar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div><div className="mt-4 flex items-center justify-between border-t pt-3"><span className="text-xs text-muted-foreground">{group.variables.length} {group.variables.length === 1 ? 'variable' : 'variables'}</span><div className="flex items-center gap-1"><Button variant="ghost" size="sm" onClick={() => void copyGroup(group)}>{copiedId === group.id ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}{copiedId === group.id ? 'Copiado' : 'Copiar .env'}</Button><Button variant="ghost" size="icon-sm" title="Descargar .env" onClick={() => downloadGroup(group)}><Download /><span className="sr-only">Descargar .env</span></Button></div></div></div>)}
      </div>}
    </div>
    <GroupEditor open={editorOpen} onOpenChange={setEditorOpen} group={editing} />
    <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar este grupo?</AlertDialogTitle><AlertDialogDescription>Se eliminará «{deleting?.name}» y sus variables. Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={async () => { if (deleting) await deleteVariableGroup(deleting.id); setDeleting(null) }}>Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>
}
