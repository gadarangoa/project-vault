import { useState } from 'react'
import { FolderPlus, FolderOpen, Folder, Vault } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

function NewProjectDialog() {
  const { createProject, selectProject } = useApp()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const submit = async () => {
    if (!name.trim()) return
    const project = await createProject(name.trim(), description.trim())
    setName('')
    setDescription('')
    setOpen(false)
    selectProject(project.id)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="sm">
          <FolderPlus data-slot="icon-inline-start" />
          Nuevo proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo proyecto</DialogTitle>
          <DialogDescription>
            Organiza tus secretos en proyectos independientes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="project-name">Nombre</Label>
            <Input
              id="project-name"
              placeholder="Ej: Backend API, QA, Producción"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="project-desc">Descripción (opcional)</Label>
            <Textarea
              id="project-desc"
              placeholder="Breve descripción del proyecto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!name.trim()}>
            Crear proyecto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function Sidebar() {
  const { projects, selectedProject, selectProject } = useApp()

  return (
    <aside className="flex w-full shrink-0 flex-col border-b bg-muted/30 md:w-64 md:border-r md:border-b-0">
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-vault text-primary-foreground">
            <Vault className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">Secret Vault</span>
            <span className="text-xs text-muted-foreground">Administrador de secretos</span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-3 px-3 py-4">
        <NewProjectDialog />
        <p className="px-1 text-xs font-medium text-muted-foreground">
          Proyectos ({projects.length})
        </p>
        <nav className="flex max-h-32 flex-col gap-1 overflow-y-auto md:max-h-none">
          {projects.length === 0 && (
            <p className="px-1 text-sm text-muted-foreground">
              Aún no hay proyectos. Crea uno para empezar.
            </p>
          )}
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => selectProject(selectedProject?.id === project.id ? null : project.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                selectedProject?.id === project.id
                  ? 'bg-vault/10 text-vault ring-1 ring-vault/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {selectedProject?.id === project.id ? (
                <FolderOpen className="size-4 shrink-0" />
              ) : (
                <Folder className="size-4 shrink-0" />
              )}
              <span className="truncate">{project.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
