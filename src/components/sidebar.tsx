import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  Braces,
  ClipboardList,
  FileText,
  Folder,
  FolderLock,
  FolderOpen,
  FolderPlus,
  KeyRound,
  Layers3,
  Menu,
  MoreHorizontal,
  Pin,
  SearchIcon,
  X,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function NewProjectDialog() {
  const { createProject, selectProject } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  useEffect(() => {
    const openDialog = () => setOpen(true);
    window.addEventListener("secret-vault:new-project", openDialog);
    return () =>
      window.removeEventListener("secret-vault:new-project", openDialog);
  }, []);
  const submit = async () => {
    if (!name.trim()) return;
    const project = await createProject(name.trim(), description.trim());
    setName("");
    setDescription("");
    setOpen(false);
    selectProject(project.id);
    navigate(`/projects/${project.id}`);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="sm">
          <FolderPlus data-slot="icon-inline-start" /> Nuevo proyecto
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
          <Button onClick={() => void submit()} disabled={!name.trim()}>
            Crear proyecto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const quickActions = [
  {
    label: "Nueva tarea",
    icon: ClipboardList,
    path: "tasks",
    event: "secret-vault:new-task",
  },
  {
    label: "Nueva credencial",
    icon: KeyRound,
    path: "credentials",
    event: "secret-vault:new-secret",
    detail: "credential",
  },
  {
    label: "Nuevo secreto",
    icon: Braces,
    path: "secrets",
    event: "secret-vault:new-secret",
    detail: "env",
  },
  {
    label: "Nuevo grupo de variables",
    icon: Layers3,
    path: "variable-groups",
    event: "secret-vault:new-variable-group",
  },
  {
    label: "Nueva nota",
    icon: FileText,
    path: "notes",
    event: "secret-vault:new-note",
  },
] as const;

export function Sidebar() {
  const {
    projects,
    selectedProject,
    selectProject,
    pinnedProjectIds,
    recentProjectIds,
    archivedProjectIds,
    toggleProjectPinned,
    archiveProject,
    markProjectRecent,
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleProjects = useMemo(
    () =>
      [
        ...projects.filter(
          (project) => !archivedProjectIds.includes(project.id),
        ),
      ].sort((a, b) => {
        const pinned =
          Number(pinnedProjectIds.includes(b.id)) -
          Number(pinnedProjectIds.includes(a.id));
        if (pinned) return pinned;
        const aRecent = recentProjectIds.indexOf(a.id);
        const bRecent = recentProjectIds.indexOf(b.id);
        if (aRecent !== -1 || bRecent !== -1)
          return (
            (aRecent === -1 ? 99 : aRecent) - (bRecent === -1 ? 99 : bRecent)
          );
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }).slice(0, 5),
    [projects, pinnedProjectIds, recentProjectIds, archivedProjectIds],
  );
  const openProject = (id: number) => {
    markProjectRecent(id);
    if (selectedProject?.id !== id) void selectProject(id);
    navigate(`/projects/${id}`);
    setMobileOpen(false);
  };
  const runQuickAction = (
    projectId: number,
    action: (typeof quickActions)[number],
  ) => {
    openProject(projectId);
    navigate(`/projects/${projectId}/${action.path}`);
    window.setTimeout(
      () =>
        window.dispatchEvent(
          new CustomEvent(action.event, {
            detail: "detail" in action ? action.detail : undefined,
          }),
        ),
      0,
    );
  };
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
      isActive
        ? "bg-vault/12 font-medium text-vault"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );
  const content = (
    <>
      <div className="flex items-center justify-between border-b px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
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
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar navegación"
        >
          <X />
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
        <NewProjectDialog />
        <nav className="grid gap-1" aria-label="Navegación global">
          <NavLink
            end
            to="/"
            onClick={() => setMobileOpen(false)}
            className={(state) =>
              cn(
                linkClass(state),
                location.pathname === "/" &&
                  "bg-vault/12 font-medium text-vault",
              )
            }
          >
            <FolderOpen className="size-4" /> Inicio
          </NavLink>
          <NavLink
            end
            to="/projects"
            onClick={() => setMobileOpen(false)}
            className={linkClass}
          >
            <Folder className="size-4" /> Todos los proyectos
          </NavLink>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new Event("secret-vault:command-palette"))
            }
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <SearchIcon className="size-4" /> Buscar{" "}
            <kbd className="ml-auto rounded border bg-background px-1.5 py-0.5 text-[10px]">
              ⌘ K
            </kbd>
          </button>
        </nav>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <p className="px-1 text-xs font-medium text-muted-foreground">
            Proyectos recientes ({visibleProjects.length})
          </p>
          {visibleProjects.length === 0 ? (
            <p className="px-1 text-sm text-muted-foreground">
              Aún no hay proyectos activos.
            </p>
          ) : (
            <div className="grid gap-1">
              {visibleProjects.map((project) => {
                const active = selectedProject?.id === project.id;
                return (
                  <div
                    key={project.id}
                    className={cn(
                      "group flex items-center rounded-lg",
                      active
                        ? "bg-vault/12 text-vault ring-1 ring-vault/25"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => openProject(project.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left text-sm"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center">
                        {active ? (
                          <FolderOpen className="size-4" />
                        ) : (
                          <Folder className="size-4" />
                        )}
                      </span>
                      <span className="truncate">{project.name}</span>
                      {pinnedProjectIds.includes(project.id) && (
                        <Pin className="ml-auto size-3 shrink-0 opacity-60" />
                      )}
                    </button>
                    <DropdownMenu >
                      <DropdownMenuTrigger asChild >
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="mr-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                          aria-label={`Acciones de ${project.name}`}
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-56">
                        <DropdownMenuItem
                          onClick={() => toggleProjectPinned(project.id)}
                        >
                          <Pin data-icon="inline-start" />
                          {pinnedProjectIds.includes(project.id)
                            ? "Quitar de fijados"
                            : "Fijar proyecto"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                          <span className="text-xs font-semibold text-muted-foreground">
                            Crear rápidamente
                          </span>
                        </DropdownMenuItem>
                        {quickActions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <DropdownMenuItem
                              key={action.label}
                              onClick={() => runQuickAction(project.id, action)}
                            >
                              <Icon data-icon="inline-start" />
                              {action.label}
                            </DropdownMenuItem>
                          );
                        })}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => archiveProject(project.id)}
                        >
                          <Archive data-icon="inline-start" />
                          Archivar proyecto
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
          {archivedProjectIds.some((id) =>
            projects.some((project) => project.id === id),
          ) && (
            <NavLink
              to="/projects?filter=archived"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Archive className="size-3.5" /> Archivados
            </NavLink>
          )}
        </div>
      </div>
      <div className="mx-3 mb-3 rounded-xl border border-vault/20 bg-vault/5 p-3 dark:bg-vault/10">
        <p className="text-xs font-semibold text-foreground">Bóveda local</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          Tus datos viven solo en este navegador.
        </p>
      </div>
    </>
  );
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-3 left-3 z-30 md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir navegación"
      >
        <Menu />
      </Button>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar navegación"
          className="fixed inset-0 z-40 bg-foreground/15 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "glass-panel fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 -translate-x-full flex-col border-r bg-muted/30 transition-transform md:relative md:z-auto md:h-full md:w-64 md:translate-x-0",
          mobileOpen && "translate-x-0",
        )}
      >
        {content}
      </aside>
    </>
  );
}
