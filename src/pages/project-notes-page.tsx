import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type ReactNode,
} from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import FontFamily from "@tiptap/extension-font-family";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import { TableKit } from "@tiptap/extension-table";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { Markdown } from "@tiptap/markdown";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Bold,
  Check,
  CheckSquare,
  ChevronDown,
  Code,
  Columns3,
  CopyIcon,
  Download,
  Eraser,
  FileCode2,
  Highlighter,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Merge,
  Minus,
  MoreVertical,
  Paintbrush,
  PanelLeft,
  PanelTop,
  Pin,
  PinOff,
  Plus,
  Quote,
  Redo2,
  Save,
  Rows3,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table2,
  TableProperties,
  Trash2,
  Type,
  Unlink,
  Underline as UnderlineIcon,
  Undo2,
  WandSparkles,
  Wrench,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { TagBadge, TagPopover } from "@/components/tags";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Note, NoteInput } from "@/lib/types";

type SaveState = "saved" | "saving" | "error";

const emptyDocument = {
  type: "doc" as const,
  content: [{ type: "paragraph" }],
};

function noteExcerpt(note: Note) {
  const text = note.contentMarkdown
    .replace(/[#*_`>[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text || "Sin contenido todavía.";
}

function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "sin-titulo"
  );
}

function downloadMarkdown(note: Pick<Note, "title" | "contentMarkdown">) {
  const blob = new Blob([note.contentMarkdown], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slugify(note.title)}.md`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function formatUpdatedDate(value: string) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const EDITOR_COLORS = [
  { name: "Tinta", value: "var(--foreground)", className: "bg-foreground" },
  {
    name: "Niebla",
    value: "var(--muted-foreground)",
    className: "bg-muted-foreground",
  },
  {
    name: "Azul",
    value: "oklch(0.623 0.214 259.815)",
    className: "bg-blue-500",
  },
  {
    name: "Verde",
    value: "oklch(0.696 0.17 162.48)",
    className: "bg-emerald-500",
  },
  {
    name: "Ámbar",
    value: "oklch(0.769 0.188 70.08)",
    className: "bg-amber-500",
  },
  { name: "Rojo", value: "var(--destructive)", className: "bg-destructive" },
  {
    name: "Violeta",
    value: "oklch(0.541 0.281 293.009)",
    className: "bg-purple-500",
  },
  {
    name: "Cian",
    value: "oklch(0.715 0.143 215.221)",
    className: "bg-cyan-500",
  },
];

const HIGHLIGHT_COLORS = EDITOR_COLORS.slice(2);

function ToolbarDivider() {
  return (
    <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-border" />
  );
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title={label}
          aria-label={label}
          aria-pressed={active}
          disabled={disabled}
          className={active ? "bg-muted text-foreground" : undefined}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

function ColorMenu({
  label,
  icon,
  colors,
  onSelect,
  onClear,
}: {
  label: string;
  icon: ReactNode;
  colors: typeof EDITOR_COLORS;
  onSelect: (color: string) => void;
  onClear: () => void;
}) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title={label}
              aria-label={label}
            >
              {icon}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="w-44">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {label}
        </div>
        <div className="grid grid-cols-4 gap-1 px-2 pb-2">
          {colors.map((color) => (
            <button
              key={color.name}
              type="button"
              title={color.name}
              aria-label={color.name}
              className="flex size-7 items-center justify-center rounded-md hover:bg-muted"
              onClick={() => onSelect(color.value)}
            >
              <span
                className={cn(
                  "size-4 rounded-full ring-1 ring-foreground/15",
                  color.className,
                )}
              />
            </button>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onClear}>
          <Eraser data-icon="inline-start" /> Restablecer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FontFamilyMenu({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const fonts = [
    { label: "Predeterminada", value: "" },
    { label: "Inter", value: "Inter" },
    { label: "Georgia", value: "Georgia" },
    { label: "Arial", value: "Arial" },
    { label: "Monoespaciada", value: "monospace" },
  ];

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 px-2"
              title="Familia tipográfica"
              aria-label="Familia tipográfica"
            >
              <Type />
              <span className="hidden lg:inline">Fuente</span>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Familia tipográfica</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start">
        {fonts.map((font) => (
          <DropdownMenuItem
            key={font.label}
            onClick={() =>
              font.value
                ? editor.chain().focus().setFontFamily(font.value).run()
                : editor.chain().focus().unsetFontFamily().run()
            }
            style={font.value ? { fontFamily: font.value } : undefined}
          >
            {font.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BlockMenu({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const options = [
    {
      label: "Párrafo",
      active: editor.isActive("paragraph"),
      action: () => editor.chain().focus().setParagraph().run(),
    },
    {
      label: "Título 1",
      active: editor.isActive("heading", { level: 1 }),
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Título 2",
      active: editor.isActive("heading", { level: 2 }),
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Título 3",
      active: editor.isActive("heading", { level: 3 }),
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Cita",
      active: editor.isActive("blockquote"),
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Bloque de código",
      active: editor.isActive("codeBlock"),
      action: () => editor.chain().focus().toggleCodeBlock().run(),
    },
  ];
  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1 px-2"
                title="Tipo de bloque"
                aria-label="Tipo de bloque"
              >
                <Type />{" "}
                <span className="hidden sm:inline">
                  {options.find((option) => option.active)?.label ?? "Párrafo"}
                </span>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Tipo de bloque</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start">
          {options.map((option) => (
            <DropdownMenuItem key={option.label} onClick={option.action}>
              {option.active ? (
                <Check data-icon="inline-start" />
              ) : (
                <span className="size-4" />
              )}
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Acciones de tabla"
                aria-label="Acciones de tabla"
                disabled={!editor.isActive("table")}
              >
                <Table2 />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Acciones de tabla</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-100">
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addRowBefore().run()}
          >
            <ArrowUp data-icon="inline-start" />
            Agregar fila arriba
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <ArrowDown data-icon="inline-start" />
            Agregar fila abajo
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          >
            <Columns3 data-icon="inline-start" />
            Agregar columna antes
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <Columns3 data-icon="inline-start" />
            Agregar columna después
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            <Rows3 data-icon="inline-start" />
            Eliminar fila
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <Columns3 data-icon="inline-start" />
            Eliminar columna
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!editor.can().mergeCells()}
            onClick={() => editor.chain().focus().mergeCells().run()}
          >
            <Merge data-icon="inline-start" /> Combinar celdas seleccionadas
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!editor.can().splitCell()}
            onClick={() => editor.chain().focus().splitCell().run()}
          >
            <Unlink data-icon="inline-start" />
            Separar celda combinada
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!editor.can().mergeOrSplit()}
            onClick={() => editor.chain().focus().mergeOrSplit().run()}
          >
            <Merge data-icon="inline-start" />
            Combinar / separar celdas
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          >
            <PanelTop data-icon="inline-start" />
            Alternar encabezado de fila
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
          >
            <PanelLeft data-icon="inline-start" />
            Alternar encabezado de columna
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeaderCell().run()}
          >
            <TableProperties data-icon="inline-start" />
            Alternar celda de encabezado
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().fixTables().run()}
          >
            <Wrench data-icon="inline-start" />
            Reparar estructura de tabla
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <Trash2 data-icon="inline-start" />
            Eliminar tabla
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function ProjectNotesPage() {
  const { notes, tags, createNote, toggleNotePin, deleteNote } = useApp();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Note | null>(null);

  const visibleNotes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesQuery =
        !normalized ||
        `${note.title} ${note.contentMarkdown} ${note.tags.map((tag) => tag.name).join(" ")}`
          .toLowerCase()
          .includes(normalized);
      return (
        matchesQuery &&
        (tagFilter === null || note.tags.some((tag) => tag.id === tagFilter))
      );
    });
  }, [notes, query, tagFilter]);

  const create = async () => {
    if (!projectId) return;
    const note = await createNote({
      projectId: Number(projectId),
      title: "Sin título",
      contentJson: emptyDocument,
      contentMarkdown: "",
      pinned: false,
      tagIds: [],
    });
    navigate(`/projects/${projectId}/notes/${note.id}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Notas</h2>
          <p className="text-sm text-muted-foreground">
            Ideas, decisiones y documentación de{" "}
            {notes.length ? "este proyecto" : "tu proyecto"}.
          </p>
        </div>
        <Button size="sm" onClick={() => void create()}>
          <Plus data-icon="inline-start" /> Nueva nota
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        <Input
          aria-label="Buscar notas"
          placeholder="Buscar notas..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTagFilter(null)}
              className={cn(
                "rounded-4xl border px-2 py-0.5 text-xs font-medium",
                tagFilter === null
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              Todas
            </button>
            {tags.map((tag) => (
              <button
                type="button"
                key={tag.id}
                onClick={() =>
                  setTagFilter(tagFilter === tag.id ? null : tag.id)
                }
                aria-pressed={tagFilter === tag.id}
              >
                <TagBadge
                  tag={tag}
                  className={
                    tagFilter === tag.id ? "ring-2 ring-ring/50" : undefined
                  }
                />
              </button>
            ))}
          </div>
        )}
      </div>
      {visibleNotes.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <Save className="size-5 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">
            {notes.length ? "Sin resultados" : "Aún no hay notas"}
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {notes.length
              ? "Prueba con otra búsqueda o cambia el filtro."
              : "Crea una nota para guardar decisiones, comandos o documentación del proyecto."}
          </p>
          {!notes.length && (
            <Button onClick={() => void create()}>
              <Plus data-icon="inline-start" /> Crear primera nota
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleNotes.map((note, index) => (
            <article
              key={note.id}
              className="animate-rise-in rounded-xl border bg-card p-4 transition-colors hover:bg-muted/20"
              style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() =>
                    navigate(`/projects/${projectId}/notes/${note.id}`)
                  }
                >
                  <h3 className="truncate font-semibold">
                    {note.title || "Sin título"}
                  </h3>
                  <p className="mt-2 line-clamp-3 min-h-15 text-sm leading-relaxed text-muted-foreground">
                    {noteExcerpt(note)}
                  </p>
                </button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title={note.pinned ? "Desfijar nota" : "Fijar nota"}
                    onClick={() => void toggleNotePin(note.id)}
                  >
                    {note.pinned ? <PinOff /> : <Pin />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Eliminar nota"
                    onClick={() => setDeleting(note)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
                <div className="flex min-w-0 flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} />
                  ))}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(note.updatedAt)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta nota?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará «{deleting?.title}» de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                if (deleting) await deleteNote(deleting.id);
                setDeleting(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function ProjectNoteEditorPage() {
  const { noteId, projectId } = useParams();
  const navigate = useNavigate();
  const { notes, tags, updateNote, deleteNote } = useApp();
  const note = notes.find((item) => item.id === Number(noteId));
  const [title, setTitle] = useState(note?.title ?? "");
  const [tagIds, setTagIds] = useState<number[]>(
    note?.tags.map((tag) => tag.id) ?? [],
  );
  const selectedTags = tags.filter((tag) => tagIds.includes(tag.id));
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [deleting, setDeleting] = useState(false);
  const [, setEditorVersion] = useState(0);
  const [imageError, setImageError] = useState("");
  const latestSave = useRef(0);
  const pendingSave = useRef<NoteInput | null>(null);
  const saveTimer = useRef<number | null>(null);
  const currentNote = useRef(note);
  currentNote.current = note;

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setTagIds(note.tags.map((tag) => tag.id));
    }
  }, [note]);

  const save = useCallback(
    async (input: NoteInput) => {
      const saveId = ++latestSave.current;
      setSaveState("saving");
      try {
        const updated = await updateNote(Number(noteId), input);
        if (saveId === latestSave.current) {
          currentNote.current = updated;
          pendingSave.current = null;
          setSaveState("saved");
        }
      } catch {
        if (saveId === latestSave.current) setSaveState("error");
      }
    },
    [noteId, updateNote],
  );

  const scheduleSave = useCallback(
    (input: NoteInput) => {
      pendingSave.current = input;
      setSaveState("saving");
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        saveTimer.current = null;
        if (pendingSave.current) void save(pendingSave.current);
      }, 800);
    },
    [save],
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Superscript,
      Subscript,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: { class: "editor-image" },
      }),
      TableKit.configure({
        table: { resizable: true },
        tableCell: {},
        tableHeader: {},
        tableRow: {},
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      Typography,
      Placeholder.configure({
        placeholder: "Empieza a escribir la documentación de este proyecto...",
      }),
      Markdown.configure({ markedOptions: { gfm: true } }),
    ],
    content: note?.contentJson ?? emptyDocument,
    onUpdate: ({ editor: instance }) => {
      setEditorVersion((value) => value + 1);
      const current = currentNote.current;
      if (!current) return;
      scheduleSave({
        projectId: current.projectId,
        title,
        contentJson: instance.getJSON() as NoteInput["contentJson"],
        contentMarkdown: instance.getMarkdown(),
        pinned: current.pinned,
        tagIds,
      });
    },
  });

  useEffect(
    () => () => {
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
      if (pendingSave.current) void save(pendingSave.current);
    },
    [save],
  );

  if (!note || !editor)
    return (
      <div className="flex min-h-full items-center justify-center text-sm text-muted-foreground">
        Cargando nota...
      </div>
    );

  const updateMetadata = (
    nextTitle: string,
    nextTags: number[],
    pinned = note.pinned,
  ) => {
    setTitle(nextTitle);
    setTagIds(nextTags);
    scheduleSave({
      projectId: note.projectId,
      title: nextTitle,
      contentJson: editor.getJSON() as NoteInput["contentJson"],
      contentMarkdown: editor.getMarkdown(),
      pinned,
      tagIds: nextTags,
    });
  };

  const exportCurrent = () =>
    downloadMarkdown({ title, contentMarkdown: editor.getMarkdown() });
  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(editor.getMarkdown());
    setSaveState("saved");
  };
  const insertImage = () => {
    const url = window.prompt("URL de la imagen");
    if (!url?.trim()) return;
    try {
      const parsed = new URL(url.trim());
      if (!["http:", "https:"].includes(parsed.protocol))
        throw new Error("protocol");
      const alt =
        window.prompt("Texto alternativo", "Imagen de la nota") ||
        "Imagen de la nota";
      const probe = new window.Image();
      probe.onload = () => {
        editor.chain().focus().setImage({ src: parsed.toString(), alt }).run();
        setImageError("");
      };
      probe.onerror = () =>
        setImageError("No se pudo cargar la imagen desde esa URL.");
      probe.src = parsed.toString();
    } catch {
      setImageError("La URL de la imagen no es válida.");
    }
  };
  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const file = Array.from(event.clipboardData.items)
      .map((item) => item.getAsFile())
      .find((item): item is File => Boolean(item?.type.startsWith("image/")));
    if (!file) return;
    event.preventDefault();
    if (
      !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
        file.type,
      )
    ) {
      setImageError("Solo se permiten imágenes PNG, JPEG, GIF o WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("La imagen supera el límite de 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      editor
        .chain()
        .focus()
        .setImage({
          src: String(reader.result),
          alt: file.name || "Imagen pegada",
        })
        .run();
      setImageError("");
    };
    reader.readAsDataURL(file);
  };
  const remove = async () => {
    await deleteNote(note.id);
    navigate(`/projects/${projectId}/notes`);
  };

  return (
    <div className="-mx-6 -my-5 flex min-h-full flex-col bg-background">
      <div className="flex min-h-14 items-center gap-2 border-b px-4 py-2 sm:px-6">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => navigate(`/projects/${projectId}/notes`)}
        >
          <ArrowLeft data-icon="inline-start" />
        </Button>
        <Separator orientation="vertical" className="h-5 my-auto" />
        <Input
          value={title}
          aria-label="Título de la nota"
          placeholder="Sin título"
          onChange={(event) => updateMetadata(event.target.value, tagIds)}
          style={{
            width: `${Math.min(Math.max(title.trim().length + 2, 9), 32)}ch`,
          }}
          className="h-8 min-w-[9ch] max-w-[40vw] flex-none rounded-none border-0 border-b border-transparent bg-transparent px-1 text-base font-semibold shadow-none outline-none transition-colors dark:bg-transparent focus-visible:border-b-border focus-visible:bg-muted/20 focus-visible:ring-0"
        />
        <Separator orientation="vertical" className="h-5 my-auto" />
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
          Editada {formatUpdatedDate(note.updatedAt)}
        </span>
        <Separator orientation="vertical" className="h-5 my-auto" />
        {selectedTags.length > 0 && (
          <>
            <div
              className="flex min-w-0 max-w-48 items-center gap-1 overflow-hidden sm:max-w-64"
              aria-label="Etiquetas de la nota"
            >
              {selectedTags.map((tag) => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  className="max-w-28 truncate"
                />
              ))}
            </div>
          </>
        )}
        <div className="ml-auto flex items-center gap-1">
          <span className="mr-2 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            {saveState === "saving" ? (
              "Guardando..."
            ) : saveState === "error" ? (
              <>
                <span className="text-destructive">No se pudo guardar</span>
                <button
                  type="button"
                  className="underline"
                  onClick={() =>
                    pendingSave.current && void save(pendingSave.current)
                  }
                >
                  Reintentar
                </button>
              </>
            ) : (
              "Guardado"
            )}
          </span>
          <TagPopover
            selected={tagIds}
            onChange={(next) => updateMetadata(title, next)}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            title={note.pinned ? "Desfijar nota" : "Fijar nota"}
            onClick={() => updateMetadata(title, tagIds, !note.pinned)}
          >
            {note.pinned ? <PinOff /> : <Pin />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                title="Acciones de la nota"
              >
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={exportCurrent}>
                <Download data-icon="inline-start" /> Exportar .md
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void copyMarkdown()}>
                <CopyIcon data-icon="inline-start" /> Copiar Markdown
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleting(true)}
              >
                <Trash2 data-icon="inline-start" /> Eliminar nota
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="border-b px-4 py-2 sm:px-6">
        <TooltipProvider delayDuration={300}>
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-0.5 overflow-x-auto">
            <ToolbarButton
              label="Deshacer"
              disabled={!editor.can().undo()}
              onClick={() => editor.chain().focus().undo().run()}
            >
              <Undo2 />
            </ToolbarButton>
            <ToolbarButton
              label="Rehacer"
              disabled={!editor.can().redo()}
              onClick={() => editor.chain().focus().redo().run()}
            >
              <Redo2 />
            </ToolbarButton>
            <ToolbarDivider />
            <BlockMenu editor={editor} />
            <FontFamilyMenu editor={editor} />
            <ToolbarButton
              label="Línea horizontal"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              <Minus />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton
              label="Negrita"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold />
            </ToolbarButton>
            <ToolbarButton
              label="Cursiva"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic />
            </ToolbarButton>
            <ToolbarButton
              label="Subrayado"
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon />
            </ToolbarButton>
            <ToolbarButton
              label="Tachado"
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough />
            </ToolbarButton>
            <ToolbarButton
              label="Bloque de código"
              active={editor.isActive("codeBlock")}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <FileCode2 />
            </ToolbarButton>
            <ToolbarButton
              label="Código inline"
              active={editor.isActive("code")}
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code />
            </ToolbarButton>
            <ToolbarButton
              label="Superíndice"
              active={editor.isActive("superscript")}
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
            >
              <SuperscriptIcon />
            </ToolbarButton>
            <ToolbarButton
              label="Subíndice"
              active={editor.isActive("subscript")}
              onClick={() => editor.chain().focus().toggleSubscript().run()}
            >
              <SubscriptIcon />
            </ToolbarButton>
            <ColorMenu
              label="Color de texto"
              icon={<Paintbrush />}
              colors={EDITOR_COLORS}
              onSelect={(color) => editor.chain().focus().setColor(color).run()}
              onClear={() => editor.chain().focus().unsetColor().run()}
            />
            <ColorMenu
              label="Resaltado"
              icon={<Highlighter />}
              colors={HIGHLIGHT_COLORS}
              onSelect={(color) =>
                editor.chain().focus().toggleHighlight({ color }).run()
              }
              onClear={() => editor.chain().focus().unsetHighlight().run()}
            />
            <ToolbarDivider />
            <ToolbarButton
              label="Lista con viñetas"
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List />
            </ToolbarButton>
            <ToolbarButton
              label="Lista numerada"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered />
            </ToolbarButton>
            <ToolbarButton
              label="Lista de tareas"
              active={editor.isActive("taskList")}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
            >
              <CheckSquare />
            </ToolbarButton>
            <ToolbarButton
              label="Cita"
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton
              label="Insertar tabla"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
            >
              <Table2 />
            </ToolbarButton>
            <ToolbarButton
              label="Insertar enlace"
              active={editor.isActive("link")}
              onClick={() => {
                const href = window.prompt(
                  "URL del enlace",
                  editor.getAttributes("link").href || "https://",
                );
                if (href) editor.chain().focus().setLink({ href }).run();
              }}
            >
              <LinkIcon />
            </ToolbarButton>
            <ToolbarButton
              label="Quitar enlace"
              disabled={!editor.isActive("link")}
              onClick={() => editor.chain().focus().unsetLink().run()}
            >
              <Unlink />
            </ToolbarButton>
            <ToolbarButton label="Insertar imagen" onClick={insertImage}>
              <ImagePlus />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton
              label="Alinear a la izquierda"
              active={editor.isActive({ textAlign: "left" })}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft />
            </ToolbarButton>
            <ToolbarButton
              label="Centrar"
              active={editor.isActive({ textAlign: "center" })}
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
            >
              <AlignCenter />
            </ToolbarButton>
            <ToolbarButton
              label="Alinear a la derecha"
              active={editor.isActive({ textAlign: "right" })}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight />
            </ToolbarButton>
            <ToolbarButton
              label="Justificar"
              active={editor.isActive({ textAlign: "justify" })}
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
            >
              <AlignJustify />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton
              label="Limpiar formato"
              onClick={() =>
                editor.chain().focus().clearNodes().unsetAllMarks().run()
              }
            >
              <WandSparkles />
            </ToolbarButton>
          </div>
        </TooltipProvider>
      </div>
      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-6xl" onPaste={handlePaste}>
          {imageError && (
            <p
              role="alert"
              className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {imageError}
            </p>
          )}
          <EditorContent editor={editor} />
          <div className="mt-6 flex justify-end text-xs text-muted-foreground">
            {editor.storage.characterCount.words()} palabras ·{" "}
            {editor.storage.characterCount.characters()} caracteres
          </div>
        </div>
      </main>
      <AlertDialog open={deleting} onOpenChange={setDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta nota?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void remove()}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
