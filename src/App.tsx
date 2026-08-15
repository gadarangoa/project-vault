import { useState } from 'react'
import {
  Plus,
  Search,
  Trash2,
  KeyRound,
  Folder,
  Tag as TagIcon,
  Pencil,
  MoreHorizontal,
  Moon,
  Sun,
  X,
} from 'lucide-react'
import { useTheme } from 'next-themes'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

function ProjectSettingsDialog({
  open,
  onOpenChange,
  confirmDelete,
  onConfirmDeleteChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  confirmDelete: boolean
  onConfirmDeleteChange: (o: boolean) => void
}) {
  const { selectedProject, updateProject, deleteProject, selectProject } = useApp()
  const [name, setName] = useState(selectedProject?.name ?? '')
  const [description, setDescription] = useState(selectedProject?.description ?? '')

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          onOpenChange(o)
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
            <Button variant="outline" onClick={() => onConfirmDeleteChange(true)} className="mr-auto text-destructive">
              <Trash2 /> Eliminar
            </Button>
            <Button
              disabled={!name.trim()}
              onClick={async () => {
                if (!selectedProject) return
                await updateProject(selectedProject.id, name.trim(), description.trim())
                onOpenChange(false)
              }}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={onConfirmDeleteChange}>
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
              variant="destructive"
              onClick={async () => {
                if (!selectedProject) return
                await deleteProject(selectedProject.id)
                onConfirmDeleteChange(false)
                onOpenChange(false)
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
            aria-pressed={tagFilter === null}
            className={cn(
              'inline-flex h-5 items-center justify-center gap-1 rounded-4xl border px-2 text-xs font-medium transition-colors',
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
            <button key={tag.id} onClick={() => setTagFilter(active ? null : tag.name)} aria-pressed={active}>
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
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center animate-rise-in">
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
        <div className="flex size-16 items-center justify-center rounded-2xl bg-vault/10">
          <Folder className="size-8 text-vault" />
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
  const { ready, error, retry, selectedProject, secrets, search, setSearch, tagFilter } = useApp()
  const { resolvedTheme, setTheme } = useTheme()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Secret | null>(null)
  const [deleting, setDeleting] = useState<Secret | null>(null)
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false)
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false)
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
  const isDark = resolvedTheme === 'dark'

  if (!ready) {
    return (
      <div className="flex min-h-screen animate-pulse items-center justify-center text-sm text-muted-foreground">
        Cargando base de datos local...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="flex max-w-sm flex-col items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <KeyRound className="size-5" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-base font-semibold">La bóveda no está disponible</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => void retry()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden md:flex-row">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        {selectedProject ? (
          <div key={selectedProject.id} className="flex min-h-0 flex-1 flex-col animate-vault-open">
            <header className="flex items-center justify-between gap-4 border-b bg-vault/5 px-6 py-4 dark:bg-vault/10">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-vault/10 ring-1 ring-vault/20">
                  <Folder className="size-5 text-vault" />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-semibold leading-tight tracking-tight">{selectedProject.name}</h1>
                  {selectedProject.description && (
                    <p className="truncate text-xs text-muted-foreground">{selectedProject.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                >
                  {isDark ? <Sun key="sun" className="animate-swap-in" /> : <Moon key="moon" className="animate-swap-in" />}
                  <span className="sr-only">Cambiar tema</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" title="Acciones del proyecto">
                      <span className="sr-only">Acciones del proyecto</span>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setProjectSettingsOpen(true)}>
                      <Pencil /> Editar proyecto
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => setConfirmDeleteProject(true)}>
                      <Trash2 /> Eliminar proyecto
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <ProjectSettingsDialog
                  open={projectSettingsOpen}
                  onOpenChange={setProjectSettingsOpen}
                  confirmDelete={confirmDeleteProject}
                  onConfirmDeleteChange={setConfirmDeleteProject}
                />
              </div>
            </header>

            <div className="flex min-h-0 flex-col gap-5 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    aria-label="Buscar secretos"
                    placeholder="Buscar por nombre, clave, usuario, email, tag..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      type="button"
                      aria-label="Limpiar búsqueda"
                      onClick={() => setSearch('')}
                      className="absolute top-1/2 right-2.5 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
                <TagFilterBar />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{secrets.length}</Badge>
                  <span className="text-xs font-medium text-muted-foreground">secretos</span>
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
                  {secrets.map((secret, index) => (
                    <div
                      key={secret.id}
                      className="animate-rise-in"
                      style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                    >
                      <SecretCard
                        secret={secret}
                        onEdit={openEdit}
                        onDelete={(s) => setDeleting(s)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
              variant="destructive"
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
