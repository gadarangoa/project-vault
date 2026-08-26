import {
  ArrowUpRight,
  Braces,
  ClipboardList,
  Clock3,
  FileText,
  KeyRound,
  Layers3,
  LockKeyhole,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";

function FeatureLink({
  to,
  icon: Icon,
  title,
  description,
  count,
}: {
  to: string;
  icon: typeof Braces;
  title: string;
  description: string;
  count: number;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 border-t border-border/70 py-4 transition-colors first:border-t-0 first:pt-0 last:pb-0 hover:text-vault focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-vault/12 group-hover:text-vault">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-medium">
          {title}
          <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
      <span className="shrink-0 font-mono text-xs text-muted-foreground">
        {count}
      </span>
    </Link>
  );
}

export function ProjectHomePage() {
  const navigate = useNavigate();
  const { selectedProject, secrets, variableGroups, notes, tasks } = useApp();
  if (!selectedProject) return null;

  const securityTotal = secrets.length + variableGroups.length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-8 animate-vault-open">
      <section className="grid gap-6 border-b border-border/70 pb-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-vault">
            <span className="size-1.5 rounded-full bg-vault" />
            Espacio de proyecto
          </div>
          <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Todo lo que tu equipo necesita para construir con contexto.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
            Centraliza accesos, configuración y documentación de {selectedProject.name} en un solo lugar.
          </p>
        </div>
        <div className="flex items-center gap-3 lg:justify-end">
          <div className="rounded-lg border border-vault/20 bg-vault/5 px-3 py-2 text-xs dark:bg-vault/10">
            <div className="flex items-center gap-2 font-medium text-vault">
              <LockKeyhole className="size-3.5" /> Bóveda local
            </div>
            <p className="mt-1 text-muted-foreground">Solo en este navegador</p>
          </div>
        </div>
      </section>

      <section className="glass-panel futuristic-card rounded-xl border bg-card p-5 shadow-none sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-vault/12 text-vault"><ClipboardList className="size-5" /></div>
          <div><h3 className="text-lg font-semibold tracking-tight">Planificación</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Organiza el trabajo y conviértelo en sesiones de foco concretas.</p></div>
        </div>
        <div>
          <FeatureLink to={`/projects/${selectedProject.id}/tasks`} icon={ClipboardList} title="Tareas" description="Organiza el trabajo en un tablero Kanban" count={tasks.length} />
          <FeatureLink to={`/projects/${selectedProject.id}/focus`} icon={Clock3} title="Enfoque" description="Trabaja con Pomodoro y avanza pasos pequeños" count={tasks.filter((task) => ["todo", "in_progress", "in_test"].includes(task.status)).length} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.45fr_0.85fr]">
        <div className="glass-panel futuristic-card rounded-xl border bg-card p-5 shadow-none sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-vault/12 text-vault">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight">Seguridad</h3>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
                Protege los accesos y la configuración sensible que mantiene tu proyecto en marcha.
              </p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
              {securityTotal} elementos
            </span>
          </div>
          <div>
            <FeatureLink
              to={`/projects/${selectedProject.id}/credentials`}
              icon={KeyRound}
              title="Credenciales"
              description="Usuarios, emails y contraseñas de servicios"
              count={secrets.filter((secret) => secret.type === "credential").length}
            />
            <FeatureLink
              to={`/projects/${selectedProject.id}/secrets`}
              icon={Braces}
              title="Secretos"
              description="Variables de entorno y valores sensibles"
              count={secrets.filter((secret) => secret.type === "env").length}
            />
            <FeatureLink
              to={`/projects/${selectedProject.id}/variable-groups`}
              icon={Layers3}
              title="Grupos de variables"
              description="Entornos completos listos para exportar"
              count={variableGroups.length}
            />
          </div>
        </div>

        <div className="glass-panel futuristic-card flex flex-col rounded-xl border bg-card p-5 shadow-none sm:p-6">
          <div className="mb-6">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
              <FileText className="size-5" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">Docs</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Decisiones, guías y contexto para que el equipo avance alineado.
            </p>
          </div>
          <div className="mt-auto border-t border-border/70 pt-4">
            <FeatureLink
              to={`/projects/${selectedProject.id}/notes`}
              icon={FileText}
              title="Notas"
              description="Documentación viva del proyecto"
              count={notes.length}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-dashed border-border/90 bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
            <Plus className="size-4" />
          </span>
          <div>
            <h3 className="font-medium">¿Falta algo para este proyecto?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Empieza agregando un recurso a una de las áreas de trabajo.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${selectedProject.id}/secrets`)}>
          Agregar un secreto
          <ArrowUpRight data-icon="inline-end" />
        </Button>
      </section>
    </div>
  );
}
