import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Bug, Check, ChevronDown, ChevronUp, CircleAlert, ClipboardList, Clock3, Flame, ListChecks, Pause, Play, RotateCcw, Trophy } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FocusSession, Task, TaskChecklistItem, TaskStatus } from "@/lib/types";

type Phase = "work" | "short_break" | "long_break";
type TimerState = { phase: Phase; taskId: number | null; remaining: number; running: boolean; startedAt: number | null; cycle: number };

const DURATIONS: Record<Phase, number> = { work: 25 * 60, short_break: 5 * 60, long_break: 15 * 60 };
const PHASE_LABELS: Record<Phase, string> = { work: "Enfoque", short_break: "Descanso corto", long_break: "Descanso largo" };
const STATUS_LABELS: Record<TaskStatus, string> = { backlog: "Backlog", todo: "Por hacer", in_progress: "En progreso", in_test: "En pruebas", completed: "Completado" };
const ACHIEVEMENTS: { key: string; title: string; description: string }[] = [
  { key: "first_pomodoro", title: "Primer foco", description: "Completa tu primer Pomodoro." },
  { key: "five_pomodoros", title: "Ritmo constante", description: "Completa 5 Pomodoros." },
  { key: "ten_checklist_items", title: "Paso a paso", description: "Completa 10 pasos de checklist." },
  { key: "first_completed_task", title: "Primera entrega", description: "Completa tu primera tarea o bug." },
  { key: "three_completed_tasks", title: "En marcha", description: "Completa 3 tareas o bugs." },
  { key: "three_focus_days", title: "Buen hábito", description: "Enfócate durante 3 días." },
  { key: "ten_sessions", title: "Zona de flujo", description: "Completa 10 sesiones." },
];

function localDay(value: string | number) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function initialTimer(): TimerState {
  try {
    const saved = localStorage.getItem("secret-vault-focus-timer");
    if (saved) return { ...JSON.parse(saved), remaining: Number(JSON.parse(saved).remaining) } as TimerState;
  } catch { /* ignore malformed local state */ }
  return { phase: "work", taskId: null, remaining: DURATIONS.work, running: false, startedAt: null, cycle: 0 };
}

function TaskTypeIcon({ task }: { task: Task }) {
  return task.type === "bug" ? <Bug className="size-4 text-red-600 dark:text-red-400" /> : <ClipboardList className="size-4 text-vault" />;
}

function Checklist({ task }: { task: Task }) {
  const { createTaskChecklistItem, updateTaskChecklistItem, deleteTaskChecklistItem } = useApp();
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const items = task.checklistItems ?? [];
  const completed = items.filter((item) => item.completed).length;
  const add = async (event: FormEvent) => { event.preventDefault(); if (!draft.trim()) return; await createTaskChecklistItem({ taskId: task.id, title: draft.trim(), position: items.length }); setDraft(""); };
  const saveEdit = async (item: TaskChecklistItem) => { if (!editDraft.trim()) return; await updateTaskChecklistItem(item.id, { taskId: task.id, title: editDraft.trim(), completed: item.completed, position: item.position }); setEditing(null); };
  const move = async (item: TaskChecklistItem, delta: number) => { const next = items.find((candidate) => candidate.position === item.position + delta); if (!next) return; await updateTaskChecklistItem(item.id, { taskId: task.id, title: item.title, completed: item.completed, position: next.position }); await updateTaskChecklistItem(next.id, { taskId: task.id, title: next.title, completed: next.completed, position: item.position }); };
  return <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-semibold"><ListChecks className="size-4 text-vault" /> Checklist</div><p className="mt-1 text-xs text-muted-foreground">{completed} de {items.length} pasos completados</p></div>{items.length > 0 && <span className="font-mono text-sm text-vault">{Math.round((completed / items.length) * 100)}%</span>}</div>{items.length > 0 && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-vault transition-all" style={{ width: `${(completed / items.length) * 100}%` }} /></div>}<div className="mt-4 divide-y">{items.map((item, index) => <div key={item.id} className="flex items-center gap-2 py-2 first:pt-0 last:pb-0"><input type="checkbox" checked={item.completed} onChange={(event) => void updateTaskChecklistItem(item.id, { taskId: task.id, title: item.title, completed: event.target.checked, position: item.position })} aria-label={`Marcar ${item.title}`} className="size-4 accent-[var(--vault)]" />{editing === item.id ? <Input value={editDraft} onChange={(event) => setEditDraft(event.target.value)} onBlur={() => void saveEdit(item)} onKeyDown={(event) => { if (event.key === "Enter") void saveEdit(item); if (event.key === "Escape") setEditing(null); }} autoFocus className="h-7 flex-1 text-sm" /> : <button className={cn("min-w-0 flex-1 break-words text-left text-sm", item.completed && "text-muted-foreground line-through")} onDoubleClick={() => { setEditing(item.id); setEditDraft(item.title); }}>{item.title}</button>}<div className="flex items-center gap-0.5"><Button variant="ghost" size="icon-xs" onClick={() => void move(item, -1)} disabled={index === 0} aria-label="Subir paso"><ChevronUp /></Button><Button variant="ghost" size="icon-xs" onClick={() => void move(item, 1)} disabled={index === items.length - 1} aria-label="Bajar paso"><ChevronDown /></Button><Button variant="ghost" size="icon-xs" onClick={() => void deleteTaskChecklistItem(item.id)} aria-label={`Eliminar ${item.title}`}><span aria-hidden="true">×</span></Button></div></div>)}</div><form onSubmit={(event) => void add(event)} className="mt-4 flex gap-2"><Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Añadir un paso pequeño..." aria-label="Nuevo paso de checklist" /><Button type="submit" size="sm" variant="outline">Añadir</Button></form>{items.length > 0 && completed === items.length && <p className="mt-4 flex items-center gap-2 rounded-lg bg-vault/8 px-3 py-2 text-xs text-vault"><Check className="size-4" /> Todos los pasos están listos. Considera mover la tarea al siguiente estado.</p>}</div>;
}

function Timer({ selectedTask, timer, setTimer, onComplete }: { selectedTask: Task | null; timer: TimerState; setTimer: (next: TimerState | ((current: TimerState) => TimerState)) => void; onComplete: () => Promise<void> }) {
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const completing = useRef(false);
  const currentRemaining = timer.running && timer.startedAt ? Math.max(0, timer.remaining - Math.floor((now - timer.startedAt) / 1000)) : timer.remaining;
  const pause = () => setTimer((current) => ({ ...current, remaining: current.running && current.startedAt ? Math.max(0, current.remaining - Math.floor((Date.now() - current.startedAt) / 1000)) : current.remaining, running: false, startedAt: null }));
  const start = () => { if (timer.phase === "work" && !selectedTask) { setError("Selecciona una tarea para iniciar el foco."); return; } setError(""); setTimer((current) => ({ ...current, taskId: selectedTask?.id ?? current.taskId, running: true, startedAt: Date.now() })); };
  const reset = () => { setError(""); setTimer((current) => ({ ...current, remaining: DURATIONS[current.phase], running: false, startedAt: null })); };
  useEffect(() => {
    if (!timer.running || !timer.startedAt) return;
    const interval = window.setInterval(() => {
      const left = Math.max(0, timer.remaining - Math.floor((Date.now() - timer.startedAt!) / 1000));
      setNow(Date.now());
      if (left <= 0 && !completing.current) { completing.current = true; void onComplete().finally(() => { completing.current = false; }); }
    }, 250);
    return () => window.clearInterval(interval);
  }, [timer, onComplete]);
  useEffect(() => { document.title = timer.running ? `${formatTime(currentRemaining)} · ${PHASE_LABELS[timer.phase]}` : "Secret Vault"; return () => { document.title = "Secret Vault"; }; }, [timer.running, timer.phase, currentRemaining]);
  return <div className="glass-panel rounded-xl border bg-card p-5 shadow-none sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-vault">{PHASE_LABELS[timer.phase]}</p><p className="mt-1 text-sm text-muted-foreground">{timer.phase === "work" ? selectedTask?.title ?? "Selecciona una tarea" : "Tómate un respiro"}</p></div><Clock3 className="size-5 text-muted-foreground" /></div><div className="py-8 text-center"><div className="font-mono text-7xl font-medium tracking-[-0.06em] text-foreground sm:text-8xl">{formatTime(currentRemaining)}</div><p className="mt-3 text-xs text-muted-foreground">{timer.phase === "work" ? `Ciclo ${timer.cycle + 1} de 4` : "El siguiente bloque no comenzará automáticamente"}</p></div><div className="flex justify-center gap-2"><Button onClick={timer.running ? pause : start}>{timer.running ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}{timer.running ? "Pausar" : "Iniciar"}</Button><Button variant="outline" onClick={reset}><RotateCcw data-icon="inline-start" /> Reiniciar</Button></div>{error && <p role="alert" className="mt-4 flex items-center justify-center gap-2 text-xs text-destructive"><CircleAlert className="size-4" />{error}</p>}</div>;
}

function Summary({ sessions, tasks }: { sessions: FocusSession[]; tasks: Task[] }) {
  const today = localDay(Date.now()); const recent = sessions.filter((session) => Date.now() - new Date(session.completedAt).getTime() < 7 * 86400000); const todaySessions = sessions.filter((session) => localDay(session.completedAt) === today); const completedStepsToday = tasks.flatMap((task) => task.checklistItems).filter((item) => item.completed && item.completedAt && localDay(item.completedAt) === today).length; const completedTasksToday = tasks.filter((task) => task.completedAt && localDay(task.completedAt) === today).length;
  const days = Array.from({ length: 7 }, (_, offset) => { const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - offset)); const key = localDay(date.getTime()); return { key, label: new Intl.DateTimeFormat("es", { weekday: "short" }).format(date).replace(".", ""), count: recent.filter((session) => localDay(session.completedAt) === key).length }; }); const max = Math.max(1, ...days.map((day) => day.count));
  return <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl border bg-card p-5"><div className="flex items-center gap-2 text-sm font-semibold"><Flame className="size-4 text-vault" /> Hoy</div><div className="mt-5 grid grid-cols-2 gap-y-5"><div><p className="font-mono text-2xl">{todaySessions.length}</p><p className="text-xs text-muted-foreground">Pomodoros</p></div><div><p className="font-mono text-2xl">{Math.round(todaySessions.reduce((sum, session) => sum + session.actualSeconds, 0) / 60)}</p><p className="text-xs text-muted-foreground">Minutos de foco</p></div><div><p className="font-mono text-2xl">{completedStepsToday}</p><p className="text-xs text-muted-foreground">Pasos completados</p></div><div><p className="font-mono text-2xl">{completedTasksToday}</p><p className="text-xs text-muted-foreground">Tareas completadas</p></div></div></div><div className="rounded-xl border bg-card p-5"><div className="flex items-center gap-2 text-sm font-semibold"><Clock3 className="size-4 text-muted-foreground" /> Últimos 7 días</div><div className="mt-5 flex h-24 items-end justify-between gap-2">{days.map((day) => <div key={day.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><div className="w-full rounded-t bg-vault/70 transition-all" style={{ height: `${Math.max(day.count ? 10 : 3, (day.count / max) * 72)}px` }} title={`${day.count} Pomodoros`} /><span className="text-[10px] capitalize text-muted-foreground">{day.label}</span></div>)}</div><p className="mt-3 text-xs text-muted-foreground">{recent.length} Pomodoros completados en este periodo.</p></div></div>;
}

export function ProjectFocusPage() {
  const { tasks, focusSessions, focusAchievements, createFocusSession } = useApp();
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [timer, setTimer] = useState<TimerState>(initialTimer);
  const activeTasks = useMemo(() => tasks.filter((task) => ["todo", "in_progress", "in_test"].includes(task.status)).sort((a, b) => (a.status === "in_progress" ? -1 : b.status === "in_progress" ? 1 : 0) || ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]) || b.updatedAt.localeCompare(a.updatedAt)), [tasks]);
  const selectedTask = tasks.find((task) => task.id === selectedId) ?? null;
  useEffect(() => {
    const requested = searchParams.get("task");
    const requestedId = requested ? Number(requested) : null;
    const restored = timer.taskId ?? requestedId;
    setSelectedId((current) => {
      if (activeTasks.some((task) => task.id === current)) return current;
      if (activeTasks.some((task) => task.id === restored)) return restored;
      return activeTasks[0]?.id ?? null;
    });
  }, [activeTasks, searchParams, timer.taskId]);
  useEffect(() => { try { localStorage.setItem("secret-vault-focus-timer", JSON.stringify(timer)); } catch { /* storage is optional */ } }, [timer]);
  const completePhase = useCallback(async () => {
    if (!timer.running) return;
    if (timer.phase === "work") {
      if (!selectedTask || !timer.startedAt) return;
      try {
        await createFocusSession({ projectId: selectedTask.projectId, taskId: selectedTask.id, plannedSeconds: DURATIONS.work, actualSeconds: DURATIONS.work, startedAt: new Date(timer.startedAt).toISOString(), completedAt: new Date().toISOString() });
        const nextCycle = timer.cycle + 1;
        const longBreak = nextCycle >= 4;
        setTimer({ phase: longBreak ? "long_break" : "short_break", taskId: selectedTask.id, remaining: DURATIONS[longBreak ? "long_break" : "short_break"], running: false, startedAt: null, cycle: longBreak ? 0 : nextCycle });
      } catch {
        setTimer((current) => ({ ...current, running: false, startedAt: null }));
      }
      return;
    }
    setTimer((current) => ({ ...current, phase: "work", remaining: DURATIONS.work, running: false, startedAt: null }));
  }, [createFocusSession, selectedTask, timer]);
  return <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 pb-8"><div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-vault"><Clock3 className="size-3.5" /> Productividad</div><h2 className="text-2xl font-semibold tracking-tight">Enfoque</h2><p className="mt-1 text-sm text-muted-foreground">Trabaja en una tarea concreta, avanza sus pasos y registra sesiones de concentración.</p></div><span className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">{activeTasks.length} activas</span></div><div className="grid gap-4 xl:grid-cols-[minmax(16rem,0.8fr)_minmax(22rem,1.2fr)_minmax(18rem,0.9fr)]"><div className="rounded-xl border bg-card p-4"><div className="mb-3 flex items-center gap-2 text-sm font-semibold"><ClipboardList className="size-4 text-vault" /> Trabajo activo</div>{activeTasks.length === 0 ? <div className="flex min-h-48 flex-col items-center justify-center text-center text-sm text-muted-foreground"><Check className="mb-2 size-5 text-vault" />No hay tareas activas.</div> : <div className="space-y-1">{activeTasks.map((task) => <button key={task.id} disabled={timer.running && selectedId !== task.id} onClick={() => setSelectedId(task.id)} className={cn("w-full rounded-lg border border-transparent p-3 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60", selectedId === task.id && "border-vault/30 bg-vault/8")}><div className="flex items-start gap-2"><TaskTypeIcon task={task} /><span className="min-w-0 flex-1"><span className="block break-words text-sm font-medium">{task.title}</span><span className="mt-1 block text-xs text-muted-foreground">{STATUS_LABELS[task.status]} · {task.checklistItems.filter((item) => item.completed).length}/{task.checklistItems.length} pasos</span></span></div></button>)}</div>}</div><div><Timer selectedTask={selectedTask} timer={timer} setTimer={setTimer} onComplete={completePhase} />{selectedTask && <div className="mt-4"><Checklist task={selectedTask} /></div>}</div><div><Summary sessions={focusSessions} tasks={tasks} /><div className="mt-4 rounded-xl border bg-card p-5"><div className="flex items-center gap-2 text-sm font-semibold"><Trophy className="size-4 text-vault" /> Hitos personales</div><div className="mt-4 space-y-3">{ACHIEVEMENTS.map((item) => { const unlocked = focusAchievements.find((achievement) => achievement.achievementKey === item.key); return <div key={item.key} className={cn("flex items-start gap-3 rounded-lg border p-3", !unlocked && "opacity-50")}><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-vault/10 text-vault">{unlocked ? <Trophy className="size-4" /> : <span className="font-mono text-xs">?</span>}</span><div><p className="text-sm font-medium">{item.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>{unlocked && <p className="mt-1 text-[10px] text-vault">Desbloqueado {new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(new Date(unlocked.unlockedAt))}</p>}</div></div>; })}</div></div></div></div></div>;
}
