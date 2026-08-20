import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Folder,
  KeyRound,
  MoreHorizontal,
  Moon,
  Pencil,
  Sun,
  Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useApp } from "@/context/AppContext";
import { Sidebar } from "@/components/sidebar";
import { ProjectPlaceholderPage } from "@/pages/project-placeholder-page";
import { ProjectSecretsPage } from "@/pages/project-secrets-page";
import {
  ProjectNoteEditorPage,
  ProjectNotesPage,
} from "@/pages/project-notes-page";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

function ProjectSettings({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { selectedProject, updateProject, deleteProject, selectProject } =
    useApp();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => {
    if (open) {
      setName(selectedProject?.name ?? "");
      setDescription(selectedProject?.description ?? "");
    }
  }, [open, selectedProject]);
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajustes del proyecto</DialogTitle>
            <DialogDescription>Edita o elimina el proyecto.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Nombre</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-description">Descripción</Label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="mr-auto text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 data-icon="inline-start" /> Eliminar
            </Button>
            <Button
              disabled={!name.trim()}
              onClick={async () => {
                if (selectedProject)
                  await updateProject(
                    selectedProject.id,
                    name.trim(),
                    description.trim(),
                  );
                onOpenChange(false);
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
              Se eliminarán todos los elementos de «{selectedProject?.name}».
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                if (selectedProject) await deleteProject(selectedProject.id);
                setConfirmDelete(false);
                onOpenChange(false);
                selectProject(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ProjectLayout() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { ready, selectedProject, projects, selectProject } = useApp();
  const { resolvedTheme, setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const id = Number(projectId);
  useEffect(() => {
    if (
      ready &&
      projects.some((project) => project.id === id) &&
      selectedProject?.id !== id
    )
      void selectProject(id);
  }, [ready, projects, id, selectedProject, selectProject]);
  useEffect(() => {
    if (ready && !projects.some((project) => project.id === id))
      navigate("/", { replace: true });
  }, [ready, projects, id, navigate]);
  if (!ready || !selectedProject)
    return (
      <div className="flex min-h-full items-center justify-center text-sm text-muted-foreground">
        Cargando proyecto...
      </div>
    );
  return (
    <div className="flex min-h-0 flex-1 flex-col animate-vault-open">
      <header className="glass-panel flex items-center justify-between gap-3 border-b bg-vault/5 px-4 py-3 sm:gap-4 sm:px-6 dark:bg-vault/10">
        <div className="flex min-w-0 items-center gap-3 h-9">
          <div className="flex size-9 items-center justify-center rounded-xl bg-vault/12 ring-1 ring-vault/25 sm:size-10">
            <Folder size={19} className="text-vault" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold leading-tight tracking-tight">
              {selectedProject.name}
            </h1>
            {selectedProject.description && (
              <p className="truncate text-xs text-muted-foreground">
                {selectedProject.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            title="Cambiar tema"
          >
            {resolvedTheme === "dark" ? <Sun /> : <Moon />}
            <span className="sr-only">Cambiar tema</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal />
                <span className="sr-only">Acciones del proyecto</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Pencil data-icon="inline-start" /> Editar proyecto
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setSettingsOpen(true)}
              >
                <Trash2 data-icon="inline-start" /> Eliminar proyecto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6">
        <Outlet />
      </div>
      <ProjectSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

function NoProject() {
  return (
    <Empty className="m-6 min-h-[28rem]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Folder />
        </EmptyMedia>
        <EmptyTitle>Selecciona un proyecto</EmptyTitle>
        <EmptyDescription>
          Elige un proyecto del menú lateral para ver sus categorías.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function NotFound() {
  return (
    <Empty className="m-6 min-h-80">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <KeyRound />
        </EmptyMedia>
        <EmptyTitle>Página no encontrada</EmptyTitle>
        <EmptyDescription>
          La ruta que intentaste abrir no existe en esta bóveda.
        </EmptyDescription>
      </EmptyHeader>
      <Button asChild>
        <a href="/">Volver al inicio</a>
      </Button>
    </Empty>
  );
}

function AppRoutes() {
  const { ready, error, retry } = useApp();
  if (!ready)
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-sm text-muted-foreground">
        Cargando base de datos local...
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 text-center">
        <KeyRound className="text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => void retry()}>Reintentar</Button>
      </div>
    );
  return (
    <>
      <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-primary-foreground"
      >
        Ir al contenido principal
      </a>
      <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden md:flex-row">
      <Sidebar />
      <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-hidden" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<NoProject />} />
          <Route path="/projects/:projectId" element={<ProjectLayout />}>
            <Route index element={<Navigate to="secrets" replace />} />
            <Route
              path="secrets"
              element={<ProjectSecretsPage secretType="env" />}
            />
            <Route
              path="credentials"
              element={<ProjectSecretsPage secretType="credential" />}
            />
            <Route
              path="variable-groups"
              element={<ProjectPlaceholderPage />}
            />
            <Route path="notes" element={<ProjectNotesPage />} />
            <Route path="notes/:noteId" element={<ProjectNoteEditorPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      </div>
    </>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
