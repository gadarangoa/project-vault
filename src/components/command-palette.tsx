import { useEffect, useMemo, useState } from "react";
import { FileText, Folder, KeyRound, ListTodo, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function CommandPalette() {
  const { projects, recentProjectIds, selectedProject, markProjectRecent, selectProject } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen(true); } };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown); window.addEventListener("secret-vault:command-palette", onOpen);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("secret-vault:command-palette", onOpen); };
  }, []);
  useEffect(() => { if (!open) setQuery(""); }, [open]);
  const recentProjects = useMemo(() => { const ordered = recentProjectIds.map((id) => projects.find((project) => project.id === id)).filter((project): project is NonNullable<typeof project> => Boolean(project)); const fallback = projects.filter((project) => !recentProjectIds.includes(project.id)).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); return [...ordered, ...fallback].slice(0, 3); }, [projects, recentProjectIds]);
  const matches = useMemo(() => recentProjects.filter((project) => `${project.name} ${project.description}`.toLowerCase().includes(query.trim().toLowerCase())), [recentProjects, query]);
  const go = (path: string) => { setOpen(false); navigate(path); };
  const openProject = (id: number) => { markProjectRecent(id); void selectProject(id); go(`/projects/${id}`); };
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="overflow-hidden p-0 sm:max-w-lg"><DialogHeader className="border-b px-4 py-4"><DialogTitle>Buscar en Project Vault</DialogTitle><DialogDescription>Encuentra un proyecto reciente o accede a una sección.</DialogDescription></DialogHeader><div className="px-4 pt-3"><div className="relative"><Search className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground" /><Input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Escribe para buscar..." className="pl-9" /></div></div><div className="max-h-80 overflow-y-auto p-2"><p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Acciones del proyecto actual</p>{selectedProject ? <div className="grid gap-1"><Button variant="ghost" className="justify-start" onClick={() => go(`/projects/${selectedProject.id}/tasks`)}><ListTodo data-icon="inline-start" /> Abrir tareas <span className="ml-auto text-xs text-muted-foreground">Trabajo</span></Button><Button variant="ghost" className="justify-start" onClick={() => go(`/projects/${selectedProject.id}/secrets`)}><KeyRound data-icon="inline-start" /> Abrir secretos <span className="ml-auto text-xs text-muted-foreground">Seguridad</span></Button><Button variant="ghost" className="justify-start" onClick={() => go(`/projects/${selectedProject.id}/notes`)}><FileText data-icon="inline-start" /> Abrir notas <span className="ml-auto text-xs text-muted-foreground">Docs</span></Button></div> : <p className="px-2 py-2 text-sm text-muted-foreground">Selecciona un proyecto para ver sus secciones.</p>}{matches.length > 0 && <><p className="mt-3 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Proyectos recientes</p><div className="grid gap-1">{matches.map((project) => <Button key={project.id} variant="ghost" className="h-auto justify-start py-2" onClick={() => openProject(project.id)}><Folder data-icon="inline-start" /><span className="truncate">{project.name}</span><span className="ml-auto text-xs text-muted-foreground">Abrir proyecto</span></Button>)}</div></>}{query && matches.length === 0 && <p className="px-2 py-5 text-center text-sm text-muted-foreground">No encontramos proyectos recientes con ese nombre.</p>}</div><div className="border-t bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">Pulsa <kbd className="rounded border bg-background px-1">Esc</kbd> para cerrar</div></DialogContent></Dialog>;
}
