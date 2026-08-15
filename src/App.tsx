import { useState } from 'react'
import {
  Plus,
  Search,
  Trash2,
  KeyRound,
  Folder,
  Tag as TagIcon,
  Pencil,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Sidebar } from '@/components/sidebar'
import { SecretCard } from '@/components/secret-card'
import { SecretDialog } from '@/components/secret-dialog'
import { TagManager, TagBadge } from '@/components/tags'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import type { Secret } from '@/lib/types'

function ProjectSettings() {
  const { selectedProject, updateProject, deleteProject, selectProject } = useApp()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(selectedProject?.name ?? '')
  const [description, setDescription] = useState(selectedProject?.description ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (o) {
            setName(selectedProject?.name ?? '')
            setDescription(selectedProject?.description ?? '')
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajustes del proyecto</DialogTitle>
            <DialogDescription>Edita o elimina el proyecto.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Nombre</Label>
              <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-desc">Descripción</Label>
              <Textarea
                id="project-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(true)} className="mr-auto text-destructive">
              <Trash2 /> Eliminar
            </Button>
            <Button
              disabled={!name.trim()}
              onClick={async () => {
                if (!selectedProject) return
                await updateProject(selectedProject.id, name.trim(), description.trim())
                setOpen(false)
              }}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán todos los secretos, tags y credenciales del proyecto «{selectedProject?.name}». Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (!selectedProject) return
                await deleteProject(selectedProject.id)
                setConfirmDelete(false)
                setOpen(false)
                selectProject(null)
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function TagFilterBar() {
  const { tags, tagFilter, setTagFilter, secrets } = useApp()
  const [manageOpen, setManageOpen] = useState(false)

  const counts = new Map<string, number>()
  for (const s of secrets) {
    for (const t of s.tags) counts.set(t.name, (counts.get(t.name) ?? 0) + 1)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.length > 0 && (
          <button
            onClick={() => setTagFilter(null)}
            className={cn(
              'inline-flex h-5 items-center gap-1 rounded-4xl border px-2 text-xs font-medium transition-colors',
              tagFilter === null
                ? 'bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <TagIcon className="size-3" /> Todos
          </button>
        )}
        {tags.map((tag) => {
          const active = tagFilter === tag.name
          return (
            <button key={tag.id} onClick={() => setTagFilter(active ? null : tag.name)}>
              <TagBadge
                tag={tag}
                className={cn(
                  active && 'ring-2 ring-ring',
                  !active && !counts.has(tag.name) && 'opacity-40',
                )}
              />
            </button>
          )
        })}
        <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={() => setManageOpen(true)}>
          <Pencil /> Gestionar tags
        </Button>
      </div>
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gestionar tags</DialogTitle>
            <DialogDescription>Los tags se comparten entre los secretos de este proyecto.</DialogDescription>
          </DialogHeader>
          <TagManager />
        </DialogContent>
      </Dialog>
    </>
  )
}

function EmptyState({ onNewSecret, isFiltered }: { onNewSecret: () => void; isFiltered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
        {isFiltered ? <Search className="size-5 text-muted-foreground" /> : <KeyRound className="size-5 text-muted-foreground" />}
      </div>
      <div>
        <p className="text-sm font-medium">
          {isFiltered ? 'Sin resultados' : 'No hay secretos aún'}
        </p>
        <p className="text-sm text-muted-foreground">
          {isFiltered
            ? 'Ningún secreto coincide con la búsqueda o los filtros.'
            : 'Agrega variables de entorno o credenciales a este proyecto.'}
        </p>
      </div>
      {!isFiltered && (
        <Button onClick={onNewSecret}>
          <Plus /> Nuevo secreto
        </Button>
      )}
    </div>
  )
}

function NoProject() {
  const { projects } = useApp()
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Folder className="size-8 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Selecciona un proyecto</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Elige un proyecto del menú lateral para ver y administrar sus secretos.
          </p>
        </div>
        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Crea tu primer proyecto desde el menú lateral.
          </p>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const { ready, selectedProject, secrets, search, setSearch, tagFilter } = useApp()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Secret | null>(null)
  const [deleting, setDeleting] = useState<Secret | null>(null)
  const { deleteSecret } = useApp()

  const openNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (secret: Secret) => {
    setEditing(secret)
    setDialogOpen(true)
  }

  const activeTagCount = tagFilter ? 1 : 0
  const isFiltered = search.trim().length > 0 || activeTagCount > 0

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Cargando base de datos local...
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        {selectedProject ? (
          <>
            <header className="flex items-center justify-between gap-4 border-b px-6 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Folder className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-semibold leading-tight">{selectedProject.name}</h1>
                  {selectedProject.description && (
                    <p className="truncate text-sm text-muted-foreground">{selectedProject.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon-sm" onClick={openNew} title="Nuevo secreto">
                  <Plus />
                </Button>
                <ProjectSettings />
              </div>
            </header>

            <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Buscar por nombre, clave, usuario, email, tag..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <TagFilterBar />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{secrets.length}</Badge>
                  <span className="text-sm text-muted-foreground">secretos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={openNew}>
                    <Plus /> Nuevo secreto
                  </Button>
                </div>
              </div>

              {secrets.length === 0 ? (
                <EmptyState onNewSecret={openNew} isFiltered={isFiltered} />
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {secrets.map((secret) => (
                    <SecretCard
                      key={secret.id}
                      secret={secret}
                      onEdit={openEdit}
                      onDelete={(s) => setDeleting(s)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <NoProject />
        )}
      </main>

      {selectedProject && (
        <SecretDialog open={dialogOpen} onOpenChange={setDialogOpen} secret={editing} />
      )}

      <AlertDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar secreto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará «{deleting?.name}» de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (deleting) await deleteSecret(deleting.id)
                setDeleting(null)
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}