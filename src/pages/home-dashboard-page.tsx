import { useMemo } from "react";
import {
  ArrowUpRight,
  FileText,
  Folder,
  FolderPlus,
  KeyRound,
  ListTodo,
  Pin,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";

export function HomeDashboardPage() {
  const { projects, pinnedProjectIds, recentProjectIds } = useApp();
  const navigate = useNavigate();
  const activeProjects = projects;
  const recentProjects = useMemo(
    () =>
      recentProjectIds
        .map((id) => projects.find((project) => project.id === id))
        .filter(Boolean)
        .slice(0, 5),
    [projects, recentProjectIds],
  );
  const pinnedProjects = useMemo(
    () =>
      projects
        .filter((project) => pinnedProjectIds.includes(project.id))
        .slice(0, 4),
    [projects, pinnedProjectIds],
  );
  const featuredProjects =
    recentProjects.length > 0 ? recentProjects : pinnedProjects;
  const openProjectResource = (suffix: string) => {
    const project = featuredProjects[0];
    if (project) navigate(`/projects/${project.id}/${suffix}`);
    else navigate("/projects");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col animate-vault-open">
      <header className="glass-panel flex shrink-0 items-center justify-between gap-3 border-b bg-vault/5 px-4 py-3 sm:px-6 dark:bg-vault/10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-vault/12 ring-1 ring-vault/25 sm:size-10">
            <ShieldCheck className="size-4 text-vault" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold leading-tight tracking-tight">
              Inicio
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Tu centro de control personal
            </p>
          </div>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-8">
          <section className="grid gap-6 border-b border-border/70 pb-7 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-vault">
                Espacio personal
              </p>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                ¿Listo para continuar?.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                Accede rápidamente a tus proyectos y vuelve al trabajo sin
                perder tiempo buscando.
              </p>
            </div>
            <Button
              onClick={() =>
                window.dispatchEvent(new Event("secret-vault:new-project"))
              }
              className="w-full lg:w-auto"
            >
              <FolderPlus data-slot="icon-inline-start" /> Nuevo proyecto
            </Button>
          </section>
          <section className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Proyectos activos</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {activeProjects.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Organizados en tu bóveda
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Proyectos fijados</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {
                  pinnedProjectIds.filter((id) =>
                    projects.some((project) => project.id === id),
                  ).length
                }
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tus espacios prioritarios
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Privacidad</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold tracking-tight">
                <KeyRound className="size-4 text-vault" /> Local
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Sin cuenta ni nube
              </p>
            </div>
          </section>
          {featuredProjects.length > 0 ? (
            <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="glass-panel rounded-xl border bg-card p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-vault">
                      Continúa trabajando
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight">
                      Proyectos recientes
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/projects")}
                  >
                    Ver todos <ArrowUpRight data-icon="inline-end" />
                  </Button>
                </div>
                <div className="grid gap-2">
                  {featuredProjects.map(
                    (project) =>
                      project && (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:border-vault/25 hover:bg-vault/5"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-vault/12 text-vault">
                            <Folder className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">
                              {project.name}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                              {project.description || "Sin descripción"}
                            </span>
                          </span>
                          {recentProjectIds.includes(project.id) && (
                            <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
                              <Pin className="size-3" /> Reciente
                            </span>
                          )}
                          <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                      ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-dashed border-border/90 bg-muted/20 p-5 sm:p-6">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-vault">
                  Acceso rápido
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">
                  ¿Qué necesitas hacer?
                </h3>
                <div className="mt-5 grid gap-2">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => openProjectResource("tasks")}
                  >
                    <ListTodo data-icon="inline-start" /> Abrir tareas
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => openProjectResource("secrets")}
                  >
                    <KeyRound data-icon="inline-start" /> Abrir secretos
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => openProjectResource("notes")}
                  >
                    <FileText data-icon="inline-start" /> Abrir notas
                  </Button>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-xl border border-dashed border-border/90 bg-muted/20 p-8 text-center sm:p-12">
              <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-vault/12 text-vault">
                <FolderPlus className="size-5" />
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">
                Crea tu primer proyecto
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Un proyecto reúne tus secretos, tareas y documentación en un
                solo contexto privado.
              </p>
              <Button
                className="mt-5"
                onClick={() =>
                  window.dispatchEvent(new Event("secret-vault:new-project"))
                }
              >
                <Plus data-slot="icon-inline-start" /> Crear proyecto
              </Button>
            </section>
          )}
          <section className="flex flex-col gap-3 rounded-xl border bg-vault/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:bg-vault/10">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-vault">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <h3 className="font-medium">Bóveda local protegida</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Tus datos viven solo en este navegador. Recuerda exportar un
                  respaldo periódicamente.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/projects")}
            >
              Gestionar proyectos
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
