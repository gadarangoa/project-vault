import { useState } from "react";
import {
  FolderPlus,
  FolderOpen,
  Folder,
  KeyRound,
  Braces,
  Layers3,
  FileText,
  LockKeyhole,
  FolderLock,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function NewProjectDialog() {
  const { createProject, selectProject } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const submit = async () => {
    if (!name.trim()) return;
    const project = await createProject(name.trim(), description.trim());
    setName("");
    setDescription("");
    setOpen(false);
    selectProject(project.id);
    navigate(`/projects/${project.id}/secrets`);
  };

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
              onKeyDown={(e) => e.key === "Enter" && submit()}
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
  );
}

export function Sidebar() {
  const { projects, selectedProject, selectProject } = useApp();
  const navigate = useNavigate();

  return (
    <aside className="glass-panel flex w-full shrink-0 flex-col border-b bg-muted/30 md:h-full md:max-h-full md:w-64 md:overflow-hidden md:border-r md:border-b-0">
      <div className="flex items-center gap-2 border-b px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_22px_-8px_var(--vault)]">
            <FolderLock className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">
              Project Vault
            </span>
            <span className="text-xs text-muted-foreground">
              Administrador de secretos
            </span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 py-4">
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
            <div key={project.id}>
              <button
                onClick={() => {
                  if (selectedProject?.id === project.id) return;
                  selectProject(project.id);
                  navigate(`/projects/${project.id}/secrets`);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                  selectedProject?.id === project.id
                    ? "bg-vault/12 text-vault ring-1 ring-vault/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {selectedProject?.id === project.id ? (
                  <FolderOpen className="size-4 shrink-0" />
                ) : (
                  <Folder className="size-4 shrink-0" />
                )}
                <span className="truncate">{project.name}</span>
              </button>
              {selectedProject?.id === project.id && (
                <div className="ml-4 flex flex-col gap-0.5 border-l pl-2">
                  {[
                    {
                      to: "credentials",
                      label: "Credenciales",
                      icon: KeyRound,
                    },
                    { to: "secrets", label: "Secretos", icon: Braces },
                    {
                      to: "variable-groups",
                      label: "Grupos de variables",
                      icon: Layers3,
                    },
                    { to: "notes", label: "Notas", icon: FileText },
                  ].map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={`/projects/${project.id}/${to}`}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                          isActive
                            ? "bg-muted font-medium text-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )
                      }
                    >
                      <Icon className="size-3 shrink-0" />
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div className="mx-3 mb-3 mt-auto rounded-xl border border-vault/20 bg-vault/5 p-3 dark:bg-vault/10">
        <div className="flex items-start gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-vault/12 text-vault">
            <LockKeyhole className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">
              Bóveda local
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              Tus datos viven solo en este navegador.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
